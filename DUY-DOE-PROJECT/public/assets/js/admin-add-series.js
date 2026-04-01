// ===============================
// 📺 ADMIN ADD SERIES SCRIPT
// ===============================

// Check admin access function
function checkAdminAccess() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const loginTime = localStorage.getItem('loginTime');
    
    if (!isLoggedIn || !loginTime) {
        console.log('❌ Not logged in, redirecting to login');
        window.location.href = '/login.html';
        return false;
    }
    
    const timeDiff = Date.now() - parseInt(loginTime);
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    if (hoursDiff >= 24) {
        console.log('⏰ Session expired, logging out');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('loginTime');
        window.location.href = '/login.html';
        return false;
    }
    
    console.log('✅ Admin access confirmed');
    return true;
}

// Check if Firebase is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('📺 Admin add series page loaded');
    
    // Check admin access
    if (!checkAdminAccess()) {
        console.log('❌ No admin access, redirecting to login');
        return;
    }
    
    console.log('✅ Admin access confirmed');
    
    // Initialize form
    try {
        initializeForm();
        console.log('✅ Form initialized');
    } catch (error) {
        console.error('❌ Error initializing form:', error);
    }
    
    // Setup preview
    try {
        setupPreview();
        console.log('✅ Preview setup complete');
    } catch (error) {
        console.error('❌ Error setting up preview:', error);
    }
    
    // Setup form submission
    try {
        setupFormSubmission();
        console.log('✅ Form submission setup complete');
    } catch (error) {
        console.error('❌ Error setting up form submission:', error);
    }

    // Setup validation
    try {
        setupValidation();
        console.log('✅ Validation setup complete');
    } catch (error) {
        console.error('❌ Error setting up validation:', error);
    }
    
    // Setup AI fetch functionality
    try {
        setupSeriesFetch();
        console.log('✅ Series fetch setup complete');
    } catch (error) {
        console.error('❌ Error setting up series fetch:', error);
    }
    
    console.log('🎉 Admin series page fully initialized');
});

// ===============================
// INITIALIZE FORM
// ===============================
function initializeForm() {
    console.log('🔍 Initializing admin series form...');
    
    const form = document.getElementById('addSeriesForm');
    if (!form) {
        console.log('❌ Add series form not found');
        return;
    }
    
    console.log('✅ Add series form found');

    // Clear form button
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (confirm('ต้องการล้างข้อมูลทั้งหมดหรือไม่?')) {
                form.reset();
                clearPreview();
                showToast('ล้างฟอร์มเรียบร้อย');
            }
        });
    }

    console.log('✅ Form initialized');
}

// ===============================
// SETUP FORM SUBMISSION
// ===============================
function setupFormSubmission() {
    const form = document.getElementById('addSeriesForm');
    if (!form) {
        console.log('❌ Add series form not found');
        return;
    }

    console.log('✅ Setting up series form submission');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        console.log('🎯 Series form submission started');

        // Show loading
        showLoading(true);

        try {
            // Get form data
            const formData = getSeriesFormData();
            
            console.log('📊 Series form data received:', {
                hasTitle: !!formData.title,
                hasVideo: !!formData.videoUrl,
                hasPoster: !!formData.poster,
                hasCategory: !!formData.category
            });

            // Validate
            const validation = validateSeriesFormData(formData);
            if (!validation.valid) {
                console.log('❌ Validation failed:', validation.error);
                showToast(validation.error, 'error');
                return;
            }
            
            console.log('✅ Series form validation passed');

            // Save to Firebase
            const result = await saveSeriesToFirebase(formData);
            
            if (result.success) {
                console.log('✅ Series saved successfully');
                
                // Success
                showToast('เพิ่มซีรีส์สำเร็จ!', 'success');

                // Reset form
                form.reset();
                clearPreview();

                // Redirect to admin page
                setTimeout(() => {
                    console.log('🔄 Redirecting to admin page');
                    window.location.href = '/admin-add-series.html';
                }, 2000);
            } else {
                throw new Error('ไม่สามารถบันทึกข้อมูลได้');
            }

        } catch (error) {
            console.error('❌ Error adding series:', error);
            showToast('เกิดข้อผิดพลาด: ' + error.message, 'error');
        } finally {
            showLoading(false);
        }
    });
}

