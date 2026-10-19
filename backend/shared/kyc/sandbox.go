package kyc

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"encoding/xml"
	"fmt"
	"io"
	"net/http"
	"time"
)

type SandboxProvider struct {
	APIKey      string
	APISecret   string
	RedirectURL string
}

func NewSandboxProvider(apiKey, apiSecret, redirectURL string) *SandboxProvider {
	return &SandboxProvider{
		APIKey:      apiKey,
		APISecret:   apiSecret,
		RedirectURL: redirectURL,
	}
}

func (s *SandboxProvider) GetToken() (string, error) {
	req, _ := http.NewRequest("POST", "https://api.sandbox.co.in/authenticate", nil)
	req.Header.Set("x-api-key", s.APIKey)
	req.Header.Set("x-api-secret", s.APISecret)
	req.Header.Set("x-api-version", "1.0.0")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var res struct {
		AccessToken string `json:"access_token"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
		return "", err
	}
	if res.AccessToken == "" {
		return "", fmt.Errorf("could not get access token")
	}
	return res.AccessToken, nil
}

func (s *SandboxProvider) RequestAadhaarOTP(token, aadhaarNum string) (string, error) {
	url := "https://api.sandbox.co.in/kyc/aadhaar/okyc/otp"
	payload, _ := json.Marshal(map[string]interface{}{
		"@entity":        "in.co.sandbox.kyc.aadhaar.okyc.otp.request",
		"aadhaar_number": aadhaarNum,
		"consent":        "Y",
		"reason":         "Verification for Tarang",
	})

	req, _ := http.NewRequest("POST", url, bytes.NewBuffer(payload))
	req.Header.Set("Authorization", token)
	req.Header.Set("x-api-key", s.APIKey)
	req.Header.Set("x-api-version", "1.0.0")
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("OTP request failed: %s", string(b))
	}

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	data, ok := result["data"].(map[string]interface{})
	if !ok || data["reference_id"] == nil {
		return "", fmt.Errorf("failed to get reference_id: %v", result)
	}

	refID := fmt.Sprintf("%.0f", data["reference_id"].(float64))
	return refID, nil
}

type VerificationResult struct {
	Name   string
	DOB    string
	Gender string
	Photo  string
}

func (s *SandboxProvider) VerifyAadhaarOTP(token, refID, otp string) (*VerificationResult, error) {
	url := "https://api.sandbox.co.in/kyc/aadhaar/okyc/otp/verify"
	payload, _ := json.Marshal(map[string]interface{}{
		"@entity":      "in.co.sandbox.kyc.aadhaar.okyc.request",
		"reference_id": refID,
		"otp":          otp,
	})

	req, _ := http.NewRequest("POST", url, bytes.NewBuffer(payload))
	req.Header.Set("Authorization", token)
	req.Header.Set("x-api-key", s.APIKey)
	req.Header.Set("x-api-version", "1.0.0")
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("OTP verification failed: %s", string(b))
	}

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	data, ok := result["data"].(map[string]interface{})
	if !ok || data == nil {
		return nil, fmt.Errorf("API Error: %v", result["message"])
	}

	if data["status"] == "VALID" || data["status"] == "SUCCESS" {

		// Sometimes Sandbox wraps details inside an Aadhaar object
		name, _ := data["name"].(string)
		dob, _ := data["dob"].(string)
		gender, _ := data["gender"].(string)
		photo, _ := data["profile_image"].(string)

		return &VerificationResult{
			Name:   name,
			DOB:    dob,
			Gender: gender,
			Photo:  photo,
		}, nil
	}

	msg, _ := data["message"].(string)
	return nil, fmt.Errorf("verification failed: %s", msg)
}

func (s *SandboxProvider) HashAadhaar(aadhaarNum string) string {
	// Basic SHA256 hashing to avoid storing plain text
	h := sha256.New()
	h.Write([]byte(aadhaarNum + s.APISecret[:10]))
	return hex.EncodeToString(h.Sum(nil))
}

// ==========================================
// DIGILOCKER WEB FLOW (OAUTH)
// ==========================================

type DigilockerSessionRequest struct {
	Entity      string   `json:"@entity"`
	Flow        string   `json:"flow"`
	DocTypes    []string `json:"doc_types"`
	RedirectURL string   `json:"redirect_url"`
}

func (s *SandboxProvider) InitDigilockerSession(token string) (string, string, error) {
	url := "https://api.sandbox.co.in/kyc/digilocker/sessions/init"
	payloadData := DigilockerSessionRequest{
		Entity:      "in.co.sandbox.kyc.digilocker.session.request",
		Flow:        "signin",
		DocTypes:    []string{"aadhaar"},
		RedirectURL: s.RedirectURL,
	}

	payload, _ := json.Marshal(payloadData)
	req, _ := http.NewRequest("POST", url, bytes.NewBuffer(payload))

	req.Header.Set("Authorization", token)
	req.Header.Set("x-api-key", s.APIKey)
	req.Header.Set("x-api-version", "1.0.0")
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		return "", "", fmt.Errorf("Digilocker session init failed: %s", string(b))
	}

	var res struct {
		Data struct {
			SessionID string `json:"session_id"`
			AuthURL   string `json:"authorization_url"`
		} `json:"data"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
		return "", "", err
	}
	return res.Data.SessionID, res.Data.AuthURL, nil
}

type OfflinePaperlessKyc struct {
	XMLName xml.Name `xml:"Certificate"`
	Data    struct {
		KycRes struct {
			UidData struct {
				Poi struct {
					Name   string `xml:"name,attr"`
					Dob    string `xml:"dob,attr"`
					Gender string `xml:"gender,attr"`
				} `xml:"Poi"`
				Pht string `xml:"Pht"`
			} `xml:"UidData"`
		} `xml:"KycRes"`
	} `xml:"CertificateData"`
}

func (s *SandboxProvider) GetDigilockerAadhaarData(token, sessionID string) (*VerificationResult, error) {
	url := fmt.Sprintf("https://api.sandbox.co.in/kyc/digilocker/sessions/%s/documents/aadhaar", sessionID)
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("Authorization", token)
	req.Header.Set("x-api-key", s.APIKey)
	req.Header.Set("x-api-version", "1.0.0")

	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("failed to fetch digilocker document: %s", string(b))
	}

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	dataObj, ok := result["data"].(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("invalid digilocker data format")
	}

	filesRaw, ok := dataObj["files"].([]interface{})
	if !ok || len(filesRaw) == 0 {
		return nil, fmt.Errorf("no aadhaar files found in digilocker response")
	}

	fileMeta := filesRaw[0].(map[string]interface{})
	xmlURL, _ := fileMeta["url"].(string)

	if xmlURL == "" {
		return nil, fmt.Errorf("empty xml url")
	}

	// Download Document S3 XML
	xmlResp, err := http.Get(xmlURL)
	if err != nil {
		return nil, fmt.Errorf("failed to download s3 xml: %w", err)
	}
	defer xmlResp.Body.Close()

	xmlData, _ := io.ReadAll(xmlResp.Body)

	var kycData OfflinePaperlessKyc
	if err := xml.Unmarshal(xmlData, &kycData); err != nil {
		return nil, fmt.Errorf("failed to parse digilocker xml: %w", err)
	}

	uidData := kycData.Data.KycRes.UidData

	return &VerificationResult{
		Name:   uidData.Poi.Name,
		DOB:    uidData.Poi.Dob,
		Gender: uidData.Poi.Gender,
		Photo:  uidData.Pht,
	}, nil
}
