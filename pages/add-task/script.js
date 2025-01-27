 
let editingTaskId = null;

function initializeForm() {
    // Set default date to today
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    document.getElementById('dueDate').value = dateString;
    
    // Check if we're editing an existing task
    const params = new URLSearchParams(window.location.search);
    const taskId = params.get('edit');
    
    if (taskId) {
        editingTaskId = parseInt(taskId);
        const task = Storage.getTasks().find(t => t.id === editingTaskId);
        if (task) {
            fillFormWithTask(task);
            document.getElementById('formTitle').textContent = 'কাজ সম্পাদনা করুন';
        }
    }
}

function fillFormWithTask(task) {
    document.getElementById('title').value = task.title;
    document.getElementById('subject').value = task.subject;
    document.getElementById('description').value = task.description || '';
    document.getElementById('dueDate').value = task.dueDate;
    document.getElementById('dueTime').value = task.dueTime;
    document.querySelector(`input[name="priority"][value="${task.priority}"]`).checked = true;
}

function handleSubmit(event) {
    event.preventDefault();
    
    const formData = {
        title: document.getElementById('title').value,
        subject: document.getElementById('subject').value,
        description: document.getElementById('description').value,
        dueDate: document.getElementById('dueDate').value,
        dueTime: document.getElementById('dueTime').value,
        priority: document.querySelector('input[name="priority"]:checked').value,
        completed: false
    };

    if (editingTaskId) {
        Storage.updateTask(editingTaskId, formData);
    } else {
        Storage.addTask(formData);
    }

    // Return to previous page
    history.back();
}

// Initialize form when page loads
document.addEventListener('DOMContentLoaded', initializeForm);