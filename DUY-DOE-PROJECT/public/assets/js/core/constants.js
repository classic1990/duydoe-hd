// Application Constants
// DUY-DOE Movie Platform - Centralized Configuration

(function () {
    'use strict';

    // API Endpoints
    const API_ENDPOINTS = {
        TMDB_BASE: 'https://api.themoviedb.org/3',
        TMDB_IMAGE: 'https://image.tmdb.org/t/p/w500',
        YOUTUBE_THUMBNAIL: 'https://img.youtube.com/vi',
        YOUTUBE_EMBED: 'https://www.youtube.com/embed',
        // Backend API endpoints
        BACKEND_BASE: window.location.hostname === 'localhost'
            ? 'http://localhost:3000'
            : 'https://duydodeesport.web.app',
        MOVIES: '/api/movies',
        AUTH: '/api/v1/auth',
        ADMIN: '/api/v1/admin'
    };

    // Firestore Collections
    const COLLECTIONS = {
        MOVIES: 'movies',
        USERS: 'users',
        WATCHLIST: 'watchlist',
        FAVORITES: 'favorites',
        REVIEWS: 'reviews',
        SEARCH_HISTORY: 'searchHistory'
    };

    // Movie Categories
    const MOVIE_CATEGORIES = [
        'action',
        'adventure',
        'animation',
        'comedy',
        'crime',
        'documentary',
        'drama',
        'family',
        'fantasy',
        'horror',
        'mystery',
        'romance',
        'sci-fi',
        'thriller',
        'war',
        'western'
    ];

    // Quality Options
    const QUALITY_OPTIONS = [
        { value: '360p', label: '360p - SD' },
        { value: '480p', label: '480p - SD' },
        { value: '720p', label: '720p - HD' },
        { value: '1080p', label: '1080p - Full HD' },
        { value: '4K', label: '4K - Ultra HD' }
    ];

    // Pagination Settings
    const PAGINATION = {
        DEFAULT_LIMIT: 20,
        MAX_LIMIT: 100,
        ADMIN_LIMIT: 50
    };

    // Cache Settings
    const CACHE_SETTINGS = {
        MOVIE_CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
        SEARCH_CACHE_DURATION: 2 * 60 * 1000, // 2 minutes
        MAX_CACHE_SIZE: 100
    };

    // Error Messages (Thai)
    const ERROR_MESSAGES = {
        NETWORK_ERROR: 'ไม่สามารถเชื่อมต่อเครือข่ายได้ กรุณาลองใหม่',
        MOVIE_NOT_FOUND: 'ไม่พบหนังที่คุณค้นหา',
        AUTH_REQUIRED: 'กรุณาเข้าสู่ระบบก่อนใช้งาน',
        ADMIN_REQUIRED: 'ต้องการสิทธิ์ผู้ดูแลระบบ',
        INVALID_INPUT: 'ข้อมูลที่ป้อนไม่ถูกต้อง',
        SERVER_ERROR: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ กรุณาลองใหม่',
        FIREBASE_ERROR: 'เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล',
        PERMISSION_DENIED: 'ไม่มีสิทธิ์ในการดำเนินการนี้',
        QUOTA_EXCEEDED: 'เกินโควต้าการใช้งาน กรุณาลองใหม่ภายหลัง'
    };

    // Success Messages (Thai)
    const SUCCESS_MESSAGES = {
        MOVIE_SAVED: 'บันทึกข้อมูลหนังสำเร็จ',
        MOVIE_DELETED: 'ลบหนังสำเร็จ',
        MOVIE_UPDATED: 'อัปเดตข้อมูลหนังสำเร็จ',
        FAVORITE_ADDED: 'เพิ่มในรายการโปรดสำเร็จ',
        FAVORITE_REMOVED: 'ลบจากรายการโปรดสำเร็จ',
        WATCHLIST_ADDED: 'เพิ่มในรายการหมายตาสำเร็จ',
        WATCHLIST_REMOVED: 'ลบจากรายการหมายตาสำเร็จ',
        LOGIN_SUCCESS: 'เข้าสู่ระบบสำเร็จ',
        LOGOUT_SUCCESS: 'ออกจากระบบสำเร็จ'
    };

    // Validation Rules
    const VALIDATION = {
        MOVIE_TITLE_MIN: 1,
        MOVIE_TITLE_MAX: 200,
        MOVIE_DESCRIPTION_MAX: 2000,
        SEARCH_TERM_MIN: 2,
        SEARCH_TERM_MAX: 100,
        MOVIE_YEAR_MIN: 1900,
        MOVIE_YEAR_MAX: new Date().getFullYear() + 5,
        RATING_MIN: 0,
        RATING_MAX: 10
    };

    // Firebase Configuration
    const FIREBASE_CONFIG = {
        // These will be overridden by environment variables
        apiKey: window.FIREBASE_API_KEY || "AIzaSyBZz2QI4hb2FAVjhhNCP8rARVo_zlv7_KA",
        authDomain: window.FIREBASE_AUTH_DOMAIN || "duydodeesport.firebaseapp.com",
        projectId: window.FIREBASE_PROJECT_ID || "duydodeesport",
        storageBucket: window.FIREBASE_STORAGE_BUCKET || "duydodeesport.firebasestorage.app",
        messagingSenderId: window.FIREBASE_MESSAGING_SENDER_ID || "435929814225",
        appId: window.FIREBASE_APP_ID || "1:435929814225:web:81e149cfb597513040e1f0",
        measurementId: window.FIREBASE_MEASUREMENT_ID || "G-7EC2RQZH22"
    };

    // App Settings
    const APP_SETTINGS = {
        APP_NAME: 'DUY-DOE FILM',
        APP_VERSION: '1.2.1',
        DEFAULT_LANGUAGE: 'th',
        SUPPORTED_LANGUAGES: ['th', 'en'],
        AUTOPLAY_DELAY: 10, // seconds
        MAX_VIDEO_QUALITY: '4K',
        DEFAULT_VIDEO_QUALITY: '1080p'
    };

    // Theme Configuration
    const THEME_CONFIG = {
        PRIMARY_COLOR: '#e50914',
        SECONDARY_COLOR: '#0071eb',
        ACCENT_COLOR: '#46d369',
        BACKGROUND_COLOR: '#050505',
        TEXT_COLOR: '#ffffff',
        MUTED_TEXT_COLOR: '#b3b3b3'
    };

    // Local Storage Keys
    const STORAGE_KEYS = {
        USER_PREFERENCES: 'duydoe_user_preferences',
        WATCH_HISTORY: 'duydoe_watch_history',
        FAVORITES: 'duydoe_favorites',
        SEARCH_HISTORY: 'duydoe_search_history',
        AUTH_TOKEN: 'duydoe_auth_token',
        THEME: 'duydoe_theme',
        LANGUAGE: 'duydoe_language'
    };

    // Animation Durations (ms)
    const ANIMATIONS = {
        FAST: 150,
        NORMAL: 250,
        SLOW: 350,
        EXTRA_SLOW: 500
    };

    // Breakpoints (px)
    const BREAKPOINTS = {
        MOBILE: 480,
        TABLET: 768,
        DESKTOP: 1024,
        LARGE_DESKTOP: 1280,
        EXTRA_LARGE: 1536
    };

    // Feature Flags
    const FEATURES = {
        ENABLE_AI_RECOMMENDATIONS: true,
        ENABLE_SOCIAL_SHARING: true,
        ENABLE_COMMENTS: true,
        ENABLE_RATINGS: true,
        ENABLE_DOWNLOAD: false,
        ENABLE_LIVE_CHAT: false,
        ENABLE_MULTI_LANGUAGE: true,
        ENABLE_OFFLINE_MODE: false
    };

    // Admin Settings
    const ADMIN_SETTINGS = {
        DEFAULT_PAGE_SIZE: 20,
        MAX_UPLOAD_SIZE: 100 * 1024 * 1024, // 100MB
        SUPPORTED_VIDEO_FORMATS: ['mp4', 'webm', 'ogg'],
        SUPPORTED_IMAGE_FORMATS: ['jpg', 'jpeg', 'png', 'webp'],
        REQUIRED_ADMIN_EMAIL: 'duyclassic191@gmail.com'
    };

    // Development Settings
    const DEV_SETTINGS = {
        ENABLE_DEBUG_MODE: window.location.hostname === 'localhost',
        ENABLE_CONSOLE_LOGS: window.location.hostname === 'localhost',
        MOCK_API_CALLS: false,
        SKIP_AUTH: false
    };

    // Export all constants as a single object for easy access
    const CONSTANTS = {
        API_ENDPOINTS,
        COLLECTIONS,
        MOVIE_CATEGORIES,
        QUALITY_OPTIONS,
        PAGINATION,
        CACHE_SETTINGS,
        ERROR_MESSAGES,
        SUCCESS_MESSAGES,
        VALIDATION,
        FIREBASE_CONFIG,
        APP_SETTINGS,
        THEME_CONFIG,
        STORAGE_KEYS,
        ANIMATIONS,
        BREAKPOINTS,
        FEATURES,
        ADMIN_SETTINGS,
        DEV_SETTINGS
    };

    // Make constants available globally for non-module usage
    if (typeof window !== 'undefined') {
        window.CONSTANTS = CONSTANTS;

        // Individual constants for backward compatibility
        window.API_ENDPOINTS = API_ENDPOINTS;
        window.COLLECTIONS = COLLECTIONS;
        window.MOVIE_CATEGORIES = MOVIE_CATEGORIES;
        window.ERROR_MESSAGES = ERROR_MESSAGES;
        window.SUCCESS_MESSAGES = SUCCESS_MESSAGES;
    }

    console.log('📋 Application constants loaded successfully');
})();
