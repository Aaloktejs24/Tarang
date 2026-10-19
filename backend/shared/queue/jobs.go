package queue

type OTPJob struct {
	Email   string `json:"email"`
	Phone   string `json:"phone,omitempty"`
	Code    string `json:"code"`
	Purpose string `json:"purpose"`
	Retries int    `json:"retries"`
}

type MongoSyncJob struct {
	Collection string      `json:"collection"`
	DocumentID string      `json:"document_id"`
	Payload    interface{} `json:"payload"`
	Retries    int         `json:"retries"`
}