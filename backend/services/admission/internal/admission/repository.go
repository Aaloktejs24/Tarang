package admission

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"backend/proto/admissionpb"
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

	// Applications & Progress Tracking (ACID)
	ApplyForProgram(ctx context.Context, app *admissionpb.Application, firstTx *admissionpb.Transaction) error
	UpdateApplicationProgress(ctx context.Context, appID string, newStageIdx int32, newStatus string, txRecord *admissionpb.Transaction) error
	GetApplicationHistory(ctx context.Context, applicationID string) ([]*admissionpb.Transaction, *admissionpb.Application, error)
	GetUserApplications(ctx context.Context, userID string) ([]*admissionpb.Application, error)
	GetInstituteApplications(ctx context.Context, instituteID string) ([]*admissionpb.Application, error)
}

type repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) Repository {
	return &repository{db: db}
}

func (r *repository) CreateProgram(ctx context.Context, prog *admissionpb.Program) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback() }()

	query := `
		INSERT INTO admission_programs (
			id, institute_id, workflow_title, workflow_desc, image_url,
			last_date, seats, academic_year, eligibility, fees, duration, publish_date
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`

	_, err = tx.ExecContext(ctx, query,
		prog.Id, prog.InstituteId, prog.WorkflowTitle, prog.WorkflowDesc, prog.ImageUrl,
		prog.LastDate, prog.Seats, prog.AcademicYear, prog.Eligibility, prog.Fees, prog.Duration, prog.PublishDate,
	)
	if err != nil {
		return fmt.Errorf("failed to insert program: %v", err)
	}

	for i, stage := range prog.Stages {
		reqBytes, _ := json.Marshal(stage.Requirements)
		quizBytes, _ := json.Marshal(stage.QuizAttachments)

		var pAmt float64
		var pCurr string
		if stage.PaymentDetails != nil {
			pAmt = stage.PaymentDetails.Amount
			pCurr = stage.PaymentDetails.Currency
		}

		var iLink, iPasscode string
		if stage.InterviewDetails != nil {
			iLink = stage.InterviewDetails.MeetingLink
			iPasscode = stage.InterviewDetails.Passcode
		}

		stageQuery := `
			INSERT INTO admission_stages (
				program_id, stage_order, title, type, requirements, quiz_attachments,
				start_date, end_date, start_date_only, start_time_only, end_date_only, end_time_only,
				interview_meeting_link, interview_passcode, payment_amount, payment_currency,
				selected_fields, academic_records_config
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`
			
		sfBytes, _ := json.Marshal(stage.SelectedFields)
		arcBytes, _ := json.Marshal(stage.AcademicRecordsConfig)

		_, err = tx.ExecContext(ctx, stageQuery,
			prog.Id, i+1, stage.Title, stage.Type, reqBytes, quizBytes,
			stage.StartDate, stage.EndDate, stage.StartDateOnly, stage.StartTimeOnly, stage.EndDateOnly, stage.EndTimeOnly,
			iLink, iPasscode, pAmt, pCurr, sfBytes, arcBytes,
		)
		if err != nil {
			return fmt.Errorf("failed to insert stage: %v", err)
		}
	}

	return tx.Commit()
}

func (r *repository) UpdateProgram(ctx context.Context, prog *admissionpb.Program) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback() }()

	query := `
		UPDATE admission_programs SET
			institute_id = $2, workflow_title = $3, workflow_desc = $4, image_url = $5,
			last_date = $6, seats = $7, academic_year = $8, eligibility = $9, fees = $10, duration = $11, publish_date = $12
		WHERE id = $1`

	_, err = tx.ExecContext(ctx, query,
		prog.Id, prog.InstituteId, prog.WorkflowTitle, prog.WorkflowDesc, prog.ImageUrl,
		prog.LastDate, prog.Seats, prog.AcademicYear, prog.Eligibility, prog.Fees, prog.Duration, prog.PublishDate,
	)
	if err != nil {
		return fmt.Errorf("failed to update program: %v", err)
	}

	// Delete existing stages
	deleteStagesQuery := `DELETE FROM admission_stages WHERE program_id = $1`
	_, err = tx.ExecContext(ctx, deleteStagesQuery, prog.Id)
	if err != nil {
		return fmt.Errorf("failed to delete old stages: %v", err)
	}

	// Insert new stages
	for i, stage := range prog.Stages {
		reqBytes, _ := json.Marshal(stage.Requirements)
		quizBytes, _ := json.Marshal(stage.QuizAttachments)

		var pAmt float64
		var pCurr string
		if stage.PaymentDetails != nil {
			pAmt = stage.PaymentDetails.Amount
			pCurr = stage.PaymentDetails.Currency
		}

		var iLink, iPasscode string
		if stage.InterviewDetails != nil {
			iLink = stage.InterviewDetails.MeetingLink
			iPasscode = stage.InterviewDetails.Passcode
		}

		stageQuery := `
			INSERT INTO admission_stages (
				program_id, stage_order, title, type, requirements, quiz_attachments,
				start_date, end_date, start_date_only, start_time_only, end_date_only, end_time_only,
				interview_meeting_link, interview_passcode, payment_amount, payment_currency,
				selected_fields, academic_records_config
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`
			
		sfBytes, _ := json.Marshal(stage.SelectedFields)
		arcBytes, _ := json.Marshal(stage.AcademicRecordsConfig)

		_, err = tx.ExecContext(ctx, stageQuery,
			prog.Id, i+1, stage.Title, stage.Type, reqBytes, quizBytes,
			stage.StartDate, stage.EndDate, stage.StartDateOnly, stage.StartTimeOnly, stage.EndDateOnly, stage.EndTimeOnly,
			iLink, iPasscode, pAmt, pCurr, sfBytes, arcBytes,
		)
		if err != nil {
			return fmt.Errorf("failed to insert stage: %v", err)
		}
	}

	return tx.Commit()
}

