# Service Account Key Generator Script
# สำหรับสร้าง service account key ชั่วคราวสำหรับ testing

Write-Host "🔧 Service Account Key Generator" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

Write-Host "⚠️  WARNING: This creates a MOCK service account key for testing only!" -ForegroundColor Yellow
Write-Host "⚠️  For production, use a REAL service account key from Firebase Console" -ForegroundColor Yellow
Write-Host ""

# Create mock service account key for testing
$mockServiceAccount = @{
    type = "service_account"
    project_id = "duydodeesport"
    private_key_id = "test-key-$(Get-Random -Minimum 8 -Maximum 16)"
    private_key = @'
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKB
xhXctbdgZcfwxh6Y685RtXhiaaKqjOXQ5fKA/Q1YP+1+uYzxqnnnjVy3+kRBmIFc
T6i2t6/t8A==\n-----END PRIVATE KEY-----
'@
    client_email = "firebase-adminsdk-test@duydodeesport.iam.gserviceaccount.com"
    client_id = "123456789012345678901"
    auth_uri = "https://accounts.google.com/o/oauth2/auth"
    token_uri = "https://oauth2.googleapis.com/token"
    auth_provider_x509_cert_url = "https://www.googleapis.com/oauth2/v1/certs"
    client_x509_cert_url = "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-test%40duydodeesport.iam.gserviceaccount.com"
}

# Save to file
$mockServiceAccount | ConvertTo-Json -Depth 10 | Out-File -FilePath "service-account-key.json" -Encoding UTF8

Write-Host "✅ Mock service account key created: service-account-key.json" -ForegroundColor Green
Write-Host "📝 This is for TESTING ONLY - not for production use!" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔗 For production service account key:" -ForegroundColor Cyan
Write-Host "1. Go to Firebase Console: https://console.firebase.google.com/" -ForegroundColor White
Write-Host "2. Select project 'duydodeesport'" -ForegroundColor White
Write-Host "3. Go to Project Settings > Service accounts" -ForegroundColor White
Write-Host "4. Click 'Generate new private key'" -ForegroundColor White
Write-Host "5. Download JSON file and replace service-account-key.json" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Now you can test the backend server:" -ForegroundColor Green
Write-Host "   npm start" -ForegroundColor White
