// 🔐 Security Enhancement Implementation
// DUY-DOE FILM - Advanced Security Features

// 1. Rate Limiting System
class RateLimiter {
    constructor() {
        this.attempts = new Map();
        this.limits = {
            'login': { max: 5, window: 15 * 60 * 1000 },      // 5 ครั้ง/15นาที
            'search': { max: 30, window: 60 * 1000 },         // 30 ครั้ง/นาที
            'api': { max: 100, window: 60 * 1000 },           // 100 ครั้ง/นาที
            'admin': { max: 20, window: 60 * 1000 }            // 20 ครั้ง/นาที
        };
    }

    check(action, identifier = 'global') {
        const key = `${action}:${identifier}`;
        const limit = this.limits[action];
        const now = Date.now();

        if (!this.attempts.has(key)) {
            this.attempts.set(key, { count: 0, resetTime: now + limit.window });
        }

        const attempts = this.attempts.get(key);

        // Reset if window expired
        if (now > attempts.resetTime) {
            attempts.count = 0;
            attempts.resetTime = now + limit.window;
        }

        // Check limit
        if (attempts.count >= limit.max) {
            return {
                allowed: false,
                remainingTime: attempts.resetTime - now,
                message: `Rate limit exceeded. Try again in ${Math.ceil((attempts.resetTime - now) / 1000)}s`
            };
        }

        attempts.count++;
        return { allowed: true, remaining: limit.max - attempts.count };
    }
}

// 2. Input Validation & Sanitization
class InputValidator {
    static patterns = {
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        movieTitle: /^.{1,100}$/,
        search: /^.{1,50}$/,
        comment: /^.{1,500}$/,
        url: /^https?:\/\/.+/,
        youtubeId: /^[a-zA-Z0-9_-]{11}$/
    };

    static validate(input, type) {
        if (!input || typeof input !== 'string') return false;

        const pattern = this.patterns[type];
        if (!pattern) return false;

        return pattern.test(input.trim());
    }

    static sanitize(input) {
        if (!input || typeof input !== 'string') return '';

        return input
            .trim()
            .replace(/[<>]/g, '') // Remove HTML tags
            .replace(/javascript:/gi, '') // Remove javascript protocol
            .replace(/on\w+=/gi, '') // Remove event handlers
            .substring(0, 1000); // Limit length
    }
}

// 3. Security Headers Implementation
class SecurityHeaders {
    static getHeaders() {
        return {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
            'Content-Security-Policy': this.getCSP(),
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
        };
    }

    static getCSP() {
        return [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://www.gstatic.com https://www.youtube.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "img-src 'self' data: https: blob:",
            "connect-src 'self' https://*.firebaseio.com https://www.googleapis.com https://firebase.googleapis.com",
            "frame-src 'self' https://www.youtube.com",
            "font-src 'self' https://fonts.gstatic.com",
            "object-src 'none'",
            "media-src 'self' https:",
            "worker-src 'self' blob:"
        ].join('; ');
    }
}

// 4. Session Management
class SessionManager {
    static sessions = new Map();
    static SESSION_TIMEOUT = 30 * 60 * 1000; // 30 นาที
    static ADMIN_SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 ชั่วโมง

    static createSession(user) {
        const sessionId = this.generateSessionId();
        const timeout = user.isAdmin ? this.ADMIN_SESSION_TIMEOUT : this.SESSION_TIMEOUT;

        const session = {
            id: sessionId,
            userId: user.uid,
            email: user.email,
            isAdmin: user.isAdmin || false,
            createdAt: Date.now(),
            expiresAt: Date.now() + timeout,
            lastActivity: Date.now()
        };

        this.sessions.set(sessionId, session);
        this.setSessionCleanup(sessionId, timeout);

        return sessionId;
    }

    static validateSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) return null;

        if (Date.now() > session.expiresAt) {
            this.sessions.delete(sessionId);
            return null;
        }

        // Update last activity
        session.lastActivity = Date.now();
        return session;
    }

    static destroySession(sessionId) {
        this.sessions.delete(sessionId);
    }

    static generateSessionId() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    static setSessionCleanup(sessionId, timeout) {
        setTimeout(() => {
            this.sessions.delete(sessionId);
        }, timeout);
    }
}

