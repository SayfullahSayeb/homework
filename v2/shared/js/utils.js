 
const Utils = {
    formatDate(date) {
        return date.toISOString().replace('T', ' ').slice(0, 19);
    },

    createElement(tag, className, text) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (text) element.textContent = text;
        return element;
    },

    showToast(message, type = 'info') {
        // Toast implementation will come later
    }
};