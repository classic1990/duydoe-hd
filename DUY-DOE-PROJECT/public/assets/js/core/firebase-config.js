// Firebase Configuration - Secure Version
const firebaseConfig = {
    apiKey: window.FIREBASE_API_KEY || (window.location.hostname === 'localhost' ?
        "AIzaSyBZz2QI4hb2FAVjhhNCP8rARVo_zlv7_KA" : null),
    authDomain: window.FIREBASE_AUTH_DOMAIN || (window.location.hostname === 'localhost' ?
        "duydodeesport.firebaseapp.com" : null),
    projectId: window.FIREBASE_PROJECT_ID || (window.location.hostname === 'localhost' ?
        "duydodeesport" : null),
    storageBucket: window.FIREBASE_STORAGE_BUCKET || (window.location.hostname === 'localhost' ?
        "duydodeesport.firebasestorage.app" : null),
    messagingSenderId: window.FIREBASE_MESSAGING_SENDER_ID || (window.location.hostname === 'localhost' ?
        "435929814225" : null),
    appId: window.FIREBASE_APP_ID || (window.location.hostname === 'localhost' ?
        "1:435929814225:web:81e149cfb597513040e1f0" : null),
    measurementId: window.FIREBASE_MEASUREMENT_ID || (window.location.hostname === 'localhost' ?
        "G-7EC2RQZH22" : null)
};

// Check if we're in development mode
const isDevelopment = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

