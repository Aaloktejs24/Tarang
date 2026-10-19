package admission

import (
	"context"
	"fmt"
	"time"

	"backend/proto/admissionpb"

	"github.com/redis/go-redis/v9"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"google.golang.org/protobuf/encoding/protojson"
)

type Repository interface {
	CreateProgram(ctx context.Context, prog *admissionpb.Program) error
	UpdateProgram(ctx context.Context, prog *admissionpb.Program) error
	GetProgramByID(ctx context.Context, id string) (*admissionpb.Program, error)
	GetProgramsByInstitute(ctx context.Context, instituteID string) ([]*admissionpb.Program, error)
	DeleteProgram(ctx context.Context, id string) error

	// Drafts
	SaveDraft(ctx context.Context, draft *admissionpb.Draft) error
	GetDrafts(ctx context.Context, instituteID string) ([]*admissionpb.Draft, error)
	DeleteDraft(ctx context.Context, instituteID string, draftID string) error

	// Applications & Progress Tracking
	ApplyForProgram(ctx context.Context, app *admissionpb.Application, firstTx *admissionpb.Transaction) error
	UpdateApplicationProgress(ctx context.Context, appID string, newStageIdx int32, newStatus string, txRecord *admissionpb.Transaction) error
	GetApplicationHistory(ctx context.Context, applicationID string) ([]*admissionpb.Transaction, *admissionpb.Application, error)
	GetUserApplications(ctx context.Context, userID string) ([]*admissionpb.Application, error)
	GetInstituteApplications(ctx context.Context, instituteID string) ([]*admissionpb.Application, error)
	DeleteApplication(ctx context.Context, applicationID string) error

	// Background Jobs
	DeleteOldDrafts(ctx context.Context, cutoffTime time.Time) (int64, error)
	GetAbandonedApplications(ctx context.Context, cutoffTime time.Time) ([]*admissionpb.Application, error)
}

type repository struct {
	db          *mongo.Database
	redisClient *redis.Client
}

func NewRepository(db *mongo.Database, redisClient *redis.Client) Repository {
	return &repository{db: db, redisClient: redisClient}
}

// ---------------------------------------------------------
// Programs
// ---------------------------------------------------------
func (r *repository) CreateProgram(ctx context.Context, prog *admissionpb.Program) error {
	col := r.db.Collection("programs")
	_, err := col.InsertOne(ctx, prog)
	return err
}

func (r *repository) UpdateProgram(ctx context.Context, prog *admissionpb.Program) error {
	col := r.db.Collection("programs")
	filter := bson.M{"id": prog.Id}

	raw, err := bson.Marshal(prog)
	if err != nil {
		return fmt.Errorf("failed to marshal program: %w", err)
	}
	var updateDoc bson.M
	if err := bson.Unmarshal(raw, &updateDoc); err != nil {
		return fmt.Errorf("failed to unmarshal program: %w", err)
	}
	// Do not update the id field itself or _id
	delete(updateDoc, "_id")
	delete(updateDoc, "id")

	res, err := col.UpdateOne(ctx, filter, bson.M{"$set": updateDoc})
	if err != nil {
		return err
	}
	if res.MatchedCount == 0 {
		return fmt.Errorf("program not found")
	}
	return nil
}


func (r *repository) GetProgramByID(ctx context.Context, id string) (*admissionpb.Program, error) {
	col := r.db.Collection("programs")
	var prog admissionpb.Program
	err := col.FindOne(ctx, bson.M{"id": id}).Decode(&prog)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, fmt.Errorf("program not found")
		}
		return nil, err
	}
	return &prog, nil
}

func (r *repository) GetProgramsByInstitute(ctx context.Context, instituteID string) ([]*admissionpb.Program, error) {
	col := r.db.Collection("programs")
	cursor, err := col.Find(ctx, bson.M{"instituteid": instituteID})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var programs []*admissionpb.Program
	if err = cursor.All(ctx, &programs); err != nil {
		return nil, err
	}
	if programs == nil {
		programs = []*admissionpb.Program{}
	}
	return programs, nil
}

func (r *repository) DeleteProgram(ctx context.Context, id string) error {
	col := r.db.Collection("programs")
	res, err := col.DeleteOne(ctx, bson.M{"id": id})
	if err != nil {
		return err
	}
	if res.DeletedCount == 0 {
		return fmt.Errorf("program not found: %s", id)
	}
	return nil
}

