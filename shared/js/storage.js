const Storage = {
    // Constants
    KEYS: {
        TASKS: 'tasks',
        SETTINGS: 'settings',
        USER: 'user',
        SUBJECTS: 'subjects'  // Added for subject management
    },

    defaults: {
        settings: {
            theme: 'system',
            userName: 'এমডি সায়েব',  // Added default user name
            lastUpdated: '2025-01-27 15:57:00'
        },
        subjects: [  // Added default subjects
            'বাংলা',
            'ইংরেজি',
            'গণিত',
            'বিজ্ঞান',
            'সমাজ'
        ]
    },

    // Core Task Operations
    getTasks() {
        try {
            const tasks = JSON.parse(localStorage.getItem(this.KEYS.TASKS) || '[]');
            return tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by creation date
        } catch {
            return [];
        }
    },

    saveTasks(tasks) {
        localStorage.setItem(this.KEYS.TASKS, JSON.stringify(tasks));
        this.updateLastModified();
    },

    addTask(task) {
        const tasks = this.getTasks();
        const newTask = {
            id: Date.now(),
            ...task,
            createdAt: new Date().toISOString(),
            status: 'pending'
        };
        tasks.unshift(newTask); // Add to beginning of array
        this.saveTasks(tasks);
        return true;
    },

    updateTask(taskId, updates) {
        const tasks = this.getTasks();
        const index = tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
            tasks[index] = { 
                ...tasks[index], 
                ...updates,
                updatedAt: new Date().toISOString()
            };
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

    // Settings Management
    getSettings() {
        try {
            return JSON.parse(localStorage.getItem(this.KEYS.SETTINGS)) || this.defaults.settings;
        } catch {
            return this.defaults.settings;
        }
    },

    saveSettings(settings) {
        const updatedSettings = {
            ...settings,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(updatedSettings));
        return true;
    },

    updateUserName(name) {
        const settings = this.getSettings();
        return this.saveSettings({
            ...settings,
            userName: name
        });
    },

    // Subject Management
    getSubjects() {
        try {
            return JSON.parse(localStorage.getItem(this.KEYS.SUBJECTS)) || this.defaults.subjects;
        } catch {
            return this.defaults.subjects;
        }
    },

    saveSubjects(subjects) {
        localStorage.setItem(this.KEYS.SUBJECTS, JSON.stringify(subjects));
        return true;
    },

    addSubject(subject) {
        const subjects = this.getSubjects();
        if (!subjects.includes(subject)) {
            subjects.push(subject);
            return this.saveSubjects(subjects);
        }
        return false;
    },

    deleteSubject(subject) {
        const subjects = this.getSubjects();
        const filtered = subjects.filter(s => s !== subject);
        if (filtered.length !== subjects.length) {
            return this.saveSubjects(filtered);
        }
        return false;
    },

    // Data Management
    exportData() {
        return {
            tasks: this.getTasks(),
            settings: this.getSettings(),
            subjects: this.getSubjects(),
            exportDate: new Date().toISOString()
        };
    },

    importData(data) {
        if (!data) return false;
        
        try {
            if (data.tasks) this.saveTasks(data.tasks);
            if (data.settings) this.saveSettings(data.settings);
            if (data.subjects) this.saveSubjects(data.subjects);
            return true;
        } catch {
            return false;
        }
    },

    clearData() {
        localStorage.clear();
        this.saveTasks([]);
        this.saveSettings(this.defaults.settings);
        this.saveSubjects(this.defaults.subjects);
        return true;
    },

    // Utility Methods
    updateLastModified() {
        const settings = this.getSettings();
        settings.lastUpdated = new Date().toISOString();
        this.saveSettings(settings);
    }
};