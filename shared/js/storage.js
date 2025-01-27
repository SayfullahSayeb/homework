const Storage = {
    // Constants
    KEYS: {
        TASKS: 'tasks',
        SETTINGS: 'settings',
        USER: 'user'
    },

    defaults: {
        user: {
            login: 'mdsayeb7',
            lastActive: '2025-01-27 15:33:44'
        },
        settings: {
            theme: 'system'
        }
    },

    // Core Task Operations
    getTasks() {
        try {
            const tasks = JSON.parse(localStorage.getItem(this.KEYS.TASKS) || '[]');
            return tasks.sort((a, b) => new Date(a.dueDate + ' ' + a.dueTime) - new Date(b.dueDate + ' ' + b.dueTime));
        } catch {
            return [];
        }
    },

    saveTasks(tasks) {
        localStorage.setItem(this.KEYS.TASKS, JSON.stringify(tasks));
    },

    addTask(task) {
        const tasks = this.getTasks();
        tasks.push({
            id: Date.now(),
            ...task,
            createdAt: new Date().toISOString(),
            status: 'pending'
        });
        this.saveTasks(tasks);
        return true;
    },

    updateTask(taskId, updates) {
        const tasks = this.getTasks();
        const index = tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
            tasks[index] = { ...tasks[index], ...updates };
            this.saveTasks(tasks);
            return true;
        }
        return false;
    },

    deleteTask(taskId) {
        const tasks = this.getTasks();
        const filtered = tasks.filter(t => t.id !== taskId);
        if (filtered.length !== tasks.length) {
            this.saveTasks(filtered);
            return true;
        }
        return false;
    },

    // Task Queries
    getTodaysTasks() {
        const today = new Date().toISOString().split('T')[0];
        return this.getTasks().filter(task => task.dueDate === today);
    },

    getIncompleteTasks() {
        return this.getTasks().filter(task => !task.completed);
    },

    getCompletedTasks() {
        return this.getTasks().filter(task => task.completed);
    },

    // Settings Management
    getSettings() {
        try {
            return JSON.parse(localStorage.getItem(this.KEYS.SETTINGS)) || this.defaults.settings;
        } catch {
            return this.defaults.settings;
        }
    },

    saveSettings(settings) {
        localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
        return true;
    },

    // User Management
    getUser() {
        try {
            return JSON.parse(localStorage.getItem(this.KEYS.USER)) || this.defaults.user;
        } catch {
            return this.defaults.user;
        }
    },

    // Data Management
    exportData() {
        return {
            tasks: this.getTasks(),
            settings: this.getSettings(),
            user: this.getUser(),
            exportDate: new Date().toISOString()
        };
    },

    importData(data) {
        if (!data?.tasks?.length) return false;
        
        try {
            this.saveTasks(data.tasks);
            if (data.settings) this.saveSettings(data.settings);
            return true;
        } catch {
            return false;
        }
    },

    clearData() {
        localStorage.clear();
        this.saveTasks([]);
        this.saveSettings(this.defaults.settings);
        return true;
    }
};