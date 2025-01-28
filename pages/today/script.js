let currentFilter = 'all';

function toBanglaNumber(number) {
    const banglaNumbers = {
        '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
        '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
    };
    return number.toString().replace(/[0-9]/g, digit => banglaNumbers[digit]);
}

function updateTaskSummary() {
    const tasks = Storage.getTasks();
    const completed = tasks.filter(t => t.completed).length;
    const total = tasks.length;
    
    document.getElementById('totalTasks').textContent = toBanglaNumber(total.toString());
    document.getElementById('completedTasks').textContent = toBanglaNumber(completed.toString());
    document.getElementById('remainingTasks').textContent = toBanglaNumber((total - completed).toString());
}

function createTaskElement(task) {
    const div = document.createElement('div');
    div.className = `task-item ${task.completed ? 'completed' : ''}`;
    div.innerHTML = `
        <div class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="toggleTask(${task.id})">
            ${task.completed ? '<i class="bi bi-check"></i>' : ''}
        </div>
        <div class="task-content">
            <div class="task-title">${task.title}</div>
            <div class="task-meta">
                <span class="subject-tag">${task.subject}</span>
            </div>
        </div>
        <div class="task-actions">
            <button class="task-btn edit-btn" onclick="editTask(${task.id})">
                <i class="bi bi-pencil"></i>
            </button>
            <button class="task-btn delete-btn" onclick="deleteTask(${task.id})">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    `;
    return div;
}

function renderTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    
    const tasks = Storage.getTasks();
    const filteredTasks = tasks.filter(task => {
        if (currentFilter === 'completed') return task.completed;
        if (currentFilter === 'pending') return !task.completed;
        return true;
    });

    if (filteredTasks.length === 0) {
        taskList.innerHTML = `
            <div class="no-tasks">
                <i class="bi bi-journal-x"></i>
                <p>কোন কাজ নেই</p>
            </div>
        `;
    } else {
        filteredTasks.forEach(task => {
            taskList.appendChild(createTaskElement(task));
        });
    }

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

function showConfirmDialog(message, onConfirm) {
    const dialog = document.createElement('div');
    dialog.className = 'dialog-overlay';
    dialog.innerHTML = `
        <div class="confirm-dialog">
            <h3 class="confirm-dialog-title">নিশ্চিতকরণ</h3>
            <p class="confirm-dialog-message">${message}</p>
            <div class="confirm-dialog-buttons">
                <button class="confirm-btn confirm-btn-cancel">না</button>
                <button class="confirm-btn confirm-btn-delete">হ্যাঁ</button>
            </div>
        </div>
    `;

    document.body.appendChild(dialog);

    const cancelBtn = dialog.querySelector('.confirm-btn-cancel');
    const deleteBtn = dialog.querySelector('.confirm-btn-delete');

    cancelBtn.addEventListener('click', () => {
        dialog.remove();
    });

    deleteBtn.addEventListener('click', () => {
        onConfirm();
        dialog.remove();
    });
}

// Update the deleteTask function to use the custom dialog
function deleteTask(taskId) {
    showConfirmDialog('এই কাজটি মুছে ফেলতে চান?', () => {
        if (Storage.deleteTask(taskId)) {
            renderTasks();
            showToast('কাজটি মুছে ফেলা হয়েছে', 'success');
        }
    });
}

function editTask(taskId) {
    window.location.href = `../add-task/index.html?edit=${taskId}`;
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }, 100);
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


document.addEventListener('DOMContentLoaded', () => {
    const userName = localStorage.getItem('userName') || '';
    document.getElementById('userLogin').textContent = userName;

})});