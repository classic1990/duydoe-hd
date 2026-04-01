// This file is deprecated - use admin-add-movie.js instead
// Kept for backward compatibility
console.log('⚠️ add-movie.js is deprecated, please use admin-add-movie.js');

// Initialize Event Listeners
function initializeEventListeners() {
    // Form submission
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    // Poster preview
    const previewPosterBtn = document.getElementById('previewPosterBtn');
    if (previewPosterBtn) {
        previewPosterBtn.addEventListener('click', previewPoster);
    }

    posterUrlInput?.addEventListener('input', debounce(previewPoster, 500));
    posterUrlInput?.addEventListener('blur', previewPoster);

    // Video validation
    const validateVideoBtn = document.getElementById('validateVideoBtn');
    if (validateVideoBtn) {
        validateVideoBtn.addEventListener('click', () => validateVideo('video'));
    }

    videoUrlInput?.addEventListener('input', debounce(() => validateVideo('video'), 500));

    // Trailer validation
    const validateTrailerBtn = document.getElementById('validateTrailerBtn');
    if (validateTrailerBtn) {
        validateTrailerBtn.addEventListener('click', () => validateVideo('trailer'));
    }

    trailerUrlInput?.addEventListener('input', debounce(() => validateVideo('trailer'), 500));

    // Rating stars
    initializeRatingStars();

    // Tags preview
    tagsInput?.addEventListener('input', updateTagsPreview);

    // Character count
    descriptionInput?.addEventListener('input', updateCharCount);

    // Reset button
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetForm);
    }

    // Form field validation
    initializeFieldValidation();
}

// Preview Poster
function previewPoster() {
    const url = posterUrlInput?.value.trim();
    if (!url) {
        hidePosterPreview();
        return;
    }

    // Show loading state
    showPosterLoading();

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = function () {
        posterPreviewImg.src = url;
        posterPreviewImg.style.display = 'block';
        hidePosterLoading();

        // Add success feedback
        posterUrlInput.classList.add('valid');
        posterUrlInput.classList.remove('invalid');
    };

    img.onerror = function () {
        hidePosterPreview();
        showPosterError();

        // Add error feedback
        posterUrlInput.classList.add('invalid');
        posterUrlInput.classList.remove('valid');
    };

    img.src = url;
}

function showPosterLoading() {
    if (posterPreview) {
        posterPreview.innerHTML = `
                <div class="preview-loading">
                    <div class="loading-spinner small"></div>
                    <span>กำลังโหลด...</span>
                </div>
            `;
    }
}

function hidePosterLoading() {
    const loading = posterPreview?.querySelector('.preview-loading');
    if (loading) {
        loading.remove();
    }
}

function hidePosterPreview() {
    if (posterPreviewImg) {
        posterPreviewImg.style.display = 'none';
    }
    if (posterPreview && !posterPreview.querySelector('.preview-error')) {
        posterPreview.innerHTML = `
                <div class="preview-placeholder">
                    <i class="fas fa-image"></i>
                    <span>ตัวอย่างโปสเตอร์จะปรากฏที่นี่</span>
                </div>
            `;
    }
}

function showPosterError() {
    if (posterPreview) {
        posterPreview.innerHTML = `
                <div class="preview-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>ไม่สามารถโหลดรูปภาพได้ กรุณาตรวจสอบ URL</span>
                </div>
            `;
    }
}

// Validate Video URL
async function validateVideo(type) {
    const input = type === 'video' ? videoUrlInput : trailerUrlInput;
    const url = input?.value.trim();

    if (!url) {
        hideVideoInfo(type);
        return;
    }

    // Show loading state
    showVideoLoading(type);

    try {
        const videoInfo = await extractVideoInfo(url);
        showVideoSuccess(type, videoInfo);

        // Add success feedback
        input.classList.add('valid');
        input.classList.remove('invalid');
    } catch (error) {
        showVideoError(type);

        // Add error feedback
        input.classList.add('invalid');
        input.classList.remove('valid');
    }
}

