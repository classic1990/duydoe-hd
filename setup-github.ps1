# ===================================
# 🚀 DUY-DOE PROJECT GITHUB SETUP SCRIPT
# ===================================

Write-Host "🚀 DUY-DOE PROJECT GITHUB SETUP" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 ขั้นตอนการตั้งค่า GitHub Repository:" -ForegroundColor Yellow
Write-Host ""

Write-Host "1️⃣ สร้าง Repository ใหม่บน GitHub:" -ForegroundColor White
Write-Host "   🔗 ไปที่: https://github.com/duydoe" -ForegroundColor Gray
Write-Host "   📝 คลิก 'New repository'" -ForegroundColor Gray
Write-Host "   🏷️  ตั้งชื่อ: duydoe-hd" -ForegroundColor Gray
Write-Host "   🌐  เลือก Public หรือ Private" -ForegroundColor Gray
Write-Host "   ✅ คลิก 'Create repository'" -ForegroundColor Gray
Write-Host ""

Write-Host "2️⃣ หลังสร้าง Repository แล้ว รันคำสั่งเหล่านี้:" -ForegroundColor White
Write-Host "   cd D:\DEV" -ForegroundColor Gray
Write-Host "   git remote set-url origin https://github.com/duydoe/duydoe-hd.git" -ForegroundColor Gray
Write-Host "   git push origin main" -ForegroundColor Gray
Write-Host ""

Write-Host "3️⃣ ถ้าต้องการลบของเก่าและอัปโหลดใหม่:" -ForegroundColor White
Write-Host "   git push origin main --force" -ForegroundColor Gray
Write-Host ""

Write-Host "⚠️  หมายเหตุ:" -ForegroundColor Red
Write-Host "   - การใช้ --force จะลบของเก่าทั้งหมด" -ForegroundColor DarkRed
Write-Host "   - ต้องแน่ใจว่า Repository ใหม่สร้างเรียบร้อยแล้ว" -ForegroundColor DarkRed
Write-Host "   - ข้อมูลเก่าจะหายไปทั้งหมด" -ForegroundColor DarkRed
Write-Host ""

Write-Host "❓ พร้อมทำต่อหรือไม่? (y/N)" -ForegroundColor Yellow -NoNewline
$Ready = Read-Host

if ($Ready -match '^[Yy]') {
    Write-Host ""
    Write-Host "🔍 ตรวจสอบ remote URL ปัจจุบัน:" -ForegroundColor Cyan
    
    $CurrentRemote = git remote get-url origin 2>$null
    if ($CurrentRemote) {
        Write-Host "📎 Remote URL ปัจจุบัน: $CurrentRemote" -ForegroundColor White
    } else {
        Write-Host "❌ ไม่พบ remote URL" -ForegroundColor Red
        Write-Host "🔧 กำลังตั้งค่า remote URL..." -ForegroundColor Yellow
        git remote add origin https://github.com/duydoe/duydoe-hd.git
        Write-Host "✅ ตั้งค่า remote URL เรียบร้อย" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "🚀 พร้อมสำหรับการอัปโหลด!" -ForegroundColor Green
    Write-Host ""
    Write-Host "คำสั่งที่ต้องรัน:" -ForegroundColor White
    Write-Host "git push origin main --force" -ForegroundColor Gray
    Write-Host ""
    Write-Host "หรือต้องการให้รันอัตโนมัติ? (y/N)" -ForegroundColor Yellow -NoNewline
    $AutoPush = Read-Host
    
    if ($AutoPush -match '^[Yy]') {
        Write-Host ""
        Write-Host "🚀 กำลังอัปโหลดไปยัง GitHub..." -ForegroundColor Yellow
        
        try {
            git push origin main --force
            Write-Host ""
            Write-Host "🎉 อัปโหลดสำเร็จ!" -ForegroundColor Green
            Write-Host "🔗 ดูได้ที่: https://github.com/duydoe/duydoe-hd" -ForegroundColor Cyan
        }
        catch {
            Write-Host ""
            Write-Host "❌ อัปโหลดไม่สำเร็จ!" -ForegroundColor Red
            Write-Host "📋 กรุณาตรวจสอบ:" -ForegroundColor Yellow
            Write-Host "   1. Repository สร้างเรียบร้อยแล้วหรือไม่?" -ForegroundColor Gray
            Write-Host "   2. มีสิทธิ์ push หรือไม่?" -ForegroundColor Gray
            Write-Host "   3. Internet connection ปกติหรือไม่?" -ForegroundColor Gray
        }
    }
} else {
    Write-Host ""
    Write-Host "❌ ยกเลิกการดำเนินการ" -ForegroundColor Red
    Write-Host "📋 ทำตามขั้นตอนข้างบนเมื่อพร้อม" -ForegroundColor Gray
}
