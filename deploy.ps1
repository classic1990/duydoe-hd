# DUY-DOE HD Full Deploy Script
# Deploy Frontend (Firebase) + Backend (Vercel) + Firestore Rules

param(
    [switch]$SkipBackend,
    [switch]$SkipFrontend,
    [switch]$SkipFirestore
)

# Simple status function
function Status($Message, $Type) {
    $symbol = switch ($Type) {
        "Success" { "✅" }
        "Error"   { "❌" }
        "Warning" { "⚠️" }
        default   { "ℹ️" }
    }
    Write-Host "$symbol $Message"
}

# Check if command exists
function HasCommand($cmd) {
    return [bool](Get-Command $cmd -ErrorAction SilentlyContinue)
}

# ===============================
# CHECK PREREQUISITES
# ===============================
Status "Checking prerequisites..." "Info"

$allGood = $true
if (-not (HasCommand "firebase")) {
    Status "Firebase CLI not installed. Run: npm install -g firebase-tools" "Error"
    $allGood = $false
}
if (-not (HasCommand "vercel")) {
    Status "Vercel CLI not installed. Run: npm install -g vercel" "Error"
    $allGood = $false
}
if (-not (HasCommand "node")) {
    Status "Node.js not installed. Download from https://nodejs.org" "Error"
    $allGood = $false
}

if (-not $allGood) {
    Status "Please install missing prerequisites and try again" "Error"
    exit 1
}

Status "All prerequisites met" "Success"

# ===============================
# DEPLOY BACKEND
# ===============================
if (-not $SkipBackend) {
    Status "Deploying Backend to Vercel..." "Info"
    
    Push-Location "$PSScriptRoot\backend"
    
    try {
        if (Test-Path ".vercel") {
            vercel --prod --yes
        } else {
            Status "First time deploy - please follow prompts to link project" "Warning"
            vercel --prod
        }
        Status "Backend deployed" "Success"
    } catch {
        Status "Backend deploy failed: $_" "Error"
    }
    
    Pop-Location
}

# ===============================
# DEPLOY FIRESTORE RULES
# ===============================
if (-not $SkipFirestore) {
    Status "Deploying Firestore Rules..." "Info"
    
    Push-Location $PSScriptRoot
    
    try {
        firebase deploy --only firestore:rules
        Status "Firestore rules deployed" "Success"
    } catch {
        Status "Firestore rules deploy failed: $_" "Error"
    }
    
    Pop-Location
}

# ===============================
# DEPLOY FRONTEND
# ===============================
if (-not $SkipFrontend) {
    Status "Deploying Frontend to Firebase..." "Info"
    
    Push-Location $PSScriptRoot
    
    try {
        firebase deploy --only hosting
        Status "Frontend deployed" "Success"
    } catch {
        Status "Frontend deploy failed: $_" "Error"
    }
    
    Pop-Location
}

# ===============================
# SUMMARY
# ===============================
Write-Host ""
Status "Deployment Complete!" "Success"
Write-Host ""
Write-Host "📊 What was deployed:"
if (-not $SkipBackend) { Write-Host "   ✅ Backend (Vercel)" }
if (-not $SkipFirestore) { Write-Host "   ✅ Firestore Rules" }
if (-not $SkipFrontend) { Write-Host "   ✅ Frontend (Firebase Hosting)" }

Write-Host ""
Write-Host "🌐 Your app URLs:"
Write-Host "   Frontend: https://duydodeesport.web.app"
Write-Host "   Backend:  https://backend-ij36w32yf-duydode-th.vercel.app"

Write-Host ""
Write-Host "📝 Next steps:"
Write-Host "   1. Visit https://duydodeesport.web.app"
Write-Host "   2. Login with Google (admin: duyclassic191@gmail.com)"
Write-Host "   3. Try AI Fetch and save a movie"

# Return to script directory
Set-Location $PSScriptRoot