// 5. CSRF Protection
class CSRFProtection {
    static generateToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
        sessionStorage.setItem('csrf-token', token);
        return token;
    }

    static validateToken(requestToken) {
        const sessionToken = sessionStorage.getItem('csrf-token');
        return requestToken === sessionToken;
    }

    static addToForm(form) {
        const token = this.generateToken();
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'csrf-token';
        input.value = token;
        form.appendChild(input);
        return token;
    }
}

// 6. Security Event Logger
class SecurityLogger {
    static log(level, event, details = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level: level.toUpperCase(),
            event,
            userId: details.userId || 'anonymous',
            ip: details.ip || this.getClientIP(),
            userAgent: navigator.userAgent,
            details
        };

        // Send to security monitoring
        this.sendToMonitoring(logEntry);

        // Console logging for development
        if (window.location.hostname === 'localhost') {
            console.log(`[SECURITY-${level}] ${event}:`, logEntry);
        }

        // Critical events - immediate alert
        if (level === 'critical') {
            this.sendAlert(logEntry);
        }
    }

    static getClientIP() {
        // In production, this would come from server
        return window.clientIP || 'unknown';
    }

    /**
     * Send security logs to monitoring endpoint
     * @param {Object} logData - Log data to send
     */
    async sendToMonitoring(logData) {
        try {
            // Disable security logging for now to prevent infinite loops
            if (SecurityLogger.config?.logging?.enabled === false) {
                return;
            }

            // Use Firebase Analytics instead of custom endpoint
            if (window.firebaseAnalytics) {
                window.firebaseAnalytics.logEvent('security_event', {
                    event_name: logData.event,
                    level: logData.level,
                    user_id: logData.userId || 'anonymous',
                    timestamp: logData.timestamp,
                    details: JSON.stringify(logData.details || {})
                });
                return;
            }

            // Fallback: Store logs locally instead of sending to server
            const localLogs = JSON.parse(localStorage.getItem('security_logs') || '[]');
            localLogs.push(logData);

            // Keep only last 100 logs
            if (localLogs.length > 100) {
                localLogs.splice(0, localLogs.length - 100);
            }

            localStorage.setItem('security_logs', JSON.stringify(localLogs));

        } catch (error) {
            // Silent fail to prevent infinite loops
            console.warn('Security logging failed:', error.message);
        }
    }

    static sendAlert(logEntry) {
        // Send immediate alert for critical events
        console.error('🚨 SECURITY ALERT:', logEntry);

        // In production, send to alerting system
        // Slack, Email, SMS, etc.
    }
}

// 7. Enhanced Authentication Security
class SecureAuth {
    static async secureLogin() {
        const rateLimit = window.rateLimiter.check('login', this.getClientIP());

        if (!rateLimit.allowed) {
            SecurityLogger.log('warn', 'LOGIN_RATE_LIMIT_EXCEEDED', {
                ip: this.getClientIP(),
                message: rateLimit.message
            });
            throw new Error(rateLimit.message);
        }

        try {
            const result = await window.signInWithGoogle();

            SecurityLogger.log('info', 'LOGIN_SUCCESS', {
                userId: result.user.uid,
                email: result.user.email
            });

            // Create secure session
            const sessionId = SessionManager.createSession({
                uid: result.user.uid,
                email: result.user.email,
                isAdmin: this.checkAdminRole(result.user.email)
            });

            // Store session securely
            localStorage.setItem('session-id', sessionId);

            return result;
        } catch (error) {
            SecurityLogger.log('error', 'LOGIN_FAILED', {
                error: error.message,
                ip: this.getClientIP()
            });
            throw error;
        }
    }

    static checkAdminRole(email) {
        const adminEmails = ['duyclassic191@gmail.com', 'duy.kan1234@gmail.com'];
        return adminEmails.includes(email);
    }

