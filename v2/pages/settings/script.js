 
let currentTheme = localStorage.getItem('theme') || 'system';

function initializeSettings() {
    // Set current theme
    document.querySelectorAll('.theme-option').forEach(option => {
        if (option.dataset.theme === currentTheme) {
            option.classList.add('active');
        }
        option.addEventListener('click', () => setTheme(option.dataset.theme));
    });

    // Load notification settings
    document.getElementById('taskReminders').checked = 
        localStorage.getItem('taskReminders') !== 'false';
    document.getElementById('dailyDigest').checked = 
        localStorage.getItem('dailyDigest') === 'true';

    // Set user info
    document.getElementById('userName').textContent = 'এমডি সায়েব';
    document.getElementById('userLoginName').textContent = 'mdsayeb7';
}

function setTheme(theme) {
    currentTheme = theme;
    localStorage.setItem('theme', theme);
    
    document.querySelectorAll('.theme-option').forEach(option => {
        option.classList.toggle('active', option.dataset.theme === theme);
    });

    // Apply theme
    if (theme === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
    } else {
        document.body.setAttribute('data-theme', theme);
    }
}

function handleNotificationChange(event) {
    const setting = event.target.id;
    localStorage.setItem(setting, event.target.checked);
}

function exportData() {
    const data = {
        tasks: Storage.getTasks(),
        settings: {
            theme: currentTheme,
            taskReminders: document.getElementById('taskReminders').checked,
            dailyDigest: document.getElementById('dailyDigest').checked
        }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp = formatExportTimestamp(new Date());
    
    a.href = url;
    a.download = `homework-tracker-backup-${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function formatExportTimestamp(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}${month}${day}-${hours}${minutes}`;
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = event => {
            try {
                const data = JSON.parse(event.target.result);
                
                // Validate data structure
                if (!data.tasks || !Array.isArray(data.tasks)) {
                    throw new Error('অবৈধ ডাটা ফরম্যাট');
                }

                // Import tasks
                Storage.saveTasks(data.tasks);

                // Import settings
                if (data.settings) {
                    if (data.settings.theme) {
                        setTheme(data.settings.theme);
                    }
                    if (typeof data.settings.taskReminders === 'boolean') {
                        document.getElementById('taskReminders').checked = data.settings.taskReminders;
                        localStorage.setItem('taskReminders', data.settings.taskReminders);
                    }
                    if (typeof data.settings.dailyDigest === 'boolean') {
                        document.getElementById('dailyDigest').checked = data.settings.dailyDigest;
                        localStorage.setItem('dailyDigest', data.settings.dailyDigest);
                    }
                }

                alert('ডাটা সফলভাবে ইমপোর্ট করা হয়েছে।');
                location.reload();
            } catch (error) {
                alert('ডাটা ইমপোর্ট করতে সমস্যা হয়েছে: ' + error.message);
            }
        };
        reader.readAsText(file);
    };

    input.click();
}

function clearData() {
    if (confirm('আপনি কি নিশ্চিত যে আপনি সমস্ত ডাটা মুছে ফেলতে চান? এই কাজটি অপরিবর্তনীয়।')) {
        // Clear all tasks
        Storage.saveTasks([]);
        
        // Reset settings to default
        localStorage.setItem('theme', 'system');
        localStorage.setItem('taskReminders', 'true');
        localStorage.setItem('dailyDigest', 'false');
        
        alert('সমস্ত ডাটা মুছে ফেলা হয়েছে।');
        location.reload();
    }
}

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (currentTheme === 'system') {
        document.body.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    }
});

// Add event listeners for notification toggles
document.getElementById('taskReminders').addEventListener('change', handleNotificationChange);
document.getElementById('dailyDigest').addEventListener('change', handleNotificationChange);

// Initialize settings when page loads
document.addEventListener('DOMContentLoaded', initializeSettings);
