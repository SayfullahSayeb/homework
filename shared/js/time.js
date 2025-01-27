const TimeUtils = {
    // Constants
    numbers: {
        '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
        '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
    },
    
    weekdays: {
        0: 'রবিবার', 1: 'সোমবার', 2: 'মঙ্গলবার', 3: 'বুধবার',
        4: 'বৃহস্পতিবার', 5: 'শুক্রবার', 6: 'শনিবার'
    },
    
    months: {
        0: 'জানুয়ারি', 1: 'ফেব্রুয়ারি', 2: 'মার্চ', 3: 'এপ্রিল',
        4: 'মে', 5: 'জুন', 6: 'জুলাই', 7: 'আগস্ট',
        8: 'সেপ্টেম্বর', 9: 'অক্টোবর', 10: 'নভেম্বর', 11: 'ডিসেম্বর'
    },
    
    timePhases: {
        night: 'রাত',      // 12 AM - 4 AM & 8 PM - 12 AM
        morning: 'সকাল',   // 4 AM - 11 AM
        noon: 'দুপুর',     // 11 AM - 3 PM
        afternoon: 'বিকাল',// 3 PM - 6 PM
        evening: 'সন্ধ্যা' // 6 PM - 8 PM
    },

    // Utility Methods
    toBanglaNumber(number) {
        return number.toString().replace(/[0-9]/g, d => this.numbers[d]);
    },

    getTimePhase(hours) {
        if (hours >= 4 && hours < 11) return this.timePhases.morning;
        if (hours >= 11 && hours < 15) return this.timePhases.noon;
        if (hours >= 15 && hours < 18) return this.timePhases.afternoon;
        if (hours >= 18 && hours < 20) return this.timePhases.evening;
        return this.timePhases.night;
    },

    formatDateTime(date) {
        if (typeof date === 'string') date = new Date(date);

        const weekday = this.weekdays[date.getDay()];
        const day = this.toBanglaNumber(date.getDate());
        const month = this.months[date.getMonth()];
        const year = this.toBanglaNumber(date.getFullYear());
        
        let hours = date.getHours();
        const timePhase = this.getTimePhase(hours);
        
        hours = hours % 12 || 12;
        const minutes = this.toBanglaNumber(date.getMinutes().toString().padStart(2, '0'));

        return `আজ ${weekday}, ${day} ${month} ${year} | সময় ${timePhase} ${this.toBanglaNumber(hours)}টা ${minutes} মিনিট`;
    },

    formatDate(date) {
        if (typeof date === 'string') date = new Date(date);
        const day = this.toBanglaNumber(date.getDate());
        const month = this.months[date.getMonth()];
        const year = this.toBanglaNumber(date.getFullYear());
        return `${day} ${month} ${year}`;
    },

    formatTime(date) {
        if (typeof date === 'string') date = new Date(date);
        const hours = date.getHours() % 12 || 12;
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const phase = this.getTimePhase(date.getHours());
        return `${this.toBanglaNumber(hours)}:${this.toBanglaNumber(minutes)} ${phase}`;
    },

    getRelativeTime(date) {
        if (typeof date === 'string') date = new Date(date);
        
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'এইমাত্র';
        if (diffHours < 1) return `${this.toBanglaNumber(diffMins)} মিনিট আগে`;
        if (diffDays < 1) return `${this.toBanglaNumber(diffHours)} ঘণ্টা আগে`;
        if (diffDays < 30) return `${this.toBanglaNumber(diffDays)} দিন আগে`;
        return this.formatDate(date);
    },

    getRemainingTime(dueDate, dueTime) {
        const deadline = new Date(`${dueDate} ${dueTime}`);
        const now = new Date();
        const diffMs = deadline - now;
        
        if (diffMs < 0) return 'সময় শেষ';
        
        const diffMins = Math.ceil(diffMs / 60000);
        const diffHours = Math.ceil(diffMs / 3600000);
        const diffDays = Math.ceil(diffMs / 86400000);

        if (diffDays > 1) return `${this.toBanglaNumber(diffDays)} দিন বাকি`;
        if (diffDays === 1) return 'আগামীকাল শেষ';
        if (diffHours >= 1) return `${this.toBanglaNumber(diffHours)} ঘণ্টা বাকি`;
        return `${this.toBanglaNumber(diffMins)} মিনিট বাকি`;
    },

    isToday(date) {
        if (typeof date === 'string') date = new Date(date);
        const today = new Date();
        return date.toDateString() === today.toDateString();
    },

    isTomorrow(date) {
        if (typeof date === 'string') date = new Date(date);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return date.toDateString() === tomorrow.toDateString();
    }
};

// Update time display
function updateDateTime() {
    const display = document.getElementById('currentDateTime');
    if (display) {
        display.textContent = TimeUtils.formatDateTime(new Date());
    }
}

// Initialize time display
document.addEventListener('DOMContentLoaded', () => {
    updateDateTime();
    setInterval(updateDateTime, 60000); // Update every minute
});

// Example usage:
// TimeUtils.formatDateTime(new Date());     // Full date and time
// TimeUtils.formatDate(new Date());         // Only date
// TimeUtils.formatTime(new Date());         // Only time
// TimeUtils.getRelativeTime(someDate);      // Relative time
// TimeUtils.getRemainingTime(dueDate, dueTime); // Remaining time