func (r *repository) GetProgramByID(ctx context.Context, id string) (*admissionpb.Program, error) {
	query := `
		SELECT id, institute_id, workflow_title, workflow_desc, image_url,
			last_date, seats, academic_year, eligibility, fees, duration, publish_date
		FROM admission_programs WHERE id = $1`

	prog := &admissionpb.Program{}
	var imgUrl, lastDate, academicYear, eligibility, fees, duration, pubDate sql.NullString
	var seats sql.NullInt32
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&prog.Id, &prog.InstituteId, &prog.WorkflowTitle, &prog.WorkflowDesc, &imgUrl,
		&lastDate, &seats, &academicYear, &eligibility, &fees, &duration, &pubDate,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("program not found")
		}
		return nil, err
	}
	
	if imgUrl.Valid { prog.ImageUrl = imgUrl.String }
	if lastDate.Valid { prog.LastDate = lastDate.String }
	if seats.Valid { prog.Seats = seats.Int32 }
	if academicYear.Valid { prog.AcademicYear = academicYear.String }
	if eligibility.Valid { prog.Eligibility = eligibility.String }
	if fees.Valid { prog.Fees = fees.String }
	if duration.Valid { prog.Duration = duration.String }
	if pubDate.Valid { prog.PublishDate = pubDate.String }

	prog.Stages, err = r.getStagesForProgram(ctx, prog.Id)
	if err != nil {
		return nil, err
	}

	return prog, nil
}

func (r *repository) GetProgramsByInstitute(ctx context.Context, instituteID string) ([]*admissionpb.Program, error) {
	query := `
		SELECT id, institute_id, workflow_title, workflow_desc, image_url,
			last_date, seats, academic_year, eligibility, fees, duration, publish_date
		FROM admission_programs WHERE institute_id = $1 ORDER BY created_at DESC`

	rows, err := r.db.QueryContext(ctx, query, instituteID)
	if err != nil {
		return nil, err
	}
	defer func() { _ = rows.Close() }()

	var programs []*admissionpb.Program
	for rows.Next() {
		prog := &admissionpb.Program{}
		var imgUrl, lastDate, academicYear, eligibility, fees, duration, pubDate sql.NullString
		var seats sql.NullInt32
		err := rows.Scan(
			&prog.Id, &prog.InstituteId, &prog.WorkflowTitle, &prog.WorkflowDesc, &imgUrl,
			&lastDate, &seats, &academicYear, &eligibility, &fees, &duration, &pubDate,
		)
		if err != nil {
			return nil, err
		}
		
		if imgUrl.Valid { prog.ImageUrl = imgUrl.String }
		if lastDate.Valid { prog.LastDate = lastDate.String }
		if seats.Valid { prog.Seats = seats.Int32 }
		if academicYear.Valid { prog.AcademicYear = academicYear.String }
		if eligibility.Valid { prog.Eligibility = eligibility.String }
		if fees.Valid { prog.Fees = fees.String }
		if duration.Valid { prog.Duration = duration.String }
		if pubDate.Valid { prog.PublishDate = pubDate.String }

		// Typically we might not need to load all stages for listing, but let's do it for completeness
		prog.Stages, err = r.getStagesForProgram(ctx, prog.Id)
		if err != nil {
			return nil, err
		}
		
		programs = append(programs, prog)
	}

	return programs, nil
}

