// ===============================
// 🎬 WATCH PAGE FINAL (FULL)
// ===============================

// 🛑 GUARD กันพัง
if (!document.getElementById('videoPlayer')) {
    console.log('⛔ Not watch page');
} else {

    // Get movie ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    let movieId = urlParams.get('id');

    // Also support 'v' parameter for backward compatibility
    if (!movieId) {
        movieId = urlParams.get('v');
    }

    // Debug logging
    console.log('🎬 Movie ID from URL:', movieId);

    let currentMovie = null;

    // ===============================
    // INIT
    // ===============================
    document.addEventListener('DOMContentLoaded', async () => {
        if (!movieId) {
            console.error('❌ No movie ID found in URL');
            return showNotFound();
        }

        console.log('🚀 Loading movie:', movieId);
        await loadMovie(movieId);
        setupEvents();

        // เพิ่ม animation เมื่อโหลดเสร็จ
        document.body.classList.add('loaded');
    });

    // ===============================
    // LOAD MOVIE
    // ===============================
    async function loadMovie(id) {
        try {
            console.log('📥 Starting to load movie:', id);

            // ตรวจสอบว่า Firebase พร้อมใช้งาน
            if (!window.firebase || !window.firebase.firestore) {
                throw new Error('Firebase ไม่พร้อมใช้งาน');
            }

            const db = firebase.firestore();
            console.log('✅ Firebase DB ready');

            const doc = await db.collection('movies').doc(id).get();
            console.log('📄 Document retrieved:', doc.exists);

            if (!doc.exists) {
                console.error('❌ Movie not found:', id);
                return showNotFound();
            }

            const movie = doc.data();
            movie.id = doc.id; // Add document ID to movie object
            currentMovie = movie;

            console.log('🎬 Movie data loaded:', {
                title: movie.title,
                hasVideoUrl: !!movie.videoUrl,
                category: movie.category
            });

            updateUI(movie);

            if (movie.videoUrl) {
                console.log('🎥 Rendering video player with URL:', movie.videoUrl);
                renderPlayer(movie.videoUrl);
            } else {
                console.error('❌ No video URL found for movie:', id);
                showToast('ไม่พบลิงก์วิดีโอ');
            }

            await loadRelated(movie.category);
            await increaseViews(id);

        } catch (e) {
            console.error('❌ Load movie error:', e);
            showToast('โหลดหนังไม่สำเร็จ: ' + e.message);
        }
    }

    // ===============================
    // UI
    // ===============================
    function updateUI(m) {
        // Update with animation
        const titleEl = document.getElementById('movieTitle');
        const descEl = document.getElementById('movieDescription');
        const yearEl = document.getElementById('movieYear');
        const categoryEl = document.getElementById('movieCategory');
        const viewsEl = document.getElementById('movieViews');

        // Animate title
        if (titleEl) {
            titleEl.style.opacity = '0';
            titleEl.textContent = m.title || 'ไม่มีชื่อ';
            setTimeout(() => {
                titleEl.style.transition = 'opacity 0.5s ease';
                titleEl.style.opacity = '1';
            }, 100);
        }

        if (descEl) descEl.textContent = m.description || 'ไม่มีรายละเอียด';
        if (yearEl) yearEl.textContent = m.year || '2024';
        if (categoryEl) categoryEl.textContent = m.category || 'ทั่วไป';
        if (viewsEl) viewsEl.textContent = m.views || 0;

        // Update page title
        document.title = `กำลังดู ${m.title} - DUY-DOE FILM`;
    }

    // ===============================
    // PLAYER
    // ===============================
    function renderPlayer(url) {
        const box = document.getElementById('videoPlayer');

        if (!url) {
            box.innerHTML = '<div style="padding: 50px; text-align: center; color: #fff;">ไม่พบลิงก์วิดีโอ</div>';
            return;
        }

        const yt = extractYouTubeId(url);

        if (yt) {
            box.innerHTML = `
        <iframe 
            width="100%" height="100%"
            src="https://www.youtube.com/embed/${yt}?autoplay=1&mute=0&controls=1&rel=0&modestbranding=1"
            frameborder="0"
            allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen>
        </iframe>`;
            console.log('🎬 Playing YouTube:', yt);
        } else if (url.endsWith('.mp4') || url.includes('.mp4?')) {
            box.innerHTML = `
        <video controls autoplay width="100%" style="width:100%; height:100%;">
            <source src="${url}" type="video/mp4">
            เบราว์เซอร์ของคุณไม่รองรับวิดีโอนี้
        </video>`;
            console.log('🎬 Playing MP4:', url);
        } else {
            box.innerHTML = `
        <iframe 
            width="100%" height="100%"
            src="${url}"
            frameborder="0"
            allowfullscreen
            allow="autoplay; encrypted-media; gyroscope; picture-in-picture">
        </iframe>`;
            console.log('🎬 Playing iframe:', url);
        }
    }

    // ===============================
    // RELATED
    // ===============================
    async function loadRelated(category) {
        if (!category) return;

        try {
            // ตรวจสอบว่า Firebase พร้อมใช้งาน
            if (!window.firebase || !window.firebase.firestore) {
                throw new Error('Firebase ไม่พร้อมใช้งาน');
            }

            const db = firebase.firestore();

            const snap = await db.collection('movies')
                .where('category', '==', category)
                .limit(6)
                .get();

            const box = document.getElementById('relatedMovies');

            box.innerHTML = snap.docs
                .filter(d => d.id !== movieId)
                .map(d => {
                    const m = d.data();
                    return `
                <div class="movie-card" onclick="location.href='/watch.html?id=${d.id}'">
                    <div class="movie-poster">
                        <img src="${m.poster || '/img/default.jpg'}" alt="${m.title}">
                    </div>
                    <div class="movie-info">
                        <h3>${m.title}</h3>
                    </div>
                </div>
                `;
                }).join('');

            // Add carousel functionality
            setupRelatedCarousel();
        } catch (e) {
            console.error('Load related error:', e);
        }
    }

    // Setup carousel for related movies
    function setupRelatedCarousel() {
        const grid = document.getElementById('relatedMovies');
        const prevBtn = document.getElementById('prevRelated');
        const nextBtn = document.getElementById('nextRelated');

        if (!grid || !prevBtn || !nextBtn) return;

        let scrollPosition = 0;
        const scrollAmount = 220; // Width of one movie card + gap

        prevBtn.addEventListener('click', () => {
            scrollPosition = Math.max(0, scrollPosition - scrollAmount);
            grid.scrollTo({
                left: scrollPosition,
                behavior: 'smooth'
            });
        });

        nextBtn.addEventListener('click', () => {
            const maxScroll = grid.scrollWidth - grid.clientWidth;
            scrollPosition = Math.min(maxScroll, scrollPosition + scrollAmount);
            grid.scrollTo({
                left: scrollPosition,
                behavior: 'smooth'
            });
        });
    }

    // ===============================
    // HELPERS
    // ===============================
    function extractYouTubeId(url) {
        // รองรับทุกรูปแบบ YouTube URL
        const patterns = [
            /youtube\.com\/embed\/([^?]+)/,
            /youtube\.com\/watch\?v=([^&]+)/,
            /youtu\.be\/([^?]+)/,
            /youtube\.com\/v\/([^?]+)/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }

        return null;
    }

    async function increaseViews(id) {
        try {
            // ตรวจสอบว่า Firebase พร้อมใช้งาน
            if (!window.firebase || !window.firebase.firestore) {
                throw new Error('Firebase ไม่พร้อมใช้งาน');
            }

            const db = firebase.firestore();

            await db.collection('movies').doc(id).update({
                views: firebase.firestore.FieldValue.increment(1)
            });
            console.log('✅ Updated views for:', id);
        } catch (e) {
            console.error('Update views error:', e);
        }
    }

    function showNotFound() {
        document.body.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: #000; color: #fff; text-align: center;">
        <div>
            <h1 style="font-size: 3rem; margin-bottom: 20px;">404</h1>
            <h2 style="margin-bottom: 20px;">ไม่พบหนัง</h2>
            <a href="/" style="color: var(--brand-primary); text-decoration: none; font-size: 18px;">
                <i class="fas fa-home"></i> กลับหน้าแรก
            </a>
        </div>
    </div>`;
    }

    // ===============================
    // EVENTS
    // ===============================
    function setupEvents() {
        // Share button
        document.getElementById('shareBtn')?.addEventListener('click', () => {
            if (navigator.share) {
                navigator.share({
                    title: currentMovie?.title || 'หนังจาก DUY-DOE FILM',
                    text: currentMovie?.description || 'ดูหนังออนไลน์คุณภาพสูง',
                    url: window.location.href
                });
            } else {
                navigator.clipboard.writeText(window.location.href);
                showToast('คัดลอกลิงก์แล้ว');
            }
        });

        // Play next button
        document.getElementById('playNextBtn')?.addEventListener('click', () => {
            const next = document.querySelector('#relatedMovies .movie-card');
            if (next) next.click();
        });

        // Favorite button
        document.getElementById('favoriteBtn')?.addEventListener('click', () => {
            const btn = document.getElementById('favoriteBtn');
            const icon = btn.querySelector('i');

            if (icon.classList.contains('far')) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                showToast('เพิ่มในรายการโปรดแล้ว');
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
                showToast('นำออกจากรายการโปรดแล้ว');
            }
        });

        // Download button
        document.getElementById('downloadBtn')?.addEventListener('click', () => {
            showToast('ฟีเจอร์ดาวน์โหลดจะเปิดให้บริการเร็วๆ นี้');
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'f' && e.ctrlKey) {
                e.preventDefault();
                document.getElementById('favoriteBtn')?.click();
            }
            if (e.key === 's' && e.ctrlKey) {
                e.preventDefault();
                document.getElementById('shareBtn')?.click();
            }
        });
    }

    // ===============================
    // TOAST
    // ===============================
    function showToast(msg) {
        console.log('📢 Toast:', msg);
        // แสดง toast จริงถ้ามี element
        const toast = document.createElement('div');
        toast.style.cssText = `
        position: fixed; top: 100px; right: 20px; 
        background: rgba(229, 9, 20, 0.9); color: white; padding: 16px 24px; 
        border-radius: 12px; z-index: 9999; font-weight: 500;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
        toast.textContent = msg;
        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

}