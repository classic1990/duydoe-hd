# ===================================
# 🧹 DUY-DOE PROJECT CLEANUP SCRIPT
# ===================================

# สคริปนี้ใช้สำหรับลบโฟลเดอร์และไฟล์ที่ไม่สำคัญ
# เหลือเฉพาะโปรเจกต์ใหม่ "DUY-DOE-PROJECT"

Write-Host "🧹 DUY-DOE PROJECT CLEANUP SCRIPT" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# ตรวจสอบว่าอยู่ในโฟลเดอร์ D:\DEV หรือไม่
$CurrentPath = Get-Location
if ($CurrentPath.Path -ne "D:\DEV") {
    Write-Host "❌ กรุณารันสคริปนี้จากโฟลเดอร์ D:\DEV" -ForegroundColor Red
    Write-Host "📁 โฟลเดอร์ปัจจุบัน: $CurrentPath" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "วิธีการใช้:" -ForegroundColor White
    Write-Host "1. cd D:\DEV" -ForegroundColor Gray
    Write-Host "2. .\cleanup-project.ps1" -ForegroundColor Gray
    exit 1
}

Write-Host "✅ อยู่ในโฟลเดอร์ที่ถูกต้อง: D:\DEV" -ForegroundColor Green
Write-Host ""

# แสดงรายการโฟลเดอร์และไฟล์ที่จะลบ
Write-Host "📋 รายการที่จะลบ:" -ForegroundColor Yellow
Write-Host ""

# โฟลเดอร์ที่จะลบ
$FoldersToDelete = @(
    ".firebase",
    ".git", 
    "backend",
    "npm-global",
    "public",
    "scripts",
    "src"
)

# ไฟล์ที่จะลบ
$FilesToDelete = @(
    ".firebaserc",
    ".gitignore", 
    "CLEAN_CODE_REPORT.md",
    "DATABASE_CONNECTION_TEST_REPORT.md",
    "deploy.ps1",
    "DEPLOYMENT.md",
    "deployment-report-25690401-051353.txt",
    "firebase.json",
    "firebase-deploy-instructions.md",
    "firestore.indexes.json",
    "firestore.rules",
    "fix-database-connection.ps1",
    "fix-database-connection.sh",
    "package.json",
    "README.md",
    "SECURITY_POLICY.md",
    "setup.ps1",
    "UI_UX_ENHANCEMENT_REPORT.md"
)

# แสดงรายการโฟลเดอร์ที่จะลบ
Write-Host "📁 โฟลเดอร์ที่จะลบ:" -ForegroundColor Red
foreach ($folder in $FoldersToDelete) {
    if (Test-Path $folder) {
        Write-Host "   🗂️  $folder" -ForegroundColor Gray
    }
}

# แสดงรายการไฟล์ที่จะลบ
Write-Host ""
Write-Host "📄 ไฟล์ที่จะลบ:" -ForegroundColor Red
foreach ($file in $FilesToDelete) {
    if (Test-Path $file) {
        Write-Host "   📄 $file" -ForegroundColor Gray
    }
}

# แสดงโฟลเดอร์ที่จะเหลือ
Write-Host ""
Write-Host "✅ โฟลเดอร์ที่จะเหลือ:" -ForegroundColor Green
Write-Host "   📁 DUY-DOE-PROJECT (โปรเจกต์หลัก)" -ForegroundColor Green

# ยืนยันการลบ
Write-Host ""
Write-Host "⚠️  คำเตือน: การดำเนินการนี้ไม่สามารถยกเลิกได้!" -ForegroundColor Red
Write-Host "❓ คุณต้องการลบรายการข้างต้นทั้งหมดหรือไม่? (y/N)" -ForegroundColor Yellow -NoNewline
$Confirmation = Read-Host

if ($Confirmation -notmatch '^[Yy]') {
    Write-Host ""
    Write-Host "❌ ยกเลิกการดำเนินการ" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "🗑️  เริ่มการลบ..." -ForegroundColor Yellow
Write-Host ""

# ลบโฟลเดอร์
$DeletedFolders = 0
foreach ($folder in $FoldersToDelete) {
    if (Test-Path $folder) {
        try {
            Remove-Item -Path $folder -Recurse -Force
            Write-Host "✅ ลบโฟลเดอร์: $folder" -ForegroundColor Green
            $DeletedFolders++
        }
        catch {
            Write-Host "❌ ไม่สามารถลบโฟลเดอร์: $folder" -ForegroundColor Red
            Write-Host "   ข้อผิดพลาด: $($_.Exception.Message)" -ForegroundColor DarkRed
        }
    }
    else {
        Write-Host "ℹ️  ไม่พบโฟลเดอร์: $folder" -ForegroundColor Gray
    }
}

# ลบไฟล์
$DeletedFiles = 0
foreach ($file in $FilesToDelete) {
    if (Test-Path $file) {
        try {
            Remove-Item -Path $file -Force
            Write-Host "✅ ลบไฟล์: $file" -ForegroundColor Green
            $DeletedFiles++
        }
        catch {
            Write-Host "❌ ไม่สามารถลบไฟล์: $file" -ForegroundColor Red
            Write-Host "   ข้อผิดพลาด: $($_.Exception.Message)" -ForegroundColor DarkRed
        }
    }
    else {
        Write-Host "ℹ️  ไม่พบไฟล์: $file" -ForegroundColor Gray
    }
}

# แสดงผลลัพธ์
Write-Host ""
Write-Host "🎉 การลบเสร็จสมบูรณ์!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 สรุปผลลัพธ์:" -ForegroundColor Cyan
Write-Host "   📁 ลบโฟลเดอร์: $DeletedFolders โฟลเดอร์" -ForegroundColor White
Write-Host "   📄 ลบไฟล์: $DeletedFiles ไฟล์" -ForegroundColor White
Write-Host ""

# แสดงโครงสร้างที่เหลือ
Write-Host "📂 โครงสร้างที่เหลือ:" -ForegroundColor Cyan
$RemainingItems = Get-ChildItem -Path . | Sort-Object Name
foreach ($item in $RemainingItems) {
    if ($item.PSIsContainer) {
        Write-Host "   📁 $($item.Name)" -ForegroundColor Green
    }
    else {
        Write-Host "   📄 $($item.Name)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "🚀 โปรเจกต์ DUY-DOE พร้อมใช้งาน!" -ForegroundColor Green
Write-Host "📁 โฟลเดอร์หลัก: D:\DEV\DUY-DOE-PROJECT" -ForegroundColor Yellow
Write-Host ""
Write-Host "ขั้นตอนต่อไป:" -ForegroundColor White
Write-Host "1. cd DUY-DOE-PROJECT" -ForegroundColor Gray
Write-Host "2. code ." -ForegroundColor Gray
Write-Host "3. cd backend && node server.js" -ForegroundColor Gray
Write-Host "4. เปิด public/admin-add-movie.html ด้วย Live Server" -ForegroundColor Gray