// ===============================
// GET SERIES FORM DATA
// ===============================
function getSeriesFormData() {
    console.log('🔍 Getting series form data...');
    
    const data = {
        title: document.getElementById('seriesTitle')?.value || '',
        category: document.getElementById('seriesCategory')?.value || 'ทั่วไป',
        description: document.getElementById('seriesDescription')?.value || '',
        poster: document.getElementById('seriesPoster')?.value || '',
        videoUrl: document.getElementById('seriesVideoUrl')?.value || '',
        badge: document.getElementById('seriesBadge')?.value || 'ทั่วไป',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        views: 0
    };
    
    console.log('📊 Series form data collected:', {
        title: data.title,
        category: data.category,
        badge: data.badge,
        hasVideo: !!data.videoUrl,
        hasPoster: !!data.poster
    });
    
    return data;
}

// ===============================
// VALIDATE SERIES FORM DATA
// ===============================
function validateSeriesFormData(data) {
    if (!data.title.trim()) {
        return { valid: false, error: 'กรุณากรอกชื่อเรื่อง' };
    }

    if (!data.videoUrl.trim()) {
        return { valid: false, error: 'กรุณากรอกลิงก์วิดีโอ' };
    }

    if (!data.poster.trim()) {
        return { valid: false, error: 'กรุณากรอกลิงก์โปสเตอร์' };
    }

    if (!data.category) {
        return { valid: false, error: 'กรุณาเลือกหมวดหมู่' };
    }

    // Validate URL format
    try {
        new URL(data.videoUrl);
        new URL(data.poster);
    } catch {
        return { valid: false, error: 'URL ไม่ถูกต้อง' };
    }

    return { valid: true };
}