// ---------------------------------------------------------
// Drafts
// ---------------------------------------------------------
func (r *repository) SaveDraft(ctx context.Context, draft *admissionpb.Draft) error {
	key := fmt.Sprintf("draft:%s:%s", draft.InstituteId, draft.Id)
	data, err := protojson.Marshal(draft)
	if err != nil {
		return err
	}
	// Set 30-day TTL for auto-cleanup
	return r.redisClient.Set(ctx, key, data, 30*24*time.Hour).Err()
}

func (r *repository) GetDrafts(ctx context.Context, instituteID string) ([]*admissionpb.Draft, error) {
	pattern := fmt.Sprintf("draft:%s:*", instituteID)
	
	keys, err := r.redisClient.Keys(ctx, pattern).Result()
	if err != nil {
		return nil, err
	}
	
	var drafts []*admissionpb.Draft
	if len(keys) == 0 {
		return []*admissionpb.Draft{}, nil
	}
	
	vals, err := r.redisClient.MGet(ctx, keys...).Result()
	if err != nil {
		return nil, err
	}
	
	for _, v := range vals {
		if strVal, ok := v.(string); ok {
			var draft admissionpb.Draft
			if err := protojson.Unmarshal([]byte(strVal), &draft); err == nil {
				drafts = append(drafts, &draft)
			}
		}
	}
	return drafts, nil
}

func (r *repository) DeleteDraft(ctx context.Context, instituteID string, draftID string) error {
	key := fmt.Sprintf("draft:%s:%s", instituteID, draftID)
	return r.redisClient.Del(ctx, key).Err()
}

// ---------------------------------------------------------
// Applications & History
// ---------------------------------------------------------
func (r *repository) ApplyForProgram(ctx context.Context, app *admissionpb.Application, firstTx *admissionpb.Transaction) error {
	now := time.Now().UTC().Format(time.RFC3339)
	app.CreatedAt = now
	app.UpdatedAt = now
	firstTx.CreatedAt = now

	// Insert into two collections sequentially (or use a Mongo session if replica set is guaranteed)
	appCol := r.db.Collection("applications")
	_, err := appCol.InsertOne(ctx, app)
	if err != nil {
		return fmt.Errorf("failed to insert application: %v", err)
	}

	txCol := r.db.Collection("transactions")
	_, err = txCol.InsertOne(ctx, firstTx)
	if err != nil {
		return fmt.Errorf("failed to insert transaction log: %v", err)
	}
	return nil
}

func (r *repository) UpdateApplicationProgress(ctx context.Context, appID string, newStageIdx int32, newStatus string, txRecord *admissionpb.Transaction) error {
	now := time.Now().UTC().Format(time.RFC3339)
	txRecord.CreatedAt = now

	appCol := r.db.Collection("applications")
	update := bson.M{
		"$set": bson.M{
			"currentstageindex": newStageIdx,
			"status":            newStatus,
			"updatedat":         now,
		},
	}
	_, err := appCol.UpdateOne(ctx, bson.M{"id": appID}, update)
	if err != nil {
		return fmt.Errorf("failed to update application state: %v", err)
	}

	txCol := r.db.Collection("transactions")
	
	if txRecord.ActionType == "AUTO_SAVE" {
		opts := options.FindOne().SetSort(bson.M{"createdat": -1})
		var latestTx admissionpb.Transaction
		err := txCol.FindOne(ctx, bson.M{
			"applicationid": txRecord.ApplicationId,
			"actiontype":    "AUTO_SAVE",
		}, opts).Decode(&latestTx)
		
		if err == nil && latestTx.Id != "" {
			_, err = txCol.UpdateOne(ctx, bson.M{"id": latestTx.Id}, bson.M{
				"$set": bson.M{
					"metadata":  txRecord.Metadata,
					"createdat": now,
				},
			})
			if err == nil {
				return nil
			}
		}
	}

	_, err = txCol.InsertOne(ctx, txRecord)
	if err != nil {
		return fmt.Errorf("failed to insert progress transaction: %v", err)
	}
	return nil
}

