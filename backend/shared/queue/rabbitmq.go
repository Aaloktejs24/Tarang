package queue

import (
	 amqp "github.com/rabbitmq/amqp091-go"
)

func ConnectRabbitMQ(url string) (*amqp.Connection, *amqp.Channel, error) {

	conn, err := amqp.Dial(url)
	if err != nil {
		return nil, nil, err
	}

	ch, err := conn.Channel()
	if err != nil {
		return nil, nil, err
	}

	// MAIN OTP QUEUE
	_, err = ch.QueueDeclare(
		"otp_queue",
		true,
		false,
		false,
		false,
		nil,
	)

	if err != nil {
		return nil, nil, err
	}

	// RETRY QUEUE
	_, err = ch.QueueDeclare(
		"otp_retry_queue",
		true,
		false,
		false,
		false,
		amqp.Table{
			"x-message-ttl":             5000,
			"x-dead-letter-exchange":    "",
			"x-dead-letter-routing-key": "otp_queue",
		},
	)

	if err != nil {
		return nil, nil, err
	}

	// DEAD LETTER QUEUE
	_, err = ch.QueueDeclare(
		"otp_dead_queue",
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		return nil, nil, err
	}

	// MONGO SYNC QUEUE
	_, err = ch.QueueDeclare(
		"mongo_sync_queue",
		true,
		false,
		false,
		false,
		nil,
	)

	return conn, ch, err
}