func (r *repository) getStagesForProgram(ctx context.Context, programID string) ([]*admissionpb.Stage, error) {
	query := `
		SELECT id, title, type, requirements, quiz_attachments,
			COALESCE(payment_amount, 0) as payment_amount, COALESCE(payment_currency, '') as payment_currency,
			COALESCE(start_date, '') as start_date, COALESCE(end_date, '') as end_date,
			COALESCE(start_date_only, '') as start_date_only, COALESCE(start_time_only, '') as start_time_only,
			COALESCE(end_date_only, '') as end_date_only, COALESCE(end_time_only, '') as end_time_only,
			COALESCE(interview_meeting_link, '') as interview_meeting_link,
			COALESCE(interview_passcode, '') as interview_passcode,
			COALESCE(selected_fields, '[]'::jsonb) as selected_fields,
			COALESCE(academic_records_config, '[]'::jsonb) as academic_records_config
		FROM admission_stages WHERE program_id = $1 ORDER BY stage_order ASC`

	rows, err := r.db.QueryContext(ctx, query, programID)
	if err != nil {
		return nil, err
	}
	defer func() { _ = rows.Close() }()

	var stages []*admissionpb.Stage
	for rows.Next() {
		stage := &admissionpb.Stage{}
		var reqBytes, quizBytes, sfBytes, arcBytes []byte
		var pAmt float64
		var pCurr string
		var iLink, iPasscode string
		
		err := rows.Scan(
			&stage.Id, &stage.Title, &stage.Type, &reqBytes, &quizBytes,
			&pAmt, &pCurr,
			&stage.StartDate, &stage.EndDate,
			&stage.StartDateOnly, &stage.StartTimeOnly,
			&stage.EndDateOnly, &stage.EndTimeOnly,
			&iLink, &iPasscode,
			&sfBytes, &arcBytes,
		)
		if err != nil {
			return nil, err
		}
		
		if len(reqBytes) > 0 {
			_ = json.Unmarshal(reqBytes, &stage.Requirements)
		}
		
		if len(quizBytes) > 0 {
			_ = json.Unmarshal(quizBytes, &stage.QuizAttachments)
		}

		if len(sfBytes) > 0 {
			_ = json.Unmarshal(sfBytes, &stage.SelectedFields)
		}

		if len(arcBytes) > 0 {
			_ = json.Unmarshal(arcBytes, &stage.AcademicRecordsConfig)
		}

		if pAmt > 0 || pCurr != "" {
			stage.PaymentDetails = &admissionpb.PaymentDetails{
				Amount:   pAmt,
				Currency: pCurr,
			}
		}

		if iLink != "" || iPasscode != "" {
			stage.InterviewDetails = &admissionpb.InterviewDetails{
				MeetingLink: iLink,
				Passcode:    iPasscode,
			}
		}
		
		stages = append(stages, stage)
	}
	return stages, nil
}

func (r *repository) DeleteProgram(ctx context.Context, id string) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback() }()

	// Delete stages first (if not cascading)
	_, err = tx.ExecContext(ctx, "DELETE FROM admission_stages WHERE program_id = $1", id)
	if err != nil {
		return fmt.Errorf("failed to delete program stages: %v", err)
	}

	// Delete program
	res, err := tx.ExecContext(ctx, "DELETE FROM admission_programs WHERE id = $1", id)
	if err != nil {
		return fmt.Errorf("failed to delete program: %v", err)
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return fmt.Errorf("program with id %s not found", id)
	}

	return tx.Commit()
}

// Draft Implementations
func (r *repository) SaveDraft(ctx context.Context, draft *admissionpb.Draft) error {
	query := `
		INSERT INTO admission_program_drafts (id, institute_id, program_id, draft_data, updated_at)
		VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
		ON CONFLICT (id) DO UPDATE SET
			institute_id = EXCLUDED.institute_id,
			program_id = EXCLUDED.program_id,
			draft_data = EXCLUDED.draft_data,
			updated_at = CURRENT_TIMESTAMP`

	var pid sql.NullString
	if draft.ProgramId != "" {
		pid.String = draft.ProgramId
		pid.Valid = true
	}

	_, err := r.db.ExecContext(ctx, query, draft.Id, draft.InstituteId, pid, draft.DraftData)
	return err
}

