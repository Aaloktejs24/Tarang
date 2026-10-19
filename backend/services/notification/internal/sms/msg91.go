package sms

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

var (
	msg91AuthKey    string
	msg91TemplateID string
)

func InitMSG91(authKey, templateID string) error {
	msg91AuthKey = authKey
	msg91TemplateID = templateID
	return nil
}

func SendMSG91(phone, otp string) error {
	// If credentials are not set, fallback to console log (useful for local dev)
	if msg91AuthKey == "" || msg91TemplateID == "" {
		fmt.Println("[DUMMY] Sending SMS OTP to", phone, ":", otp)
		return nil
	}

	// Clean phone number (MSG91 expects no '+' but requires country code, e.g. 919876543210)
	cleanPhone := strings.ReplaceAll(phone, "+", "")

	url := fmt.Sprintf("https://control.msg91.com/api/v5/otp?template_id=%s&mobile=%s", msg91TemplateID, cleanPhone)

	payloadBytes, _ := json.Marshal(map[string]string{
		"otp": otp,
	})
	payload := bytes.NewReader(payloadBytes)

	req, err := http.NewRequest("POST", url, payload)
	if err != nil {
		return fmt.Errorf("failed to create MSG91 request: %w", err)
	}

	req.Header.Add("authkey", msg91AuthKey)
	req.Header.Add("Content-Type", "application/json")
	req.Header.Add("accept", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	res, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("MSG91 API request failed: %w", err)
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK && res.StatusCode != http.StatusCreated {
		bodyBytes, _ := io.ReadAll(res.Body)
		return fmt.Errorf("MSG91 API error (status %d): %s", res.StatusCode, string(bodyBytes))
	}

	fmt.Println("Successfully sent real SMS OTP to", cleanPhone)
	return nil
}
