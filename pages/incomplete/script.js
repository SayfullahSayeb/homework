 
let currentSort = 'dueDate';

function updateTaskSummary(tasks) {
    const priorityCounts = {
        high: 0,
        medium: 0,
        low: 0
    };

    tasks.forEach(task => {
        priorityCounts[task.priority]++;
    });

    document.getElementById('totalIncomplete').textContent = toBanglaNumber(tasks.length.toString());
    document.getElementById('highPriorityCount').textContent = toBanglaNumber(priorityCounts.high.toString());
    document.getElementById('mediumPriorityCount').textContent = toBanglaNumber(priorityCounts.medium.toString());
    document.getElementById('lowPriorityCount').textContent = toBanglaNumber(priorityCounts.low.toString());
}

function groupTasksByDate(tasks) {
    const groups = {};
    
    tasks.forEach(task => {
        const date = task.dueDate;
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(task);
    });

    return groups;
}

function formatDateHeader(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.getTime() === today.getTime()) {
        return 'আজ';
    } else if (date.getTime() === tomorrow.getTime()) {
        return 'আগামীকাল';
    }

    return formatTimeToBangla(date).split('|')[0];
}

function createTaskElement(task) {
    const div = document.createElement('div');
    div.className = 'task-item';
    div.innerHTML = `
        <div class="priority-indicator ${task.priority}"></div>
        <div class="task-content">
            <div class="task-title">${task.title}</div>
            <div class="task-meta">
                <span><i class="bi bi-clock"></i> ${task.dueTime}</span>
                <span><i class="bi bi-bookmark"></i> ${task.subject}</span>
            </div>
        </div>
        <div class="task-actions">
            <button class="task-btn" onclick="completeTask(${task.id})">
                <i class="bi bi-check-circle"></i>
            </button>
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
    const tasks = Storage.getTasks().filter(task => !task.completed);
    updateTaskSummary(tasks);

    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    let sortedTasks = [...tasks];
    
    switch (currentSort) {
        case 'priority':
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            sortedTasks.sort((a, b) => {
                const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
                return priorityDiff || new Date(a.dueDate) - new Date(b.dueDate);
            });
            break;
        case 'subject':
            sortedTasks.sort((a, b) => a.subject.localeCompare(b.subject));
            break;
        default: // dueDate
            sortedTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    }

    if (currentSort === 'dueDate') {
        const groupedTasks = groupTasksByDate(sortedTasks);
        
        Object.entries(groupedTasks).sort(([dateA], [dateB]) => 
            new Date(dateA) - new Date(dateB)
        ).forEach(([date, tasks]) => {
            const dateGroup = document.createElement('div');
            dateGroup.className = 'date-group';
            
            dateGroup.innerHTML = `
                <div class="date-header">
                    <span>${formatDateHeader(date)}</span>
                    <span>${toBanglaNumber(tasks.length.toString())} টি কাজ</span>
                </div>
                <div class="date-tasks"></div>
            `;

            const tasksContainer = dateGroup.querySelector('.date-tasks');
            tasks.forEach(task => {
                tasksContainer.appendChild(createTaskElement(task));
            });

            taskList.appendChild(dateGroup);
        });
    } else {
        sortedTasks.forEach(task => {
            taskList.appendChild(createTaskElement(task));
        });
    }
}

function handleSort() {
    currentSort = document.getElementById('sortTasks').value;
    renderTasks();
}

function completeTask(taskId) {
    Storage.updateTask(taskId, { completed: true });
    renderTasks();
}

function editTask(taskId) {
    window.location.href = `../add-task/index.html?edit=${taskId}`;
}

function deleteTask(taskId) {
    if (confirm('এই কাজটি মুছে ফেলতে চান?')) {
        Storage.deleteTask(taskId);
        renderTasks();
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', renderTasks);

document.addEventListener('DOMContentLoaded', () => {
    const userName = localStorage.getItem('userName') || '';
    document.getElementById('userLogin').textContent = userName;

});