    static getClientIP() {
        return window.clientIP || 'unknown';
    }

    static async secureLogout() {
        const sessionId = localStorage.getItem('session-id');
        const session = SessionManager.validateSession(sessionId);

        if (session) {
            SecurityLogger.log('info', 'LOGOUT', {
                userId: session.userId,
                sessionId
            });

            SessionManager.destroySession(sessionId);
        }

        localStorage.removeItem('session-id');
        return await window.signOut();
    }
}

// 8. Content Security
class ContentSecurity {
    static validateMovieURL(url) {
        if (!InputValidator.validate(url, 'url')) {
            return false;
        }

        // Allow only trusted domains
        const trustedDomains = [
            'youtube.com',
            'youtu.be',
            'vimeo.com',
            'dailymotion.com'
        ];

        try {
            const urlObj = new URL(url);
            return trustedDomains.some(domain =>
                urlObj.hostname.includes(domain)
            );
        } catch {
            return false;
        }
    }

    static sanitizeComment(comment) {
        const sanitized = InputValidator.sanitize(comment);

        // Additional comment filtering
        const prohibitedWords = [
            'spam', 'abuse', 'hate', 'violence',
            // Add more prohibited words
        ];

        const containsProhibited = prohibitedWords.some(word =>
            sanitized.toLowerCase().includes(word)
        );

        if (containsProhibited) {
            SecurityLogger.log('warn', 'COMMENT_FILTERED', {
                comment: sanitized.substring(0, 50)
            });
            return null; // Reject comment
        }

        return sanitized;
    }
}

// 9. Initialize Security System
class SecuritySystem {
    static init() {
        // Initialize rate limiter
        window.rateLimiter = new RateLimiter();

        // Apply security headers (if running on custom server)
        this.applySecurityHeaders();

        // Setup session validation
        this.setupSessionValidation();

        // Setup CSRF protection
        this.setupCSRFProtection();

        // Monitor security events
        this.setupSecurityMonitoring();

        SecurityLogger.log('info', 'SECURITY_SYSTEM_INITIALIZED');
    }

    static applySecurityHeaders() {
        // This would be implemented on the server side
        // For Firebase Hosting, use firebase.json headers
    }

    static setupSessionValidation() {
        // Check session validity periodically
        setInterval(() => {
            const sessionId = localStorage.getItem('session-id');
            if (sessionId) {
                const session = SessionManager.validateSession(sessionId);
                if (!session) {
                    // Session expired, force logout
                    SecureAuth.secureLogout();
                }
            }
        }, 60000); // Check every minute
    }

    static setupCSRFProtection() {
        // Add CSRF token to all forms
        document.addEventListener('DOMContentLoaded', () => {
            const forms = document.querySelectorAll('form');
            forms.forEach(form => CSRFProtection.addToForm(form));
        });
    }

    static setupSecurityMonitoring() {
        // Monitor for suspicious activities
        window.addEventListener('error', (event) => {
            SecurityLogger.log('error', 'JAVASCRIPT_ERROR', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno
            });
        });

        // Monitor failed API calls
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            try {
                const response = await originalFetch(...args);

                if (!response.ok) {
                    SecurityLogger.log('warn', 'API_CALL_FAILED', {
                        url: args[0],
                        status: response.status
                    });
                }

                return response;
            } catch (error) {
                SecurityLogger.log('error', 'API_CALL_ERROR', {
                    url: args[0],
                    error: error.message
                });
                throw error;
            }
        };
    }
}

// 10. Initialize Security System
document.addEventListener('DOMContentLoaded', () => {
    const securitySystem = new SecuritySystem();
});

// Export classes for global use
window.SecuritySystem = SecuritySystem;
window.SecureAuth = SecureAuth;
window.SecurityLogger = SecurityLogger;
window.ContentSecurity = ContentSecurity;
window.InputValidator = InputValidator;
window.SessionManager = SessionManager;
window.CSRFProtection = CSRFProtection;

console.log('🔐 Security System Loaded - DUY-DOE FILM');
