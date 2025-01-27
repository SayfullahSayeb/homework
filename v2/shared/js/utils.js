const Utils = {
    currentUser: 'mdsayeb7',
    currentDateTime: '2025-01-27 15:20:25',

    getGreeting() {
        const hour = new Date().getHours();
        if (hour < 6) return 'শুভ রাত্রি';
        if (hour < 12) return 'শুভ সকাল';
        if (hour < 16) return 'শুভ দুপুর';
        if (hour < 18) return 'শুভ বিকাল';
        if (hour < 20) return 'শুভ সন্ধ্যা';
        return 'শুভ রাত্রি';
    },

    debounce(func, wait) {
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

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    validateTask(task) {
        const requiredFields = ['title', 'subject', 'dueDate', 'dueTime', 'priority'];
        const missingFields = requiredFields.filter(field => !task[field]);
        
        if (missingFields.length > 0) {
            throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        if (new Date(`${task.dueDate} ${task.dueTime}`) < new Date()) {
            throw new Error('Due date cannot be in the past');
        }

        return true;
    },

    applyTheme() {
        const theme = localStorage.getItem('theme') || 'system';
        if (theme === 'system') {
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
        } else {
            document.body.setAttribute('data-theme', theme);
        }
    },

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Trigger reflow for animation
        toast.offsetHeight;
        
        // Show toast
        toast.classList.add('show');
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    formatDate(date) {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        return date.toLocaleDateString('bn-BD', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    formatTime(time) {
        const [hours, minutes] = time.split(':');
        return `${toBanglaNumber(hours)}:${toBanglaNumber(minutes)}`;
    },

    isToday(date) {
        const today = new Date();
        const checkDate = new Date(date);
        return checkDate.toDateString() === today.toDateString();
    },

    isTomorrow(date) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const checkDate = new Date(date);
        return checkDate.toDateString() === tomorrow.toDateString();
    },

    handleError(error, context = '') {
        console.error(`Error in ${context}:`, error);
        this.showToast(error.message || 'একটি সমস্যা হয়েছে', 'error');
    }
};

// Initialize theme when document is ready
document.addEventListener('DOMContentLoaded', () => Utils.applyTheme());

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => Utils.applyTheme());