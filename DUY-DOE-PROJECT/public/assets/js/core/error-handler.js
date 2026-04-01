// Error Handler Utility
// DUY-DOE Movie Platform - Centralized Error Management

// Log levels
const LOG_LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
};

// Current log level based on environment
const CURRENT_LOG_LEVEL = window.location.hostname === 'localhost'
    ? LOG_LEVELS.DEBUG
    : LOG_LEVELS.INFO;

// Logger class
class Logger {
    constructor(context = 'App') {
        this.context = context;
    }

    log(level, message, data = null) {
        if (level > CURRENT_LOG_LEVEL) return;

        const timestamp = `[${new Date().toISOString()}] [${Object.keys(LOG_LEVELS)[level]}] [${this.context}]`;

        switch (level) {
            case LOG_LEVELS.ERROR:
                console.error(timestamp, message, data || '');
                this.sendToExternal(level, message, data);
                break;
            case LOG_LEVELS.WARN:
                console.warn(timestamp, message, data || '');
                break;
            case LOG_LEVELS.INFO:
                console.info(timestamp, message, data || '');
                break;
            case LOG_LEVELS.DEBUG:
                console.debug(timestamp, message, data || '');
                break;
        }
    }

    error(message, data) {
        this.log(LOG_LEVELS.ERROR, message, data);
    }

    warn(message, data) {
        this.log(LOG_LEVELS.WARN, message, data);
    }

    info(message, data) {
        this.log(LOG_LEVELS.INFO, message, data);
    }

    debug(message, data) {
        this.log(LOG_LEVELS.DEBUG, message, data);
    }

    sendToExternal(level, message, data) {
        // Send to Sentry if available
        if (window.SENTRY && typeof window.SENTRY.captureException === 'function' &&
            level === LOG_LEVELS.ERROR && data instanceof Error) {
            window.SENTRY.captureException(data, {
                tags: { context: this.context },
                extra: { message }
            });
        }
    }

    async sendToCustomEndpoint(level, message, data) {
        try {
            // Use Firebase Analytics instead of custom endpoint
            if (window.firebaseAnalytics) {
                window.firebaseAnalytics.logEvent('error_log', {
                    level: Object.keys(LOG_LEVELS)[level],
                    context: this.context,
                    message: message.substring(0, 100), // Limit message length
                    url: window.location.href
                });
                return;
            }

            // Fallback: Store logs locally
            const localLogs = JSON.parse(localStorage.getItem('error_logs') || '[]');
            localLogs.push({
                level: Object.keys(LOG_LEVELS)[level],
                context: this.context,
                message,
                data: data instanceof Error ? data.stack : data,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href
            });

            // Keep only last 50 logs
            if (localLogs.length > 50) {
                localLogs.splice(0, localLogs.length - 50);
            }

            localStorage.setItem('error_logs', JSON.stringify(localLogs));
        } catch (error) {
            console.debug('Failed to send log to external service:', error);
        }
    }
}

// Error Handler class
class ErrorHandler {
    constructor() {
        this.logger = new Logger('ErrorHandler');
        this.setupGlobalHandlers();
        this.errorQueue = [];
        this.maxQueueSize = 50;
    }

