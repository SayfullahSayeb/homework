const TimeUtils = {
    // Map English numbers to Bengali numbers
    bengaliNumerals: {
        '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
        '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
    },

    // Bengali month names
    bengaliMonths: [
        'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
        'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
    ],

    // Bengali weekday names
    bengaliWeekdays: [
        'রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার',
        'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'
    ],

    // Convert English numbers to Bengali
    toBengaliNumerals(number) {
        return number.toString().replace(/[0-9]/g, digit => this.bengaliNumerals[digit]);
    },

    // Format time to Bengali (12-hour format)
    formatTimeToBengali(date) {
        if (typeof date === 'string') {
            date = new Date(date);
        }

        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'অপরাহ্ন' : 'পূর্বাহ্ন';
        
        hours = hours % 12;
        hours = hours ? hours : 12; // Convert 0 to 12

        const bengaliHours = this.toBengaliNumerals(hours.toString().padStart(2, '0'));
        const bengaliMinutes = this.toBengaliNumerals(minutes.toString().padStart(2, '0'));

        return `${bengaliHours}:${bengaliMinutes} ${ampm}`;
    },

    // Format date to Bengali
    formatDateToBengali(date) {
        if (typeof date === 'string') {
            date = new Date(date);
        }

        const day = this.toBengaliNumerals(date.getDate());
        const month = this.bengaliMonths[date.getMonth()];
        const year = this.toBengaliNumerals(date.getFullYear());
        const weekday = this.bengaliWeekdays[date.getDay()];

        return `${weekday}, ${day} ${month} ${year}`;
    },

    // Format relative time (e.g., "2 days ago" in Bengali)
    formatRelativeTime(date) {
        if (typeof date === 'string') {
            date = new Date(date);
        }

        const now = new Date();
        const diffTime = now - date;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffTime / (1000 * 60));

        if (diffDays > 30) {
            return this.formatDateToBengali(date);
        } else if (diffDays > 0) {
            return `${this.toBengaliNumerals(diffDays)} দিন আগে`;
        } else if (diffHours > 0) {
            return `${this.toBengaliNumerals(diffHours)} ঘণ্টা আগে`;
        } else if (diffMinutes > 0) {
            return `${this.toBengaliNumerals(diffMinutes)} মিনিট আগে`;
        } else {
            return 'এইমাত্র';
        }
    },

    // Format deadline time
    formatDeadline(dueDate, dueTime) {
        const deadline = new Date(`${dueDate} ${dueTime}`);
        const now = new Date();
        const diffTime = deadline - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffTime < 0) {
            return 'সময় শেষ';
        }

        if (this.isToday(deadline)) {
            const hours = Math.ceil(diffTime / (1000 * 60 * 60));
            if (hours < 1) {
                const minutes = Math.ceil(diffTime / (1000 * 60));
                return `${this.toBengaliNumerals(minutes)} মিনিট বাকি`;
            }
            return `${this.toBengaliNumerals(hours)} ঘণ্টা বাকি`;
        }

        if (diffDays === 1) {
            return 'আগামীকাল শেষ';
        }

        return `${this.toBengaliNumerals(diffDays)} দিন বাকি`;
    },

    // Check if date is today
    isToday(date) {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        const today = new Date();
        return date.toDateString() === today.toDateString();
    },

    // Check if date is tomorrow
    isTomorrow(date) {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return date.toDateString() === tomorrow.toDateString();
    },

    // Get current time in Bengali
    getCurrentTime() {
        return this.formatTimeToBengali(new Date());
    },

    // Get current date in Bengali
    getCurrentDate() {
        return this.formatDateToBengali(new Date());
    },

    // Format task due time
    formatTaskDueTime(dueDate, dueTime) {
        const date = new Date(`${dueDate} ${dueTime}`);
        if (this.isToday(date)) {
            return `আজ ${this.formatTimeToBengali(date)}`;
        }
        if (this.isTomorrow(date)) {
            return `আগামীকাল ${this.formatTimeToBengali(date)}`;
        }
        return `${this.formatDateToBengali(date)} ${this.formatTimeToBengali(date)}`;
    }
};

// Example usage:
// TimeUtils.formatTimeToBengali(new Date()); // Returns time in Bengali
// TimeUtils.formatDateToBengali(new Date()); // Returns date in Bengali
// TimeUtils.formatRelativeTime(new Date('2025-01-26')); // Returns "১ দিন আগে"
// TimeUtils.formatDeadline('2025-01-28', '15:00'); // Returns time remaining in Bengali