// ===============================
// SAVE SERIES TO FIREBASE
// ===============================
async function saveSeriesToFirebase(data) {
    console.log('🔍 Saving series to Firebase...');
    
    try {
        // Check if Firebase is initialized
        if (!firebase || !firebase.firestore) {
            throw new Error('Firebase ยังไม่พร้อมใช้งาน');
        }
        
        const db = firebase.firestore();
        const seriesRef = db.collection('series');
        
        console.log('📊 Saving series data:', {
            title: data.title,
            category: data.category,
            hasPoster: !!data.poster,
            hasVideo: !!data.videoUrl
        });
        
        // Add document
        const docRef = await seriesRef.add(data);
        
        console.log('✅ Series saved successfully with ID:', docRef.id);
        
        return {
            success: true,
            id: docRef.id
        };
        
    } catch (error) {
        console.error('❌ Error saving series to Firebase:', error);
        
        // ตรวจสอบประเภทข้อผิดพลาด
        let errorMessage = 'เกิดข้อผิดพลาดในการบันทึก';
        
        if (error.code === 'permission-denied') {
            errorMessage = 'ไม่มีสิทธิ์ในการบันทึกข้อมูล';
        } else if (error.code === 'unavailable') {
            errorMessage = 'การเชื่อมต่อล้มเหลว กรุณาลองใหม่';
        } else if (error.code === 'unauthenticated') {
            errorMessage = 'ต้องล็อกอินก่อนบันทึกข้อมูล';
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        throw new Error(errorMessage);
    }
}

// ===============================
// SETUP PREVIEW
// ===============================
function setupPreview() {
    console.log('🔍 Setting up series preview...');
    
    const titleInput = document.getElementById('seriesTitle');
    const categorySelect = document.getElementById('seriesCategory');
    const badgeSelect = document.getElementById('seriesBadge');
    const descriptionTextarea = document.getElementById('seriesDescription');
    const posterInput = document.getElementById('seriesPoster');

    // Update preview on input
    [titleInput, categorySelect, badgeSelect, descriptionTextarea].forEach(input => {
        if (input) {
            input.addEventListener('input', updatePreview);
        }
    });
    
    posterInput?.addEventListener('input', updatePreview);

    console.log('✅ Series preview setup complete');
}

// ===============================
// UPDATE PREVIEW
// ===============================
function updatePreview() {
    const title = document.getElementById('seriesTitle').value || 'ชื่อซีรีส์จะแสดงที่นี่';
    const category = document.getElementById('seriesCategory').value || 'หมวดหมู่';
    const badge = document.getElementById('seriesBadge').value || 'ทั่วไป';
    const description = document.getElementById('seriesDescription').value || 'คำอธิบายจะแสดงที่นี่...';
    const poster = document.getElementById('seriesPoster').value;

    // Update preview elements
    document.getElementById('previewTitle').textContent = title;
    document.getElementById('previewCategory').textContent = category;
    document.getElementById('previewBadge').textContent = badge;
    document.getElementById('previewDescription').textContent = description;

    // Update poster
    const posterImg = document.getElementById('previewPoster');
    if (poster && posterImg) {
        posterImg.src = poster;
        posterImg.onerror = () => {
            posterImg.src = '/img/default.jpg';
        };
    }
}

// ===============================
// SETUP SERIES FETCH
// ===============================
function setupSeriesFetch() {
    console.log('🔍 Setting up series fetch functionality...');
    
    const sourceUrlInput = document.getElementById('seriesSourceUrl');
    const fetchBtn = document.getElementById('fetchSeriesBtn');
    const fetchStatus = document.getElementById('fetchSeriesStatus');
    
    if (!sourceUrlInput || !fetchBtn || !fetchStatus) {
        console.log('❌ Series fetch elements not found');
        return;
    }
    
    console.log('✅ Series fetch elements found');
    
    fetchBtn.addEventListener('click', async () => {
        const sourceUrl = sourceUrlInput.value.trim();
        
        if (!sourceUrl) {
            showFetchStatus('error', 'กรุณาใส่ลิงก์ซีรีส์');
            return;
        }
        
        if (!isValidUrl(sourceUrl)) {
            showFetchStatus('error', 'ลิงก์ไม่ถูกต้อง');
            return;
        }
        
        console.log('🔍 Fetching series data from:', sourceUrl);
        showFetchStatus('loading', 'กำลังดึงข้อมูล...');

        try {
            // จำลองการดึงข้อมูล (ในสถานการณ์จริงต้องใช้ API หรือ web scraping)
            const seriesData = await fetchSeriesData(sourceUrl);
            
            console.log('📊 Series data received:', seriesData);
            
            if (seriesData) {
                console.log('🔍 Filling form with fetched data...');
                // กรอกข้อมูลที่ดึงได้ลงในฟอร์ม
                fillSeriesFormData(seriesData);
                showFetchStatus('success', 'ดึงข้อมูลสำเร็จ!');
                console.log('✅ Series data fetched and filled successfully');
            } else {
                console.log('❌ No series data received');
                showFetchStatus('error', 'ไม่สามารถดึงข้อมูลได้');
            }
        } catch (error) {
            console.error('❌ Error fetching series data:', error);
            showFetchStatus('error', 'เกิดข้อผิดพลาด: ' + error.message);
        }
    });
}

// ===============================
// FETCH SERIES DATA
// ===============================
async function fetchSeriesData(url) {
    console.log('🔍 Simulating series data fetch from:', url);
    
    // จำลองการดึงข้อมูล (ในสถานการณ์จริงต้องใช้ API หรือ web scraping)
    // โครงสร้างข้อมูลจริงจาก Firebase:
    // - title (string)
    // - category (string) - "ทั่วไป"
    // - description (string)
    // - poster (string) - YouTube thumbnail URL
    // - videoUrl (string) - YouTube embed URL
    // - badge (string) - "ทั่วไป"
    // - createdAt (timestamp)
    // - updatedAt (timestamp)
    // - views (number)
    
    // ตรวจสอบว่าเป็นลิงก์ซีรีส์ที่รู้จักหรือไม่
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        // ดึงข้อมูลจาก YouTube
        const videoId = extractYouTubeId(url);
        return {
            title: extractTitleFromUrl(url),
            category: 'ทั่วไป',
            description: extractDescriptionFromUrl(url),
            poster: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
            videoUrl: url.includes('embed') ? url : `https://www.youtube.com/embed/${videoId}`,
            badge: 'ทั่วไป'
        };
    }
    
    // สำหรับลิงก์อื่นๆ ให้สร้างข้อมูลตัวอย่าง
    return {
        title: generateTitleFromUrl(url),
        category: 'ทั่วไป',
        description: 'ดึงข้อมูลจากลิงก์สำเร็จ กรุณาแก้ไขข้อมูลตามต้องการ',
        poster: generatePosterUrl(url),
        videoUrl: url,
        badge: 'ทั่วไป'
    };
}

