/**
 * DUY-DOE Movie Platform - MAIN (FINAL FIXED)
 * ใช้กับ: index.html / movies.html
 * รองรับ: Firestore + UI + Favorite + Search + Filter
 */

// ===============================
// 🛑 GUARD (กันพังข้ามหน้า)
// ===============================
if (!document.getElementById('movieGrid')) {
    console.log('⛔ main.js skipped (not movie page)');
} else {

    // ===============================
    // 1. UTIL
    // ===============================
    const debounce = (fn, wait) => {
        let t;
        return (...args) => {
            clearTimeout(t);
            t = setTimeout(() => fn(...args), wait);
        };
    };

    const throttle = (fn, limit) => {
        let lock = false;
        return (...args) => {
            if (!lock) {
                fn(...args);
                lock = true;
                setTimeout(() => lock = false, limit);
            }
        };
    };

    // ===============================
    // 2. STATE
    // ===============================
    let lastVisibleDoc = null;
    let isFetching = false;
    let hasMore = true;

    let filters = {
        category: null,
        search: null,
        limit: 20
    };

    // ===============================
    // 3. LOAD MOVIES
    // ===============================
    async function loadMovies(reset = false) {
        if (isFetching || (!hasMore && !reset)) return;

        isFetching = true;
        const db = firebase.firestore();

        let query = db.collection('movies');

        if (filters.category) {
            query = query.where('category', '==', filters.category);
        }

        if (filters.search) {
            query = query
                .where('title', '>=', filters.search)
                .where('title', '<=', filters.search + '\uf8ff');
        }

        query = query.orderBy('createdAt', 'desc');

        if (lastVisibleDoc && !reset) {
            query = query.startAfter(lastVisibleDoc);
        }

        query = query.limit(filters.limit);

        try {
            const snap = await query.get();

            if (reset) {
                document.getElementById('movieGrid').innerHTML = '';
            }

            if (snap.empty) {
                hasMore = false;
                if (reset) showNoMovies();
            } else {
                renderMovies(snap.docs, !reset);
                lastVisibleDoc = snap.docs[snap.docs.length - 1];
                hasMore = snap.docs.length === filters.limit;
            }

            updateLoadMore();
        } catch (e) {
            console.error(e);
            showToast('โหลดหนังไม่สำเร็จ', 'error');
        }

        isFetching = false;
    }

    // ===============================
    // 4. RENDER
    // ===============================
    function renderMovies(docs, append = false) {
        const grid = document.getElementById('movieGrid');

        const html = docs.map(doc => {
            const m = { id: doc.id, ...doc.data() };

            return `
        <div class="movie-card" data-id="${m.id}">
            <div class="movie-poster">
                <img src="${m.poster || '/img/default.jpg'}" alt="${m.title}" loading="lazy">
            </div>
            <div class="movie-info">
                <h3>${m.title}</h3>
                <div class="movie-meta">
                    <span>${m.year || 'N/A'}</span>
                    <span class="movie-category">${m.category || 'N/A'}</span>
                    <span>${m.quality || 'HD'}</span>
                </div>
            </div>
        </div>`;
        }).join('');

        if (append) grid.insertAdjacentHTML('beforeend', html);
        else grid.innerHTML = html;

        // Update movie count
        updateMovieCount(grid.children.length);

        checkFavoriteStatus();
    }

    // Update movie count display
    function updateMovieCount(count) {
        const countElement = document.querySelector('.movie-count');
        if (countElement) {
            countElement.textContent = `${count} เรื่อง`;
        }
    }

    // ===============================
    // 5. EVENTS
    // ===============================
    function setupEvents() {

        // Header Scroll
        window.addEventListener('scroll', throttle(() => {
            document.querySelector('.header')
                ?.classList.toggle('scrolled', window.scrollY > 50);
        }, 100));

        // Search
        document.querySelector('.search-input')?.addEventListener('input',
            debounce(e => {
                filters.search = e.target.value || null;
                lastVisibleDoc = null;
                hasMore = true;
                loadMovies(true);
            }, 500)
        );

        // Category
        document.querySelectorAll('.category-chip').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.category-chip')
                    .forEach(b => b.classList.remove('active'));

                btn.classList.add('active');

                filters.category = btn.dataset.category === 'all'
                    ? null
                    : btn.dataset.category;

                lastVisibleDoc = null;
                hasMore = true;
                loadMovies(true);
            };
        });

        // View Toggle (Grid/List)
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.view-btn')
                    .forEach(b => b.classList.remove('active'));

                btn.classList.add('active');

                const gallerySection = document.querySelector('.movie-gallery-section');
                if (btn.dataset.view === 'list') {
                    gallerySection.classList.add('list-view');
                } else {
                    gallerySection.classList.remove('list-view');
                }
            };
        });

        // CLICK CARD
        document.getElementById('movieGrid').addEventListener('click', async (e) => {
            const card = e.target.closest('.movie-card');
            if (!card) return;

            const id = card.dataset.id;
            console.log('🎬 Movie card clicked, ID:', id);

            if (e.target.closest('.favorite-btn')) {
                toggleFavorite(id, e.target.closest('.favorite-btn'));
                return;
            }

            // 👉 ไปหน้าเล่น
            const watchUrl = `/watch.html?id=${id}`;
            console.log('🔗 Navigating to:', watchUrl);
            window.location.href = watchUrl;
        });

        // LOAD MORE
        document.getElementById('loadMoreBtn')
            ?.addEventListener('click', () => loadMovies());
    }

    // ===============================
    // 6. FAVORITE
    // ===============================
    async function toggleFavorite(movieId, btn) {
        const user = firebase.auth().currentUser;
        if (!user) return showToast('กรุณา login');

        const db = firebase.firestore();
        const ref = db.collection('favorites').doc(user.uid + '_' + movieId);

        const doc = await ref.get();

        if (doc.exists) {
            await ref.delete();
            btn.innerHTML = '<i class="far fa-heart"></i>';
        } else {
            await ref.set({
                userId: user.uid,
                movieId,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            btn.innerHTML = '<i class="fas fa-heart"></i>';
        }
    }

    async function checkFavoriteStatus() {
        const user = firebase.auth().currentUser;
        if (!user) return;

        const db = firebase.firestore();
        const snap = await db.collection('favorites')
            .where('userId', '==', user.uid)
            .get();

        const favs = snap.docs.map(d => d.data().movieId);

        document.querySelectorAll('.movie-card').forEach(card => {
            const id = card.dataset.id;
            const icon = card.querySelector('.favorite-btn i');

            if (favs.includes(id)) {
                icon.classList.replace('far', 'fas');
            }
        });
    }

    // ===============================
    // 7. UI
    // ===============================
    function showToast(msg) {
        console.log('📢 Toast:', msg);
        // แสดง toast จริง
        const toast = document.createElement('div');
        toast.style.cssText = `
        position: fixed; top: 20px; right: 20px; 
        background: #e50914; color: white; padding: 12px 20px; 
        border-radius: 8px; z-index: 9999;
    `;
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    function showNoMovies() {
        document.getElementById('movieGrid').innerHTML =
            '<p style="text-align:center;">ไม่พบหนัง</p>';
    }

    function updateLoadMore() {
        const btn = document.getElementById('loadMoreBtn');
        if (btn) btn.style.display = hasMore ? 'block' : 'none';
    }

    // ===============================
    // INIT
    // ===============================
    document.addEventListener('DOMContentLoaded', () => {
        setupEvents();
        loadMovies(true);
    });

} // END GUARD