// Security check for production
if (!isDevelopment) {
    // In production, check if environment variables are set
    if (!window.FIREBASE_API_KEY || !window.FIREBASE_PROJECT_ID) {
        console.error("🚨 Security Alert: Firebase configuration not found in production");
        console.error("🔧 Please set environment variables: FIREBASE_API_KEY, FIREBASE_PROJECT_ID");
        // Show user-friendly error message
        document.body.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: 'Kanit', sans-serif; background: #141414; color: white; text-align: center; padding: 2rem;">
                <div>
                    <h1 style="color: #e50914; margin-bottom: 1rem;">🚨 Configuration Error</h1>
                    <p style="margin-bottom: 1rem;">Server configuration is incomplete.</p>
                    <p style="color: #b3b3b3; font-size: 0.9rem;">Please contact administrator.</p>
                </div>
            </div>
        `;
        throw new Error("Firebase configuration not found in production");
    }
}

// Initialize Firebase variables
let app, db, auth, analytics, functions, performance;

try {
    // Check if Firebase SDK is loaded
    if (!window.firebase) {
        throw new Error("Firebase SDK not loaded");
    }

    // Initialize Firebase App
    if (firebase.apps.length > 0) {
        app = firebase.app();
        console.log("✅ Firebase app already exists");
    } else {
        app = firebase.initializeApp(firebaseConfig);
        console.log("✅ Firebase initialized successfully");
    }

    // Initialize Firebase services
    db = firebase.firestore();

    // Initialize auth with error handling
    try {
        if (typeof firebase.auth === 'function') {
            auth = firebase.auth();
            console.log('✅ Firebase Auth initialized');
        } else {
            console.warn('⚠️ Firebase Auth not available');
            auth = null;
        }
    } catch (error) {
        console.warn('⚠️ Firebase Auth initialization failed:', error);
        auth = null;
    }

    // Initialize analytics with error handling
    try {
        analytics = firebase.analytics();
        console.log('✅ Firebase Analytics initialized');
    } catch (error) {
        console.warn('⚠️ Firebase Analytics not available:', error);
        analytics = null;
    }

    // Initialize functions with error handling
    try {
        if (typeof firebase.functions === 'function') {
            functions = firebase.functions();
            console.log('✅ Firebase Functions initialized');
        } else {
            console.warn('⚠️ Firebase Functions SDK not loaded');
            functions = null;
        }
    } catch (error) {
        console.warn('⚠️ Firebase Functions not available:', error);
        functions = null;
    }

    // Initialize performance with error handling
    try {
        if (typeof firebase.performance === 'function') {
            performance = firebase.performance();
            console.log('✅ Firebase Performance initialized');
        } else {
            console.warn('⚠️ Firebase Performance SDK not loaded');
            performance = null;
        }
    } catch (error) {
        console.warn('⚠️ Firebase Performance not available:', error);
        performance = null;
    }

    // Configure Firestore settings based on environment
    if (isDevelopment) {
        db.settings({
            timestampsInSnapshots: true,
            cacheSizeBytes: 52428800,
            merge: true
        });
        console.log("🔧 Firebase configured for development");
    } else {
        db.settings({
            timestampsInSnapshots: true,
            cacheSizeBytes: 104857600,
            merge: true
        });
        console.log("🚀 Firebase configured for production");
    }

    // Make Firebase services globally available
    window.firebaseApp = app;
    window.firebaseDB = db;
    window.firebaseAuth = auth;
    window.firebaseAnalytics = analytics;
    window.firebaseFunctions = functions;
    window.firebasePerformance = performance;
    console.log("✅ Firebase services initialized and made globally available");

} catch (error) {
    console.error("❌ Firebase initialization failed:", error);
    window.firebaseApp = null;
    window.firebaseDB = null;
    window.firebaseAuth = null;
    window.firebaseAnalytics = null;
    window.firebaseFunctions = null;
    window.firebasePerformance = null;
}

// Helper functions
window.getFirebaseApp = () => app;
window.getFirestoreDB = () => db;
window.getFirebaseAuth = () => auth;
window.getFirebaseAnalytics = () => analytics;
window.getFirebaseFunctions = () => functions;
window.getFirebasePerformance = () => performance;

// Firestore collection helpers
window.moviesCollection = () => db ? db.collection("movies") : null;
window.usersCollection = () => db ? db.collection("users") : null;
window.commentsCollection = () => db ? db.collection("comments") : null;
window.favoritesCollection = (userId) => db ? db.collection("users").doc(userId).collection("favorites") : null;
window.historyCollection = (userId) => db ? db.collection("users").doc(userId).collection("history") : null;

// Firestore document helpers
window.getDoc = (docRef) => docRef ? docRef.get() : Promise.resolve(null);
window.getDocs = (query) => query ? query.get() : Promise.resolve(null);
window.setDoc = (docRef, data) => docRef ? docRef.set(data) : Promise.resolve(null);
window.updateDoc = (docRef, data) => docRef ? docRef.update(data) : Promise.resolve(null);
window.deleteDoc = (docRef) => docRef ? docRef.delete() : Promise.resolve(null);
window.addDoc = (collectionRef, data) => collectionRef ? collectionRef.add(data) : Promise.resolve(null);

// Firestore query helpers
window.query = (collectionRef) => collectionRef;
window.where = (query, field, op, value) => query ? query.where(field, op, value) : null;
window.orderBy = (query, field, direction) => query ? query.orderBy(field, direction) : null;
window.limit = (query, limit) => query ? query.limit(limit) : null;
window.startAfter = (query, doc) => query ? query.startAfter(doc) : null;

// Firestore field values
window.serverTimestamp = () => db ? firebase.firestore.FieldValue.serverTimestamp() : null;
window.increment = (value) => db ? firebase.firestore.FieldValue.increment(value) : null;
window.arrayUnion = (...items) => db ? firebase.firestore.FieldValue.arrayUnion(...items) : null;
window.arrayRemove = (...items) => db ? firebase.firestore.FieldValue.arrayRemove(...items) : null;

// Auth helpers
window.signInWithGoogle = () => {
    if (!auth) return Promise.reject(new Error("Firebase Auth not initialized"));
    const provider = new firebase.auth.GoogleAuthProvider();
    return auth.signInWithPopup(provider);
};

window.signOut = () => auth ? auth.signOut() : Promise.resolve(null);
window.onAuthStateChanged = (callback) => auth ? auth.onAuthStateChanged(callback) : null;
window.getCurrentUser = () => auth ? auth.currentUser : null;

console.log("🎯 Firebase configuration loaded successfully");