    setupGlobalHandlers() {
        // Handle JavaScript errors and resource loading errors
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                // Resource loading error
                this.handleError(new Error(`Resource loading failed: ${event.target.src || event.target.href}`), {
                    type: 'resource_error',
                    element: event.target.tagName,
                    source: event.target.src || event.target.href
                });
            } else {
                // JavaScript error
                this.handleError(event.error, {
                    message: event.message,
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno,
                    type: 'javascript'
                });
            }
        }, true);

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason, {
                type: 'promise_rejection',
                promise: event.promise
            });
        });
    }

    handleError(error, context = {}) {
        const errorInfo = {
            error: error instanceof Error ? error : new Error(error),
            context,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            userId: this.getCurrentUserId()
        };

        // Log the error
        this.logger.error('Unhandled error occurred', errorInfo);

        // Show user-friendly message
        this.showUserFriendlyError(errorInfo);

        // Add to error queue for batch processing
        this.addToErrorQueue(errorInfo);

        // Send to external services
        this.reportError(errorInfo);
    }

    showUserFriendlyError(errorInfo) {
        // Don't show errors in development
        if (window.location.hostname === 'localhost') return;

        // Create error toast
        const errorMessage = this.getErrorMessage(errorInfo);
        this.showToast(errorMessage, 'error');
    }

    getErrorMessage(errorInfo) {
        const { error, context } = errorInfo;

        // Network errors
        if (error.message.includes('fetch') || error.message.includes('network')) {
            return 'ไม่สามารถเชื่อมต่อเครือข่ายได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต';
        }

        // Authentication errors
        if (error.message.includes('auth') || error.message.includes('unauthorized')) {
            return 'กรุณาเข้าสู่ระบบก่อนใช้งาน';
        }

        // Firebase errors
        if (error.message.includes('firebase')) {
            return 'เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล กรุณาลองใหม่';
        }

        // Default error message
        return 'เกิดข้อผิดพลาดบางอย่าง กรุณาลองใหม่อีกครั้ง';
    }

    showToast(message, type = 'info') {
        // Remove existing toasts
        const existingToast = document.querySelector('.error-toast');
        if (existingToast) {
            existingToast.remove();
        }

        // Create new toast
        const toast = document.createElement('div');
        toast.className = `error-toast ${type}`;
        toast.textContent = message;

        // Style the toast
        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: type === 'error' ? '#ef4444' : '#3b82f6',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: '9999',
            maxWidth: '300px',
            wordWrap: 'break-word',
            animation: 'slideInRight 0.3s ease-out'
        });

        // Add to DOM
        document.body.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'slideOutRight 0.3s ease-in';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 300);
            }
        }, 5000);

        // Add click to dismiss
        toast.addEventListener('click', () => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        });
    }

    addToErrorQueue(errorInfo) {
        this.errorQueue.push(errorInfo);

        // Limit queue size
        if (this.errorQueue.length > this.maxQueueSize) {
            this.errorQueue.shift();
        }
    }

    getCurrentUserId() {
        // Get current user ID from Firebase Auth or other auth system
        if (window.firebaseAuth && window.firebaseAuth.currentUser) {
            return window.firebaseAuth.currentUser.uid;
        }
        return null;
    }

    async reportError(errorInfo) {
        // Skip reporting in development
        if (window.location.hostname === 'localhost') return;

        try {
            // Send to custom endpoint
            await this.logger.sendToCustomEndpoint(
                LOG_LEVELS.ERROR,
                errorInfo.error.message,
                errorInfo
            );
        } catch (reportingError) {
            console.debug('Failed to report error:', reportingError);
        }
    }

    // Method to manually report errors
    report(error, context = {}) {
        this.handleError(error, context);
    }

    // Method to get error statistics
    getErrorStats() {
        return {
            totalErrors: this.errorQueue.length,
            recentErrors: this.errorQueue.slice(-10),
            errorsByType: this.groupErrorsByType()
        };
    }

    groupErrorsByType() {
        const grouped = {};
        this.errorQueue.forEach(error => {
            const type = error.context.type || 'unknown';
            grouped[type] = (grouped[type] || 0) + 1;
        });
        return grouped;
    }

    // Clear error queue
    clearErrorQueue() {
        this.errorQueue = [];
    }
}

// Global error handler instance
window.errorHandler = new ErrorHandler();

// Make Logger available globally
window.Logger = Logger;

// Add CSS animations for toasts
const toastStyles = `
@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideOutRight {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(100%);
        opacity: 0;
    }
}
`;

// Inject styles if not already present
if (!document.querySelector('#error-handler-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'error-handler-styles';
    styleSheet.textContent = toastStyles;
    document.head.appendChild(styleSheet);
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ErrorHandler, Logger, LOG_LEVELS };
}

console.log('🛡️ Error Handler initialized successfully');