// ===============================
// YOUTUBE HELPER
// ===============================
function extractYouTubeId(url) {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : 'default';
}

// ===============================
// HELPER FUNCTIONS
// ===============================
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function extractTitleFromUrl(url) {
    // จำลองการดึงชื่อจาก URL
    const urlParts = url.split('/');
    const lastPart = urlParts[urlParts.length - 1];
    const title = lastPart.replace(/[-_]/g, ' ').replace(/\.(html|php|com)/g, '');
    return title || 'ซีรีส์ใหม่';
}

function generateTitleFromUrl(url) {
    const domain = new URL(url).hostname;
    return `ซีรีส์จาก ${domain}`;
}

function extractDescriptionFromUrl(url) {
    return 'ดึงข้อมูลจากลิงก์สำเร็จ นี่คือคำอธิบายตัวอย่าง กรุณาแก้ไขตามความเหมาะสม';
}

function generatePosterUrl(url) {
    // สร้าง URL โปสเตอร์ตัวอย่าง
    const hash = btoa(url).substring(0, 8);
    return `https://picsum.photos/seed/${hash}/300/450.jpg`;
}

function fillSeriesFormData(data) {
    console.log('🔍 Filling series form with data:', data);
    
    // กรอกข้อมูลที่ดึงได้ลงในฟอร์ม
    const titleInput = document.getElementById('seriesTitle');
    const categorySelect = document.getElementById('seriesCategory');
    const descriptionTextarea = document.getElementById('seriesDescription');
    const posterInput = document.getElementById('seriesPoster');
    const videoUrlInput = document.getElementById('seriesVideoUrl');
    const badgeSelect = document.getElementById('seriesBadge');

    console.log('🔍 Series form elements found:', {
        titleInput: !!titleInput,
        categorySelect: !!categorySelect,
        descriptionTextarea: !!descriptionTextarea,
        posterInput: !!posterInput,
        videoUrlInput: !!videoUrlInput,
        badgeSelect: !!badgeSelect
    });

    // กรอกข้อมูลทีละช่องพร้อม debug
    if (titleInput && data.title) {
        titleInput.value = data.title;
        console.log('✅ Title filled:', data.title);
    } else {
        console.log('❌ Title not filled - Input:', !!titleInput, 'Data:', !!data.title);
    }
    
    if (categorySelect && data.category) {
        categorySelect.value = data.category;
        console.log('✅ Category filled:', data.category);
    } else {
        console.log('❌ Category not filled - Input:', !!categorySelect, 'Data:', !!data.category);
    }
    
    if (descriptionTextarea && data.description) {
        descriptionTextarea.value = data.description;
        console.log('✅ Description filled');
    } else {
        console.log('❌ Description not filled - Input:', !!descriptionTextarea, 'Data:', !!data.description);
    }
    
    if (posterInput && data.poster) {
        posterInput.value = data.poster;
        console.log('✅ Poster filled');
    } else {
        console.log('❌ Poster not filled - Input:', !!posterInput, 'Data:', !!data.poster);
    }
    
    if (videoUrlInput && data.videoUrl) {
        videoUrlInput.value = data.videoUrl;
        console.log('✅ Video URL filled');
    } else {
        console.log('❌ Video URL not filled - Input:', !!videoUrlInput, 'Data:', !!data.videoUrl);
    }
    
    if (badgeSelect && data.badge) {
        badgeSelect.value = data.badge;
        console.log('✅ Badge filled:', data.badge);
    } else {
        console.log('❌ Badge not filled - Input:', !!badgeSelect, 'Data:', !!data.badge);
    }

    // อัปเดตพรีวิว
    try {
        updatePreview();
        console.log('✅ Preview updated');
    } catch (error) {
        console.error('❌ Error updating preview:', error);
    }
    
    console.log('🎉 Series form filling completed');
}

