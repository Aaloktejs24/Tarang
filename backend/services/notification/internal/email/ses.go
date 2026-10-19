package mail

import (
	"context"
	"fmt"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/ses"
	"github.com/aws/aws-sdk-go-v2/service/ses/types"
)

var client *ses.Client
var senderEmail string

// InitSES initializes the AWS SES client
func InitSES(sender string) error {
	senderEmail = sender
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cfg, err := config.LoadDefaultConfig(ctx)
	if err != nil {
		return err
	}

	client = ses.NewFromConfig(cfg)
	return nil
}

// SendSES sends the OTP email using AWS SES
func SendSES(to string, code string) error {
	fmt.Printf("\n[NOTIFICATION] Preparing EMAIL OTP for %s\n", to)
	fmt.Printf("[DEV ONLY] OTP CODE: %s\n\n", code)

	if client == nil {
		fmt.Println("[SES] AWS Client not initialized. Skipping cloud transmission.")
		return nil
	}

	// 1. Text body in Hindi
	textBody := fmt.Sprintf("आपका तरंग वेरिफिकेशन कोड है: %s\n\nयह कोड 10 मिनट के लिए मान्य है।", code)

	// 2. Hindi HTML template with Tarang theme
	htmlBody := fmt.Sprintf(`
<!DOCTYPE html>
<html lang="hi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .wrapper { padding: 0}
        .container { max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; }
        .header { 
            background: linear-gradient(135deg, #0056b3 0%%, #28a745 100%%); 
            padding: 30px 20px; 
            text-align: center; 
            color: white; 
        }
        .header-table {
            margin: 0 auto;
        }
        .logo-box {
            background-color: #ffffff !important;
            padding: 8px;
            border-radius: 1200px;
            display: inline-block;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header h1 { margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -1px; line-height: 1; vertical-align: middle; }
        .content { padding: 30px 20px; text-align: center; color: #1e293b; }
        .otp-box { 
            background: #f8fafc; 
            border: 2px solid #e2e8f0; 
            border-radius: 12px; 
            padding: 20px 40px; 
            margin: 20px auto; 
            width: fit-content;
        }
        .otp-code { 
            font-family: 'Monaco', 'Courier New', monospace; 
            font-size: 36px; 
            font-weight: 800; 
            color: #0056b3; 
            letter-spacing: 8px; 
            padding-left: 8px; /* Symmetrical balance to match the last character spacing */
            margin: 0;
        }
        .footer { 
            padding: 20px; 
            text-align: center; 
            color: #94a3b8; 
            font-size: 13px; 
            background: #f8fafc;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <table class="header-table" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="padding-right: 15px; vertical-align: middle;">
                            <table cellpadding="0" cellspacing="0" width="56" height="56" style="background-color: #ffffff !important; border-radius: 50%% !important;">
                                <tr>
                                    <td bgcolor="#ffffff" align="center" valign="middle" style="background-color: #ffffff !important; border-radius: 50%% !important; width: 56px; height: 56px;">
                                        <img src="https://res.cloudinary.com/dxeqkyueq/image/upload/v1774678879/logo_gbkeo2.svg" alt="Tarang Logo" width="56" height="56" style="display: block; border-radius: 50%%;">
                                    </td>
                                </tr>
                            </table>
                        </td>
                        <td style="vertical-align: middle;">
                            <h1 style="color: white !important;">Tarang</h1>
                        </td>
                    </tr>
                </table>
            </div>
            <div class="content">
                <h2 style="margin-top:0; font-size: 22px; color: #0f172a;">अपनी पहचान सत्यापित करें</h2>
                <p style="color: #64748b; font-size: 15px; line-height: 1.6;">अपने अकाउंट को सुरक्षित करने के लिए, निम्नलिखित वेरिफिकेशन कोड (OTP) का उपयोग करें। यह कोड 10 मिनट के लिए मान्य है।</p>
                <div class="otp-box">
                    <p class="otp-code">%s</p>
                </div>
                <p style="font-size: 13px; color: #94a3b8;">यदि आपने यह अनुरोध नहीं किया है, तो कृपया इस ईमेल को अनदेखा करें।</p>
            </div>
            <div class="footer">
                &copy; 2026 तरंग. आधुनिक संचार का नया माध्यम।
            </div>
        </div>
    </div>
</body>
</html>
`, code)

	input := &ses.SendEmailInput{
		Destination: &types.Destination{
			ToAddresses: []string{to},
		},
		Message: &types.Message{
			Body: &types.Body{
				Html: &types.Content{
					Charset: aws.String("UTF-8"),
					Data:    aws.String(htmlBody),
				},
				Text: &types.Content{
					Charset: aws.String("UTF-8"),
					Data:    aws.String(textBody),
				},
			},
			Subject: &types.Content{
				Charset: aws.String("UTF-8"),
				Data:    aws.String("तरंग वेरिफिकेशन OTP"),
			},
		},
		Source: aws.String(senderEmail),
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := client.SendEmail(ctx, input)
	return err
}
