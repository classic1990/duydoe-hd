# ===================================
# 📋 DUY-DOE PROJECT ANALYSIS SCRIPT
# ===================================

# สคริปนี้ใช้สำหรับวิเคราะห์และแสดงข้อมูลโฟลเดอร์และไฟล์
# ก่อนการลบเพื่อให้ผู้ใช้ตัดสินใจได้

Write-Host "📋 DUY-DOE PROJECT ANALYSIS SCRIPT" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# ตรวจสอบว่าอยู่ในโฟลเดอร์ D:\DEV หรือไม่
$CurrentPath = Get-Location
if ($CurrentPath.Path -ne "D:\DEV") {
    Write-Host "❌ กรุณารันสคริปนี้จากโฟลเดอร์ D:\DEV" -ForegroundColor Red
    Write-Host "📁 โฟลเดอร์ปัจจุบัน: $CurrentPath" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ อยู่ในโฟลเดอร์ที่ถูกต้อง: D:\DEV" -ForegroundColor Green
Write-Host ""

# วิเคราะห์โฟลเดอร์และไฟล์ทั้งหมด
Write-Host "🔍 วิเคราะห์โครงสร้างปัจจุบัน..." -ForegroundColor Yellow
Write-Host ""

# แยกประเภทโฟลเดอร์และไฟล์
$AllItems = Get-ChildItem -Path . -Force | Sort-Object Name
$Folders = $AllItems | Where-Object { $_.PSIsContainer }
$Files = $AllItems | Where-Object { -not $_.PSIsContainer }

# โฟลเดอร์ที่จะเหลือ (สำคัญ)
$ImportantFolders = @("DUY-DOE-PROJECT")

# โฟลเดอร์ที่จะลบ
$UnimportantFolders = $Folders | Where-Object { $_.Name -notin $ImportantFolders }

# ไฟล์ที่จะลบทั้งหมด
$UnimportantFiles = $Files

Write-Host "📊 สรุปโครงสร้าง:" -ForegroundColor Cyan
Write-Host "   📁 โฟลเดอร์ทั้งหมด: $($Folders.Count) โฟลเดอร์" -ForegroundColor White
Write-Host "   📄 ไฟล์ทั้งหมด: $($Files.Count) ไฟล์" -ForegroundColor White
Write-Host ""

Write-Host "✅ โฟลเดอร์ที่จะเหลือ (สำคัญ):" -ForegroundColor Green
foreach ($folder in $ImportantFolders) {
    $item = $Folders | Where-Object { $_.Name -eq $folder }
    if ($item) {
        $size = if ($item.PSIsContainer) { "โฟลเดอร์" } else { "{0:N2} KB" -f ($item.Length / 1KB) }
        Write-Host "   📁 $($item.Name) - $size" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "🗑️  โฟลเดอร์ที่จะลบ:" -ForegroundColor Red
foreach ($folder in $UnimportantFolders) {
    $size = if ($folder.PSIsContainer) { 
        try {
            $totalSize = (Get-ChildItem $folder.FullName -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
            if ($totalSize -gt 1MB) {
                "{0:N2} MB" -f ($totalSize / 1MB)
            } elseif ($totalSize -gt 1KB) {
                "{0:N2} KB" -f ($totalSize / 1KB)
            } else {
                "{0:N0} B" -f $totalSize
            }
        } catch {
            "โฟลเดอร์"
        }
    } else { "โฟลเดอร์" }
    Write-Host "   📁 $($folder.Name) - $size" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🗑️  ไฟล์ที่จะลบ:" -ForegroundColor Red
foreach ($file in $UnimportantFiles) {
    $size = if ($file.Length -gt 1MB) {
        "{0:N2} MB" -f ($file.Length / 1MB)
    } elseif ($file.Length -gt 1KB) {
        "{0:N2} KB" -f ($file.Length / 1KB)
    } else {
        "{0:N0} B" -f $file.Length
    }
    Write-Host "   📄 $($file.Name) - $size" -ForegroundColor Gray
}

Write-Host ""
Write-Host "📈 การวิเคราะห์พื้นที่:" -ForegroundColor Cyan

# คำนวนขนาดของโฟลเดอร์ที่จะลบ
$TotalDeleteSize = 0
try {
    $TotalDeleteSize = (Get-ChildItem -Path . -Recurse -ErrorAction SilentlyContinue | 
        Where-Object { 
            $_.FullName -notlike "*\DUY-DOE-PROJECT*" 
        } | 
        Measure-Object -Property Length -Sum).Sum
} catch {
    $TotalDeleteSize = 0
}

# คำนวนขนาดของโฟลเดอร์ที่เหลือ
$TotalKeepSize = 0
try {
    $TotalKeepSize = (Get-ChildItem -Path ".\DUY-DOE-PROJECT" -Recurse -ErrorAction SilentlyContinue | 
        Measure-Object -Property Length -Sum).Sum
} catch {
    $TotalKeepSize = 0
}

Write-Host "   📊 พื้นที่ที่จะลบ: $(if ($TotalDeleteSize -gt 1MB) { '{0:N2} MB' -f ($TotalDeleteSize / 1MB) } elseif ($TotalDeleteSize -gt 1KB) { '{0:N2} KB' -f ($TotalDeleteSize / 1KB) } else { '{0:N0} B' -f $TotalDeleteSize })" -ForegroundColor Red
Write-Host "   💾 พื้นที่ที่เหลือ: $(if ($TotalKeepSize -gt 1MB) { '{0:N2} MB' -f ($TotalKeepSize / 1MB) } elseif ($TotalKeepSize -gt 1KB) { '{0:N2} KB' -f ($TotalKeepSize / 1KB) } else { '{0:N0} B' -f $TotalKeepSize })" -ForegroundColor Green

Write-Host ""
Write-Host "🎯 คำแนะนำ:" -ForegroundColor Yellow
Write-Host "   1. โฟลเดอร์ DUY-DOE-PROJECT เป็นโปรเจกต์หลักที่จัดระเบียบใหม่" -ForegroundColor Gray
Write-Host "   2. โฟลเดอร์และไฟล์อื่นๆ เป็นของเก่าที่ไม่จำเป็นต้องเก็บ" -ForegroundColor Gray
Write-Host "   3. การลบจะช่วยให้โปรเจกต์สะอาดและเป็นระเบียบ" -ForegroundColor Gray

Write-Host ""
Write-Host "❓ ต้องการดำเนินการลบต่อหรือไม่?" -ForegroundColor Yellow
Write-Host "   ใช้คำสั่ง: .\cleanup-project.ps1" -ForegroundColor Gray
Write-Host "   เพื่อลบโฟลเดอร์และไฟล์ที่ไม่สำคัญ" -ForegroundColor Gray
