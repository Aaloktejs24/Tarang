package queue

type OTPJob struct {
	Email   string `json:"email"`
	Phone   string `json:"phone,omitempty"`
	Code    string `json:"code"`
	Purpose string `json:"purpose"`
	Retries int    `json:"retries"`
}