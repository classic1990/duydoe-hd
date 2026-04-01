// ฟังก์ชันจัดการการดึงข้อมูล (เรียกใช้จากปุ่มใน HTML)
async function handleFetch(mode) {
    const url = document.getElementById('aiLinkInput').value.trim();
    const statusDiv = document.getElementById('aiStatus');

    if (!url) return alert('กรุณาวางลิงก์ YouTube ก่อนครับ');

    // แสดงสถานะ
    statusDiv.style.display = 'flex';
    statusDiv.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${mode === 'ai' ? 'AI กำลังประมวลผล...' : 'กำลังดึงข้อมูลด่วน...'}`;

    try {
        // ใช้ Backend API แทนการเรียกตรง
        const result = await window.backendAPI.analyzeMovie(url, mode === 'quick');

        fillForm(result);
        alert(mode === 'ai' ? '✅ AI แต่งเนื้อหาเรียบร้อย!' : '⚡ ดึงข้อมูลด่วนสำเร็จ!');

    } catch (error) {
        console.error('Fetch error:', error);

        // ตรวจสอบว่าเป็น error จาก backend หรือไม่
        if (error.message.includes('Failed to fetch')) {
            alert('❌ ไม่สามารถเชื่อมต่อกับ Backend Server ได้\n💡 ตรวจสอบว่ารัน node server.js บน port 3000 หรือยัง');
        } else {
            alert('❌ เกิดข้อผิดพลาด: ' + error.message);
        }
    } finally {
        statusDiv.style.display = 'none';
    }
}

// ฟังก์ชันเติมข้อมูลลงในฟอร์มหน้าเว็บ
function fillForm(data) {
    document.getElementById('title').value = data.title || '';
    document.getElementById('poster').value = data.poster || '';
    document.getElementById('videoUrl').value = data.videoUrl || '';
    document.getElementById('description').value = data.description || '';
    document.getElementById('category').value = data.category || 'ทั่วไป';

    // สั่งให้หน้าเว็บอัปเดต Preview รูปภาพทันที
    if (typeof updatePreview === 'function') updatePreview();
}