function showFetchStatus(type, message) {
    const fetchStatus = document.getElementById('fetchSeriesStatus');
    if (!fetchStatus) return;
    
    fetchStatus.className = `fetch-status ${type}`;
    fetchStatus.style.display = 'flex';
    
    let icon = '';
    switch (type) {
        case 'loading':
            icon = '<i class="fas fa-spinner fa-spin"></i>';
            break;
        case 'success':
            icon = '<i class="fas fa-check-circle"></i>';
            break;
        case 'error':
            icon = '<i class="fas fa-exclamation-triangle"></i>';
            break;
    }
    
    fetchStatus.innerHTML = `${icon} ${message}`;
    
    // ซ่อนข้อความหลัง 5 วินาที
    if (type !== 'loading') {
        setTimeout(() => {
            fetchStatus.style.display = 'none';
        }, 5000);
    }
}

// ===============================
// SETUP VALIDATION
// ===============================
function setupValidation() {
    const form = document.getElementById('addSeriesForm');
    if (!form) return;

    // Real-time validation
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            validateField(input);
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let message = '';

    if (field.hasAttribute('required') && !value) {
        isValid = false;
        message = 'กรุณากรอกข้อมูล';
    }

    if (field.type === 'url' && value && !isValidUrl(value)) {
        isValid = false;
        message = 'URL ไม่ถูกต้อง';
    }

    // Show validation feedback
    const formGroup = field.closest('.form-group');
    if (formGroup) {
        const existingError = formGroup.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }

        if (!isValid) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'field-error';
            errorDiv.textContent = message;
            formGroup.appendChild(errorDiv);
        }
    }

    return isValid;
}

// ===============================
// SHOW LOADING
// ===============================
function showLoading(show) {
    const submitBtn = document.querySelector('button[type="submit"]');
    const loadingText = document.getElementById('loadingText');

    if (submitBtn) {
        submitBtn.disabled = show;
        submitBtn.textContent = show ? 'กำลังบันทึก...' : 'เพิ่มซีรีส์';
    }

    if (loadingText) {
        loadingText.style.display = show ? 'block' : 'none';
    }
}

// ===============================
// CLEAR PREVIEW
// ===============================
function clearPreview() {
    const posterImg = document.getElementById('previewPoster');
    if (posterImg) {
        posterImg.src = '/img/default.jpg';
    }

    // Reset preview text
    const elements = ['previewTitle', 'previewCategory', 'previewBadge', 'previewDescription'];
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.textContent = '';
    });
}

// ===============================
// SHOW TOAST
// ===============================
function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;

    // Set background color based on type
    switch (type) {
        case 'success':
            toast.style.background = '#28a745';
            break;
        case 'error':
            toast.style.background = '#dc3545';
            break;
        default:
            toast.style.background = '#007bff';
    }

    // Add to DOM
    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// ===============================
// LOGOUT
// ===============================
function logout() {
    if (confirm('ต้องการออกจากระบบหรือไม่?')) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('loginTime');
        window.location.href = '/login.html';
    }
}