async function extractVideoInfo(url) {
    // Check if YouTube URL
    const youtubeId = extractYouTubeId(url);
    if (youtubeId) {
        return {
            type: 'youtube',
            id: youtubeId,
            title: `YouTube Video - ${youtubeId}`,
            thumbnail: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
        };
    }

    // For direct video URLs, just validate the URL format
    new URL(url);
    return {
        type: 'direct',
        url: url,
        title: 'Direct Video'
    };
}

function showVideoLoading(type) {
    const container = type === 'video' ? videoInfo : document.getElementById('trailerInfo');
    if (container) {
        container.innerHTML = `
                <div class="video-loading">
                    <div class="loading-spinner small"></div>
                    <span>กำลังตรวจสอบ...</span>
                </div>
            `;
    }
}

function showVideoSuccess(type, info) {
    const container = type === 'video' ? videoInfo : document.getElementById('trailerInfo');
    if (container) {
        container.innerHTML = `
                <div class="video-success">
                    <div class="video-thumbnail">
                        ${info.thumbnail ? `<img src="${info.thumbnail}" alt="${info.title}">` : '<i class="fas fa-play-circle"></i>'}
                    </div>
                    <div class="video-details">
                        <h4>${info.title}</h4>
                        <p>ประเภท: ${info.type === 'youtube' ? 'YouTube' : 'Direct Link'}</p>
                        ${info.id ? `<p>Video ID: ${info.id}</p>` : ''}
                    </div>
                </div>
            `;
    }
}

function showVideoError(type) {
    const container = type === 'video' ? videoInfo : document.getElementById('trailerInfo');
    if (container) {
        container.innerHTML = `
                <div class="video-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>ไม่สามารถตรวจสอบวิดีโอได้ กรุณาตรวจสอบ URL</span>
                </div>
            `;
    }
}

function hideVideoInfo(type) {
    const container = type === 'video' ? videoInfo : document.getElementById('trailerInfo');
    if (container) {
        container.innerHTML = `
                <div class="info-placeholder">
                    <i class="fas fa-play-circle"></i>
                    <span>ข้อมูลวิดีโอจะปรากฏที่นี่หลังตรวจสอบ</span>
                </div>
            `;
    }
}

// Rating Stars
function initializeRatingStars() {
    const stars = document.querySelectorAll('#ratingStars i');
    const rating = ratingInput;

    stars.forEach((star, index) => {
        star.addEventListener('click', () => {
            const value = (index + 1) * 2; // Convert 5-star to 10-point scale
            rating.value = value;
            updateRatingStars(value);
        });

        star.addEventListener('mouseenter', () => {
            const value = (index + 1) * 2;
            updateRatingStars(value);
        });
    });

    document.getElementById('ratingStars').addEventListener('mouseleave', () => {
        updateRatingStars(parseFloat(rating.value) || 0);
    });

    rating?.addEventListener('input', () => {
        updateRatingStars(parseFloat(rating.value) || 0);
    });
}

function updateRatingStars(value) {
    const stars = document.querySelectorAll('#ratingStars i');
    const fullStars = Math.floor(value / 2);
    const hasHalfStar = value % 2 >= 1;

    stars.forEach((star, index) => {
        star.classList.remove('fas', 'far', 'fa-star-half-alt');

        if (index < fullStars) {
            star.classList.add('fas');
        } else if (index === fullStars && hasHalfStar) {
            star.classList.add('fa-star-half-alt');
        } else {
            star.classList.add('far');
        }
    });
}

// Tags Preview
function updateTagsPreview() {
    const tags = tagsInput?.value.trim();
    if (!tags || !tagsPreview) return;

    const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);

    if (tagArray.length === 0) {
        tagsPreview.innerHTML = '';
        return;
    }

    tagsPreview.innerHTML = tagArray.map(tag =>
        `<span class="tag-preview">${tag}</span>`
    ).join('');
}

// Character Count
function updateCharCount() {
    const text = descriptionInput?.value || '';
    const count = text.length;
    const maxLength = 2000;

    if (descCharCount) {
        descCharCount.textContent = count;
        descCharCount.classList.toggle('warning', count > maxLength * 0.8);
        descCharCount.classList.toggle('error', count >= maxLength);
    }
}

