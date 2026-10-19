package jobs

import (
	"context"
	"encoding/json"
	"log"

	"backend/shared/database"
	"backend/shared/queue"

	amqp "github.com/rabbitmq/amqp091-go"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func StartMongoSyncWorker(ch *amqp.Channel) {
	msgs, err := ch.Consume(
		"mongo_sync_queue",
		"",
		false, // manual ack
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		log.Printf("failed to register mongo sync consumer: %v", err)
		return
	}

	go func() {
		for d := range msgs {
			var job queue.MongoSyncJob
			if err := json.Unmarshal(d.Body, &job); err != nil {
				log.Printf("failed to unmarshal mongo sync job: %v", err)
				d.Nack(false, false) // discard invalid message
				continue
			}

			if database.MongoDatabase == nil {
				log.Println("mongo database is not connected, requeuing")
				d.Nack(false, true)
				continue
			}

			collection := database.MongoDatabase.Collection(job.Collection)
			
			// Find by document ID and Upsert
			filter := bson.M{}
			if job.Collection == "academic_achievements" {
				filter = bson.M{"academic_record_id": job.DocumentID}
			} else {
				filter = bson.M{"_id": job.DocumentID}
			}

			update := bson.M{
				"$set": job.Payload,
			}

			opts := options.Update().SetUpsert(true)
			_, err := collection.UpdateOne(context.Background(), filter, update, opts)
			if err != nil {
				log.Printf("failed to upsert mongo doc %s in %s: %v", job.DocumentID, job.Collection, err)
				// Basic retry logic via nack/requeue
				job.Retries++
				if job.Retries < 5 {
					d.Nack(false, true) // requeue
				} else {
					log.Printf("max retries exceeded for mongo doc %s", job.DocumentID)
					d.Nack(false, false) // drop or send to DLQ
				}
				continue
			}

			// Success
			d.Ack(false)
			log.Printf("successfully synced doc %s to mongo collection %s", job.DocumentID, job.Collection)
		}
	}()
}
