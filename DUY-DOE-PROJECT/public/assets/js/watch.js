// This file is deprecated - use watch-enhanced.js instead
// Kept for backward compatibility
console.log('⚠️ watch.js is deprecated, please use watch-enhanced.js');

// 3. Data Fetching
async function loadMovie(movieId) {
    try {
        // Show loading
        showLoadingScreen();

        // Get movie from Firestore or mock data
        currentMovieData = await getMovieById(movieId);

        if (currentMovieData) {
            updateWatchUI();

            // Load video if available
            if (currentMovieData.videoUrl || currentMovieData.trailerUrl) {
                renderVideoPlayer(currentMovieData.videoUrl || currentMovieData.trailerUrl);
            }

            // Load episodes if series
            if (currentMovieData.type === 'series') {
                await loadEpisodes(movieId);
            }

            // Update view count
            await updateViewCount(movieId);
        } else {
            showError('ไม่พบหนังที่คุณต้องการ');
        }
    } catch (error) {
        console.error('Error loading movie:', error);
        showError('ไม่สามารถโหลดหนังได้ กรุณาลองใหม่');
    } finally {
        hideLoadingScreen();
    }
}

// 4. UI Rendering
function updateWatchUI(movie) {
    document.title = `${movie.title} | DUY-DOE 4K`;

    const uiMap = {
        'movieTitle': movie.title,
        'movieDescription': movie.description || 'ไม่มีข้อมูลเรื่องย่อสำหรับภาพยนตร์เรื่องนี้',
        'movieYear': movie.year || '2024',
        'movieCategory': movie.category || 'ทั่วไป',
        'movieQuality': movie.badge || movie.quality || '4K HDR',
        'movieViews': (movie.views || 0).toLocaleString() + ' วิว'
    };

    for (const [id, value] of Object.entries(uiMap)) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    // Dynamic Theme Color from Poster
    if (movie.poster || movie.posterUrl) {
        applyDynamicBackground(movie.poster || movie.posterUrl);
    }
}

function applyDynamicBackground(imageUrl) {
    if (!imageUrl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 1;
        canvas.height = 1;
        ctx.drawImage(img, 0, 0, 1, 1);
        const data = ctx.getImageData(0, 0, 1, 1).data;
        const rgb = `${data[0]}, ${data[1]}, ${data[2]}`;

        document.body.style.background = `linear-gradient(135deg, rgba(${rgb}, 0.8), rgba(5, 5, 5, 0.95))`;
        document.body.style.backgroundAttachment = 'fixed';
    };
    img.src = imageUrl;
}

function extractYouTubeId(url) {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

function renderVideoPlayer(videoUrl) {
    const playerContainer = document.getElementById('videoPlayer');
    if (!playerContainer) return;

    if (!videoUrl) {
        playerContainer.innerHTML = `<div class="player-error">ไม่พบไฟล์วิดีโอ</div>`;
        return;
    }

    const youtubeId = extractYouTubeId(videoUrl);
    if (youtubeId) {
        initYouTube(youtubeId);
    } else {
        initHTML5(videoUrl);
    }
}

// 5. Player Core
function initYouTube(videoId) {
    if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
        window.onYouTubeIframeAPIReady = () => createYTPlayer(videoId);
    } else {
        createYTPlayer(videoId);
    }
}

function createYTPlayer(videoId) {
    ytPlayer = new YT.Player('videoPlayer', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: { 'autoplay': 1, 'rel': 0, 'modestbranding': 1 },
        events: {
            'onStateChange': (event) => {
                if (event.data === YT.PlayerState.ENDED) onVideoEnded();
            }
        }
    });
}

function initHTML5(url) {
    const playerContainer = document.getElementById('videoPlayer');
    playerContainer.innerHTML = `
        <video id="mainVideo" controls autoplay class="w-full h-full">
            <source src="${url}" type="video/mp4">
        </video>`;

    const video = document.getElementById('mainVideo');
    video.addEventListener('ended', onVideoEnded);
}

// 6. Features (Related, Autoplay, History)
async function loadRelatedMovies(category) {
    const db = window.firebaseDB || firebase.firestore();
    const query = await db.collection('movies')
        .where('category', '==', category)
        .limit(6)
        .get();

    const container = document.getElementById('relatedMovies');
    relatedMovieQueue = [];

    const html = query.docs
        .filter(doc => doc.id !== movieId)
        .map(doc => {
            const m = { id: doc.id, ...doc.data() };
            relatedMovieQueue.push(m);
            return `
                <div class="related-card" onclick="window.location.href='watch.html?v=${m.id}'">
                    <img src="${m.poster || m.posterUrl}" alt="${m.title}">
                    <div class="related-info">
                        <h5>${m.title}</h5>
                        <span>${m.year}</span>
                    </div>
                </div>`;
        }).join('');

    if (container) container.innerHTML = html || '<p>ไม่มีหนังที่เกี่ยวข้อง</p>';
}

function onVideoEnded() {
    if (relatedMovieQueue.length > 0) {
        showAutoplayPrompt();
    }
}

function showAutoplayPrompt() {
    const prompt = document.getElementById('autoplayPrompt');
    if (!prompt) return;

    const next = relatedMovieQueue[0];
    document.getElementById('nextMovieName').textContent = next.title;
    prompt.classList.add('show');

    autoplayTimer = setInterval(() => {
        autoplaySeconds--;
        document.getElementById('countdown').textContent = autoplaySeconds;
        if (autoplaySeconds <= 0) {
            clearInterval(autoplayTimer);
            window.location.href = `watch.html?v=${next.id}`;
        }
    }, 1000);
}

// 7. Helpers & Interaction
function setupGlobalListeners() {
    // Share Button
    document.getElementById('shareBtn')?.addEventListener('click', () => {
        navigator.clipboard.writeText(window.location.href);
        showToast('คัดลอกลิงก์เรียบร้อยแล้ว!');
    });

    // Cancel Autoplay
    document.getElementById('cancelAutoplay')?.addEventListener('click', () => {
        clearInterval(autoplayTimer);
        document.getElementById('autoplayPrompt').classList.remove('show');
    });
}

function extractYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

async function updateViewsCount(id) {
    const db = window.firebaseDB || firebase.firestore();
    db.collection('movies').doc(id).update({
        views: firebase.firestore.FieldValue.increment(1)
    });
}

function showNotFound() {
    const container = document.querySelector('.watch-container');
    if (container) {
        container.innerHTML = `
            <div class="error-page">
                <h2>ไม่พบภาพยนตร์ที่คุณต้องการ</h2>
                <a href="index.html" class="btn-primary">กลับหน้าหลัก</a>
            </div>`;
    }
}

// ฟังก์ชันเสริมที่เรียกใช้จาก main.js ได้
function showToast(msg, type) {
    if (window.showToast && typeof window.showToast === 'function') {
        window.showToast(msg, type);
    } else {
        alert(msg);
    }
}