// Form Validation
function initializeFieldValidation() {
    const inputs = form?.querySelectorAll('input[required], select[required], textarea[required]');

    inputs?.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => {
            if (input.classList.contains('invalid')) {
                validateField(input);
            }
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let message = '';

    // Required field validation
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        message = 'กรุณากรอกข้อมูลนี้';
    }

    // URL validation
    if (field.type === 'url' && value) {
        try {
            new URL(value);
        } catch {
            isValid = false;
            message = 'URL ไม่ถูกต้อง';
        }
    }

    // Number validation
    if (field.type === 'number' && value) {
        const num = parseFloat(value);
        const min = parseFloat(field.min);
        const max = parseFloat(field.max);

        if (isNaN(num)) {
            isValid = false;
            message = 'กรุณากรอกตัวเลข';
        } else if (min !== undefined && num < min) {
            isValid = false;
            message = `ค่าต่ำสุดคือ ${min}`;
        } else if (max !== undefined && num > max) {
            isValid = false;
            message = `ค่าสูงสุดคือ ${max}`;
        }
    }

    // Update field appearance
    field.classList.toggle('valid', isValid && value);
    field.classList.toggle('invalid', !isValid);

    // Show/hide error message
    showFieldError(field, message);

    return isValid;
}

function showFieldError(field, message) {
    let errorElement = field.parentNode.querySelector('.field-error');

    if (message) {
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            field.parentNode.appendChild(errorElement);
        }
        errorElement.textContent = message;
    } else if (errorElement) {
        errorElement.remove();
    }
}

// Form Submission
async function handleFormSubmit(e) {
    e.preventDefault();

    // Validate all fields
    const inputs = form.querySelectorAll('input, select, textarea');
    let isValid = true;

    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });

    if (!isValid) {
        showToast('กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง', 'error');
        return;
    }

    // Show loading state
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังบันทึก...';
    submitBtn.disabled = true;

    try {
        // Collect form data
        const formData = new FormData(form);
        const movieData = Object.fromEntries(formData.entries());

        // Process additional data
        movieData.tags = movieData.tags ? movieData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
        movieData.rating = parseFloat(movieData.rating) || 0;
        movieData.year = parseInt(movieData.year);
        movieData.duration = parseInt(movieData.duration) || 0;
        movieData.popular = formData.has('popular');
        movieData.new = formData.has('new');
        movieData.featured = formData.has('featured');

        // Add timestamps
        movieData.createdAt = new Date().toISOString();
        movieData.updatedAt = new Date().toISOString();

        // Save to Firestore
        await saveMovie(movieData);

        // Show success message
        showToast('บันทึกหนังสำเร็จ!', 'success');

        // Redirect to home page after delay
        setTimeout(() => {
            window.location.href = '/';
        }, 2000);

    } catch (error) {
        console.error('Error saving movie:', error);
        showToast('ไม่สามารถบันทึกหนังได้ กรุณาลองใหม่', 'error');
    } finally {
        // Restore button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Save Movie to Firestore
async function saveMovie(movieData) {
    if (!window.firestore) {
        throw new Error('Firestore not available');
    }

    const docRef = firestore.collection('movies').doc();
    await docRef.set(movieData);

    return docRef.id;
}

// Reset Form
function resetForm() {
    if (confirm('คุณต้องการรีเซ็ตฟอร์มใช่หรือไม่? ข้อมูลทั้งหมดจะถูกลบ')) {
        form.reset();

        // Clear previews
        hidePosterPreview();
        hideVideoInfo('video');
        hideVideoInfo('trailer');
        updateTagsPreview();
        updateCharCount();
        updateRatingStars(0);

        // Clear validation states
        form.querySelectorAll('.valid, .invalid').forEach(field => {
            field.classList.remove('valid', 'invalid');
        });

        // Clear error messages
        form.querySelectorAll('.field-error').forEach(error => {
            error.remove();
        });

        showToast('รีเซ็ตฟอร์มเรียบร้อย', 'info');
    }
}

// Utility Functions
function extractYouTubeId(url) {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

function showToast(message, type = 'info') {
    if (window.showToast && typeof window.showToast === 'function') {
        window.showToast(message, type);
    } else {
        alert(message);
    }
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

console.log('🎬 Add Movie page loaded successfully');
}) ();
