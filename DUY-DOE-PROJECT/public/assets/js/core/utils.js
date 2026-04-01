// Utility Functions
// DUY-DOE Movie Platform - Common Helper Functions

(function () {
    'use strict';

    // Format utilities
    const formatUtils = {
        // Format numbers with Thai locale
        formatNumber: (num) => {
            return new Intl.NumberFormat('th-TH').format(num);
        },

        // Format duration in minutes to readable format
        formatDuration: (minutes) => {
            if (!minutes) return 'N/A';
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return hours > 0 ? `${hours}ชม. ${mins}น.` : `${mins}น.`;
        },

        // Format date with Thai locale
        formatDate: (date, options = {}) => {
            return new Date(date).toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                ...options
            });
        },

        // Format file size
        formatFileSize: (bytes) => {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        },

        // Format currency (Thai Baht)
        formatCurrency: (amount) => {
            return new Intl.NumberFormat('th-TH', {
                style: 'currency',
                currency: 'THB'
            }).format(amount);
        },

        // Format rating with stars
        formatRating: (rating) => {
            const stars = '★'.repeat(Math.floor(rating));
            const halfStar = rating % 1 >= 0.5 ? '☆' : '';
            return stars + halfStar + ' ' + rating.toFixed(1);
        }
    };

    // Validation utilities
    const validationUtils = {
        // Email validation
        isValidEmail: (email) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        },

        // URL validation
        isValidUrl: (url) => {
            try {
                new URL(url);
                return true;
            } catch {
                return false;
            }
        },

        // Movie title validation
        isValidMovieTitle: (title) => {
            return title && title.trim().length >= 1 && title.trim().length <= 200;
        },

        // Search term validation
        isValidSearchTerm: (term) => {
            return term && term.trim().length >= 2 && term.trim().length <= 100;
        },

        // Year validation
        isValidYear: (year) => {
            const currentYear = new Date().getFullYear();
            return year >= 1900 && year <= currentYear + 5;
        },

        // Rating validation
        isValidRating: (rating) => {
            return rating >= 0 && rating <= 10;
        },

        // Sanitize HTML
        sanitizeHtml: (text) => {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },

        // Validate required fields
        validateRequired: (obj, requiredFields) => {
            const missing = [];
            requiredFields.forEach(field => {
                if (!obj[field] || obj[field].toString().trim() === '') {
                    missing.push(field);
                }
            });
            return missing;
        }
    };

    // Storage utilities
    const storageUtils = {
        // Local storage
        setItem: (key, value) => {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.error('Error saving to localStorage:', error);
                return false;
            }
        },

        getItem: (key, defaultValue = null) => {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.error('Error reading from localStorage:', error);
                return defaultValue;
            }
        },

        removeItem: (key) => {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.error('Error removing from localStorage:', error);
                return false;
            }
        },

        // Session storage
        setSessionItem: (key, value) => {
            try {
                sessionStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.error('Error saving to sessionStorage:', error);
                return false;
            }
        },

        getSessionItem: (key, defaultValue = null) => {
            try {
                const item = sessionStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.error('Error reading from sessionStorage:', error);
                return defaultValue;
            }
        },

        // Clear all storage
        clear: () => {
            try {
                localStorage.clear();
                sessionStorage.clear();
                return true;
            } catch (error) {
                console.error('Error clearing storage:', error);
                return false;
            }
        }
    };

    // URL utilities
    const urlUtils = {
        // Get query parameter
        getQueryParam: (name) => {
            return new URLSearchParams(window.location.search).get(name);
        },

        // Set query parameter
        setQueryParam: (name, value) => {
            const url = new URL(window.location);
            url.searchParams.set(name, value);
            window.history.replaceState({}, '', url);
        },

        // Remove query parameter
        removeQueryParam: (name) => {
            const url = new URL(window.location);
            url.searchParams.delete(name);
            window.history.replaceState({}, '', url);
        },

        // Build URL with parameters
        buildUrl: (base, params = {}) => {
            const url = new URL(base);
            Object.entries(params).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    url.searchParams.set(key, value);
                }
            });
            return url.toString();
        },

        // Get current domain
        getDomain: () => {
            return window.location.hostname;
        },

        // Check if development environment
        isDevelopment: () => {
            return window.location.hostname === 'localhost' ||
                window.location.hostname === '127.0.0.1';
        }
    };

    // Array utilities
    const arrayUtils = {
        // Shuffle array
        shuffle: (array) => {
            const shuffled = [...array];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        },

        // Unique array
        unique: (array) => {
            return [...new Set(array)];
        },

        // Group by key
        groupBy: (array, key) => {
            return array.reduce((groups, item) => {
                const group = item[key];
                groups[group] = groups[group] || [];
                groups[group].push(item);
                return groups;
            }, {});
        },

        // Sort by key
        sortBy: (array, key, direction = 'asc') => {
            return [...array].sort((a, b) => {
                if (direction === 'asc') {
                    return a[key] > b[key] ? 1 : -1;
                } else {
                    return a[key] < b[key] ? 1 : -1;
                }
            });
        },

        // Paginate array
        paginate: (array, page = 1, limit = 10) => {
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            return {
                data: array.slice(startIndex, endIndex),
                total: array.length,
                page,
                limit,
                totalPages: Math.ceil(array.length / limit)
            };
        }
    };

    // String utilities
    const stringUtils = {
        // Capitalize first letter
        capitalize: (str) => {
            return str.charAt(0).toUpperCase() + str.slice(1);
        },

        // Truncate string
        truncate: (str, length, suffix = '...') => {
            if (str.length <= length) return str;
            return str.substring(0, length - suffix.length) + suffix;
        },

        // Slugify string
        slugify: (str) => {
            return str
                .toLowerCase()
                .replace(/[^a-z0-9 -]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();
        },

        // Generate random string
        random: (length = 10) => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let result = '';
            for (let i = 0; i < length; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        },

        // Extract YouTube video ID
        extractYouTubeId: (url) => {
            const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
            const match = url.match(regex);
            return match ? match[1] : null;
        }
    };

    // DOM utilities
    const domUtils = {
        // Wait for DOM element
        waitForElement: (selector, timeout = 5000) => {
            return new Promise((resolve, reject) => {
                const element = document.querySelector(selector);
                if (element) {
                    resolve(element);
                    return;
                }

                const observer = new MutationObserver(() => {
                    const element = document.querySelector(selector);
                    if (element) {
                        observer.disconnect();
                        resolve(element);
                    }
                });

                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });

                setTimeout(() => {
                    observer.disconnect();
                    reject(new Error(`Element ${selector} not found within ${timeout}ms`));
                }, timeout);
            });
        },

        // Create element with attributes
        createElement: (tag, attributes = {}, text = '') => {
            const element = document.createElement(tag);
            Object.entries(attributes).forEach(([key, value]) => {
                element.setAttribute(key, value);
            });
            if (text) {
                element.textContent = text;
            }
            return element;
        },

        // Add event listener with delegation
        delegate: (parent, selector, event, handler) => {
            parent.addEventListener(event, (e) => {
                if (e.target.matches(selector)) {
                    handler(e);
                }
            });
        },

        // Smooth scroll to element
        scrollTo: (element, offset = 0) => {
            const target = typeof element === 'string' ? document.querySelector(element) : element;
            if (target) {
                const top = target.offsetTop - offset;
                window.scrollTo({
                    top,
                    behavior: 'smooth'
                });
            }
        }
    };

    // Performance utilities
    const performanceUtils = {
        // Debounce function
        debounce: (func, wait) => {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        // Throttle function
        throttle: (func, limit) => {
            let inThrottle;
            return function executedFunction(...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },

        // Measure function performance
        measure: async (func, label) => {
            const start = performance.now();
            const result = await func();
            const end = performance.now();
            console.log(`${label} took ${(end - start).toFixed(2)}ms`);
            return result;
        }
    };

    // Color utilities
    const colorUtils = {
        // Convert hex to RGB
        hexToRgb: (hex) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        },

        // Get dominant color from image
        getDominantColor: (img) => {
            return new Promise((resolve) => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = 1;
                canvas.height = 1;
                ctx.drawImage(img, 0, 0, 1, 1);
                const data = ctx.getImageData(0, 0, 1, 1).data;
                resolve(`${data[0]}, ${data[1]}, ${data[2]}`);
            });
        }
    };

    // Export all utilities
    const utils = {
        format: formatUtils,
        validation: validationUtils,
        storage: storageUtils,
        url: urlUtils,
        array: arrayUtils,
        string: stringUtils,
        dom: domUtils,
        performance: performanceUtils,
        color: colorUtils
    };

    // Make utilities available globally for non-module usage
    if (typeof window !== 'undefined') {
        window.utils = utils;
        window.formatUtils = formatUtils;
        window.validationUtils = validationUtils;
        window.storageUtils = storageUtils;
        window.urlUtils = urlUtils;
        window.arrayUtils = arrayUtils;
        window.stringUtils = stringUtils;
        window.domUtils = domUtils;
        window.performanceUtils = performanceUtils;
        window.colorUtils = colorUtils;
    }

    console.log('🛠️ Utility functions loaded successfully');
})();
