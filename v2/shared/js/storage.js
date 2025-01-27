 
const Storage = {
    getTasks() {
        const tasks = localStorage.getItem('tasks');
        return tasks ? JSON.parse(tasks) : [];
    },

    saveTasks(tasks) {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    },

    addTask(task) {
        const tasks = this.getTasks();
        tasks.push({
            id: Date.now(),
            ...task,
            createdAt: new Date().toISOString()
        });
        this.saveTasks(tasks);
    },

    updateTask(taskId, updates) {
        const tasks = this.getTasks();
        const index = tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
            tasks[index] = { ...tasks[index], ...updates };
            this.saveTasks(tasks);
        }
    },

    deleteTask(taskId) {
        const tasks = this.getTasks();
        const filteredTasks = tasks.filter(t => t.id !== taskId);
        this.saveTasks(filteredTasks);
    },

    getTodaysTasks() {
        const tasks = this.getTasks();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return tasks.filter(task => {
            const taskDate = new Date(task.dueDate);
            taskDate.setHours(0, 0, 0, 0);
            return taskDate.getTime() === today.getTime();
        });
    }
};