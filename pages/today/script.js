 
let currentFilter = 'all';

function updateTaskSummary() {
    const tasks = Storage.getTodaysTasks();
    const completed = tasks.filter(t => t.completed).length;
    const total = tasks.length;
    
    document.getElementById('totalTasks').textContent = toBanglaNumber(total.toString());
    document.getElementById('completedTasks').textContent = toBanglaNumber(completed.toString());
    document.getElementById('remainingTasks').textContent = toBanglaNumber((total - completed).toString());
}

function createTaskElement(task) {
    const div = document.createElement('div');
    div.className = 'task-item';
    div.innerHTML = `
        <div class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="toggleTask(${task.id})">
            ${task.completed ? '<i class="bi bi-check"></i>' : ''}
        </div>
        <div class="task-content">
            <div class="task-title">${task.title}</div>
            <div class="task-meta">
                <span><i class="bi bi-clock"></i> ${formatTimeToBangla(new Date(task.dueTime))}</span>
                <span><i class="bi bi-bookmark"></i> ${task.subject}</span>
            </div>
        </div>
        <div class="task-actions">
            <button class="task-btn" onclick="editTask(${task.id})">
                <i class="bi bi-pencil"></i>
            </button>
            <button class="task-btn" onclick="deleteTask(${task.id})">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    `;
    return div;
}

function renderTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    
    const tasks = Storage.getTodaysTasks();
    const filteredTasks = tasks.filter(task => {
        if (currentFilter === 'completed') return task.completed;
        if (currentFilter === 'pending') return !task.completed;
        return true;
    });

    filteredTasks.forEach(task => {
        taskList.appendChild(createTaskElement(task));
    });

    updateTaskSummary();
}

function toggleTask(taskId) {
    const tasks = Storage.getTasks();
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        Storage.saveTasks(tasks);
        renderTasks();
    }
}

function deleteTask(taskId) {
    if (confirm('এই কাজটি মুছে ফেলতে চান?')) {
        Storage.deleteTask(taskId);
        renderTasks();
    }
}

function editTask(taskId) {
    window.location.href = `../add-task/index.html?edit=${taskId}`;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    renderTasks();

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });
});