// ฟังก์ชันจัดการการดึงข้อมูล (เรียกใช้จากปุ่มใน HTML)
async function handleFetch(mode) {
    const url = document.getElementById('aiLinkInput').value.trim();
    const statusDiv = document.getElementById('aiStatus');
    
    if (!url) return alert('กรุณาวางลิงก์ YouTube ก่อนครับ');

    // แสดงสถานะ
    statusDiv.style.display = 'flex';
    statusDiv.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${mode === 'ai' ? 'AI กำลังประมวลผล...' : 'กำลังดึงข้อมูลด่วน...'}`;

    try {
        const response = await fetch('http://localhost:3000/api/ai/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                url: url, 
                fastMode: (mode === 'quick') // ถ้ากดด่วน จะไม่ใช้ AI เพื่อความเร็ว
            })
        });

        const result = await response.json();
        
        if (result.success) {
            fillForm(result.data);
            alert(mode === 'ai' ? '✅ AI แต่งเนื้อหาเรียบร้อย!' : '⚡ ดึงข้อมูลด่วนสำเร็จ!');
        } else {
            alert('❌ เกิดข้อผิดพลาด: ' + result.error);
        }
    } catch (error) {
        alert('❌ ไม่สามารถเชื่อมต่อกับ Server ได้ (ตรวจสอบว่ารัน node server.js หรือยัง)');
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