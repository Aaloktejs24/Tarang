package queue

import (
	"encoding/json"

	amqp "github.com/rabbitmq/amqp091-go"
)

type Publisher struct {
	ch *amqp.Channel
}

func NewPublisher(ch *amqp.Channel) *Publisher {
	return &Publisher{ch: ch}
}

func (p *Publisher) PublishOTP(job OTPJob) error {

	body, err := json.Marshal(job)
	if err != nil {
		return err
	}

	return p.ch.Publish(
		"",
		"otp_queue",
		false,
		false,
		amqp.Publishing{
			ContentType: "application/json",
			Body:        body,
		},
	)
}

func (p *Publisher) PublishMongoSync(job MongoSyncJob) error {
	body, err := json.Marshal(job)
	if err != nil {
		return err
	}

	return p.ch.Publish(
		"",
		"mongo_sync_queue",
		false,
		false,
		amqp.Publishing{
			ContentType: "application/json",
			Body:        body,
		},
	)
}