func (r *repository) GetDrafts(ctx context.Context, instituteID string) ([]*admissionpb.Draft, error) {
	query := `
		SELECT id, institute_id, program_id, draft_data, created_at, updated_at
		FROM admission_program_drafts
		WHERE institute_id = $1
		ORDER BY updated_at DESC`

	rows, err := r.db.QueryContext(ctx, query, instituteID)
	if err != nil {
		return nil, err
	}
	defer func() { _ = rows.Close() }()

	var drafts []*admissionpb.Draft
	for rows.Next() {
		draft := &admissionpb.Draft{}
		var pid sql.NullString
		var ca, ua sql.NullString
		if err := rows.Scan(&draft.Id, &draft.InstituteId, &pid, &draft.DraftData, &ca, &ua); err != nil {
			return nil, err
		}
		if pid.Valid {
			draft.ProgramId = pid.String
		}
		if ca.Valid { draft.CreatedAt = ca.String }
		if ua.Valid { draft.UpdatedAt = ua.String }
		drafts = append(drafts, draft)
	}

	return drafts, nil
}

func (r *repository) DeleteDraft(ctx context.Context, instituteID string, draftID string) error {
	_, err := r.db.ExecContext(ctx, "DELETE FROM admission_program_drafts WHERE institute_id = $1 AND id = $2", instituteID, draftID)
	return err
}

// Application & Progress Implementations
func (r *repository) ApplyForProgram(ctx context.Context, app *admissionpb.Application, firstTx *admissionpb.Transaction) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback() }()

	// 1. Create a fresh Application with a sequence-generated ID
	// Due to the partial unique index, this will fail if the user already has an active application.
	appQuery := `
		INSERT INTO admission_applications (id, user_id, institute_id, program_id, current_stage_index, status)
		VALUES ('APP-' || nextval('application_number_seq')::text, $1, $2, $3, $4, $5)
		RETURNING id`
	
	err = tx.QueryRowContext(ctx, appQuery, 
		app.UserId, app.InstituteId, app.ProgramId, app.CurrentStageIndex, app.Status,
	).Scan(&app.Id)
	if err != nil {
		return fmt.Errorf("failed to insert/update application: %v", err)
	}

	firstTx.ApplicationId = app.Id

	// 2. Insert the First Transaction Log (The ACID ledger entry)
	txQuery := `
		INSERT INTO admission_transactions (id, application_id, actor_id, action_type, metadata)
		VALUES ($1, $2, $3, $4, $5)`
	
	_, err = tx.ExecContext(ctx, txQuery,
		firstTx.Id, firstTx.ApplicationId, firstTx.ActorId, firstTx.ActionType, firstTx.Metadata,
	)
	if err != nil {
		return fmt.Errorf("failed to insert transaction log: %v", err)
	}

	return tx.Commit()
}

func (r *repository) UpdateApplicationProgress(ctx context.Context, appID string, newStageIdx int32, newStatus string, txRecord *admissionpb.Transaction) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback() }()

	// 1. Update the Application state
	appQuery := `
		UPDATE admission_applications 
		SET current_stage_index = $1, status = $2, updated_at = CURRENT_TIMESTAMP
		WHERE id = $3`
	
	_, err = tx.ExecContext(ctx, appQuery, newStageIdx, newStatus, appID)
	if err != nil {
		return fmt.Errorf("failed to update application state: %v", err)
	}

	// 2. Insert or Update the Transaction Log
	if txRecord.ActionType == "AUTO_SAVE" {
		updateQuery := `
			UPDATE admission_transactions
			SET metadata = $1, created_at = CURRENT_TIMESTAMP
			WHERE id = (
				SELECT id FROM admission_transactions
				WHERE application_id = $2 AND action_type = 'AUTO_SAVE'
				ORDER BY created_at DESC LIMIT 1
			)`
		res, err := tx.ExecContext(ctx, updateQuery, txRecord.Metadata, txRecord.ApplicationId)
		if err != nil {
			return fmt.Errorf("failed to update auto-save transaction: %v", err)
		}
		rowsAffected, _ := res.RowsAffected()
		if rowsAffected > 0 {
			// Successfully updated existing AUTO_SAVE, skip insert
			return tx.Commit()
		}
	}

	txQuery := `
		INSERT INTO admission_transactions (id, application_id, actor_id, action_type, metadata)
		VALUES ($1, $2, $3, $4, $5)`
	
	_, err = tx.ExecContext(ctx, txQuery,
		txRecord.Id, txRecord.ApplicationId, txRecord.ActorId, txRecord.ActionType, txRecord.Metadata,
	)
	if err != nil {
		return fmt.Errorf("failed to insert progress transaction: %v", err)
	}

	return tx.Commit()
}