func (r *repository) GetApplicationHistory(ctx context.Context, applicationID string) ([]*admissionpb.Transaction, *admissionpb.Application, error) {
	appCol := r.db.Collection("applications")
	var app admissionpb.Application
	err := appCol.FindOne(ctx, bson.M{"id": applicationID}).Decode(&app)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil, fmt.Errorf("application not found")
		}
		return nil, nil, err
	}

	prog, err := r.GetProgramByID(ctx, app.ProgramId)
	if err == nil {
		app.Program = prog
	}

	txCol := r.db.Collection("transactions")
	opts := options.Find().SetSort(bson.M{"createdat": 1})
	cursor, err := txCol.Find(ctx, bson.M{"applicationid": applicationID}, opts)
	if err != nil {
		return nil, nil, err
	}
	defer cursor.Close(ctx)

	var transactions []*admissionpb.Transaction
	if err = cursor.All(ctx, &transactions); err != nil {
		return nil, nil, err
	}
	if transactions == nil {
		transactions = []*admissionpb.Transaction{}
	}

	return transactions, &app, nil
}

func (r *repository) GetUserApplications(ctx context.Context, userID string) ([]*admissionpb.Application, error) {
	appCol := r.db.Collection("applications")
	opts := options.Find().SetSort(bson.M{"updatedat": -1})
	cursor, err := appCol.Find(ctx, bson.M{"userid": userID}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var apps []*admissionpb.Application
	if err = cursor.All(ctx, &apps); err != nil {
		return nil, err
	}
	if apps == nil {
		apps = []*admissionpb.Application{}
	}

	txCol := r.db.Collection("transactions")
	for _, app := range apps {
		prog, _ := r.GetProgramByID(ctx, app.ProgramId)
		app.Program = prog

		var latestTx admissionpb.Transaction
		txOpts := options.FindOne().SetSort(bson.M{"createdat": -1})
		if err := txCol.FindOne(ctx, bson.M{"applicationid": app.Id, "actorid": userID}, txOpts).Decode(&latestTx); err == nil {
			app.SubmittedData = latestTx.Metadata
		}
	}

	return apps, nil
}

func (r *repository) GetInstituteApplications(ctx context.Context, instituteID string) ([]*admissionpb.Application, error) {
	appCol := r.db.Collection("applications")
	opts := options.Find().SetSort(bson.M{"updatedat": -1})
	cursor, err := appCol.Find(ctx, bson.M{"instituteid": instituteID}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var apps []*admissionpb.Application
	if err = cursor.All(ctx, &apps); err != nil {
		return nil, err
	}
	if apps == nil {
		apps = []*admissionpb.Application{}
	}

	txCol := r.db.Collection("transactions")
	for _, app := range apps {
		prog, _ := r.GetProgramByID(ctx, app.ProgramId)
		app.Program = prog

		var latestTx admissionpb.Transaction
		txOpts := options.FindOne().SetSort(bson.M{"createdat": -1})
		if err := txCol.FindOne(ctx, bson.M{"applicationid": app.Id, "actorid": app.UserId}, txOpts).Decode(&latestTx); err == nil {
			app.SubmittedData = latestTx.Metadata
		}
	}

	return apps, nil
}

// ---------------------------------------------------------
// Background Cleanup
// ---------------------------------------------------------

func (r *repository) DeleteOldDrafts(ctx context.Context, cutoffTime time.Time) (int64, error) {
	// No-op: Redis handles draft TTL natively via expiration.
	// We no longer need to manually delete old drafts from MongoDB.
	return 0, nil
}

func (r *repository) GetAbandonedApplications(ctx context.Context, cutoffTime time.Time) ([]*admissionpb.Application, error) {
	col := r.db.Collection("applications")
	cutoffStr := cutoffTime.UTC().Format(time.RFC3339)
	
	filter := bson.M{
		"status":    "draft",
		"updatedat": bson.M{"$lt": cutoffStr},
	}
	
	cursor, err := col.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	
	var apps []*admissionpb.Application
	if err = cursor.All(ctx, &apps); err != nil {
		return nil, err
	}
	if apps == nil {
		apps = []*admissionpb.Application{}
	}
	return apps, nil
}

func (r *repository) DeleteApplication(ctx context.Context, applicationID string) error {
	// Delete transactions
	txCol := r.db.Collection("application_progress")
	_, err := txCol.DeleteMany(ctx, bson.M{"applicationid": applicationID})
	if err != nil {
		return err
	}

	// Delete application
	appCol := r.db.Collection("applications")
	_, err = appCol.DeleteOne(ctx, bson.M{"id": applicationID})
	if err != nil {
		return err
	}

	return nil
}