func (r *repository) GetApplicationHistory(ctx context.Context, applicationID string) ([]*admissionpb.Transaction, *admissionpb.Application, error) {
	// Get Application
	appQuery := `
		SELECT id, user_id, institute_id, program_id, current_stage_index, status, created_at, updated_at 
		FROM admission_applications WHERE id = $1`
	
	app := &admissionpb.Application{}
	var ca, ua sql.NullString
	err := r.db.QueryRowContext(ctx, appQuery, applicationID).Scan(
		&app.Id, &app.UserId, &app.InstituteId, &app.ProgramId, &app.CurrentStageIndex, &app.Status, &ca, &ua,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil, fmt.Errorf("application not found")
		}
		return nil, nil, err
	}
	if ca.Valid { app.CreatedAt = ca.String }
	if ua.Valid { app.UpdatedAt = ua.String }

	// Fetch and attach Program details (critical bug fix)
	prog, err := r.GetProgramByID(ctx, app.ProgramId)
	if err == nil {
		app.Program = prog
	}

	// Get Transactions
	txQuery := `
		SELECT id, application_id, actor_id, action_type, metadata, created_at 
		FROM admission_transactions 
		WHERE application_id = $1 ORDER BY created_at ASC`
	
	rows, err := r.db.QueryContext(ctx, txQuery, applicationID)
	if err != nil {
		return nil, nil, err
	}
	defer func() { _ = rows.Close() }()

	var transactions []*admissionpb.Transaction
	for rows.Next() {
		t := &admissionpb.Transaction{}
		var meta, tca sql.NullString
		if err := rows.Scan(&t.Id, &t.ApplicationId, &t.ActorId, &t.ActionType, &meta, &tca); err != nil {
			return nil, nil, err
		}
		if meta.Valid { t.Metadata = meta.String }
		if tca.Valid { t.CreatedAt = tca.String }
		transactions = append(transactions, t)
	}

	return transactions, app, nil
}

func (r *repository) GetUserApplications(ctx context.Context, userID string) ([]*admissionpb.Application, error) {
	query := `
		SELECT a.id, a.user_id, a.institute_id, a.program_id, a.current_stage_index, a.status, a.created_at, a.updated_at,
		(SELECT metadata FROM admission_transactions t WHERE t.application_id = a.id AND t.actor_id = a.user_id ORDER BY t.created_at DESC LIMIT 1) as submitted_data
		FROM admission_applications a WHERE a.user_id = $1 ORDER BY a.updated_at DESC`
	
	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer func() { _ = rows.Close() }()

	var apps []*admissionpb.Application
	for rows.Next() {
		app := &admissionpb.Application{}
		var ca, ua, subData sql.NullString
		if err := rows.Scan(&app.Id, &app.UserId, &app.InstituteId, &app.ProgramId, &app.CurrentStageIndex, &app.Status, &ca, &ua, &subData); err != nil {
			return nil, err
		}
		if ca.Valid { app.CreatedAt = ca.String }
		if ua.Valid { app.UpdatedAt = ua.String }
		if subData.Valid { app.SubmittedData = subData.String }
		
		prog, _ := r.GetProgramByID(ctx, app.ProgramId)
		app.Program = prog

		apps = append(apps, app)
	}
	return apps, nil
}

func (r *repository) GetInstituteApplications(ctx context.Context, instituteID string) ([]*admissionpb.Application, error) {
	query := `
		SELECT a.id, a.user_id, a.institute_id, a.program_id, a.current_stage_index, a.status, a.created_at, a.updated_at,
		(SELECT metadata FROM admission_transactions t WHERE t.application_id = a.id AND t.actor_id = a.user_id ORDER BY t.created_at DESC LIMIT 1) as submitted_data
		FROM admission_applications a WHERE a.institute_id = $1 ORDER BY a.updated_at DESC`
	
	rows, err := r.db.QueryContext(ctx, query, instituteID)
	if err != nil {
		return nil, err
	}
	defer func() { _ = rows.Close() }()

	var apps []*admissionpb.Application
	for rows.Next() {
		app := &admissionpb.Application{}
		var ca, ua, subData sql.NullString
		if err := rows.Scan(&app.Id, &app.UserId, &app.InstituteId, &app.ProgramId, &app.CurrentStageIndex, &app.Status, &ca, &ua, &subData); err != nil {
			return nil, err
		}
		if ca.Valid { app.CreatedAt = ca.String }
		if ua.Valid { app.UpdatedAt = ua.String }
		if subData.Valid { app.SubmittedData = subData.String }
		
		prog, _ := r.GetProgramByID(ctx, app.ProgramId)
		app.Program = prog

		apps = append(apps, app)
	}
	return apps, nil
}

