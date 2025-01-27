// Global variables
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let customSubjects = JSON.parse(localStorage.getItem('customSubjects')) || {};

// Update current date and time
function updateDateTime() {
    const now = new Date();
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    };
    document.getElementById('currentDateTime').textContent = 
        now.toLocaleDateString('bn-BD', options);
}

// Initialize clock
setInterval(updateDateTime, 1000);

// Theme toggle functionality
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const themeToggle = document.querySelector('.theme-toggle i');

    if (currentTheme === 'dark') {
        body.removeAttribute('data-theme');
        themeToggle.classList.remove('fa-sun');
        themeToggle.classList.add('fa-moon');
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        themeToggle.classList.remove('fa-moon');
        themeToggle.classList.add('fa-sun');
        localStorage.setItem('theme', 'dark');
    }
}

// Toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                       type === 'error' ? 'fa-exclamation-circle' : 
                       'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Modal functions
function openModal() {
    document.getElementById('addTaskModal').style.display = 'block';
    document.getElementById('subject').value = '';
    document.getElementById('customSubjectDiv').style.display = 'none';
}

function closeModal() {
    document.getElementById('addTaskModal').style.display = 'none';
    document.getElementById('addTaskForm').reset();
}

function closeEditModal() {
    document.getElementById('editTaskModal').style.display = 'none';
    document.getElementById('editTaskForm').reset();
}

// Handle subject selection
function handleSubjectSelect(selectElement, mode = 'add') {
    const customDivId = mode === 'edit' ? 'editCustomSubjectDiv' : 'customSubjectDiv';
    const customDiv = document.getElementById(customDivId);
    
    if (selectElement.value === 'custom') {
        customDiv.style.display = 'block';
    } else {
        customDiv.style.display = 'none';
    }
}

// Add custom subject
function addCustomSubject(mode = 'add') {
    const prefix = mode === 'edit' ? 'edit' : '';
    const subjectInput = document.getElementById(`${prefix}CustomSubject`);
    const colorInput = document.getElementById(`${prefix}SubjectColor`);
    const selectElement = document.getElementById(`${prefix}subject`);
    
    const subjectName = subjectInput.value.trim();
    const subjectColor = colorInput.value;

    if (!subjectName) {
        showToast('বিষয়ের নাম দিন!', 'error');
        return;
    }

    const subjectId = 'custom_' + subjectName.toLowerCase().replace(/\s+/g, '_');

    // Check if subject already exists
    if (customSubjects[subjectId]) {
        showToast('এই বিষয়টি ইতিমধ্যে বিদ্যমান!', 'error');
        return;
    }

    // Save custom subject
    customSubjects[subjectId] = {
        name: subjectName,
        color: subjectColor
    };
    localStorage.setItem('customSubjects', JSON.stringify(customSubjects));

    // Add to select options
    const option = new Option(subjectName, subjectId);
    selectElement.add(option);
    selectElement.value = subjectId;

    // Hide custom input
    document.getElementById(`${prefix}CustomSubjectDiv`).style.display = 'none';

    // Add the CSS rule for the new subject
    addCustomSubjectStyle(subjectId, subjectColor);

    // Clear inputs
    subjectInput.value = '';
    colorInput.value = '#4ecdc4';

    showToast('নতুন বিষয় যোগ করা হয়েছে!', 'success');
}

// Add custom subject CSS rule
function addCustomSubjectStyle(subjectId, color) {
    const styleSheet = document.styleSheets[0];
    const rule = `.subject-${subjectId} { background-color: ${color}; }`;
    styleSheet.insertRule(rule, styleSheet.cssRules.length);
}

// Add new task
function addTask(event) {
    event.preventDefault();

    const task = {
        id: Date.now(),
        subject: document.getElementById('subject').value,
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        priority: document.getElementById('priority').value,
        timestamp: new Date().toISOString(),
        completed: false
    };

    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    closeModal();
    renderTasks();
    showToast('নতুন কাজ যোগ করা হয়েছে!', 'success');
}

// Delete task
function showDeleteConfirmation(taskId) {
    const dialog = document.createElement('div');
    dialog.innerHTML = `
        <div class="overlay"></div>
        <div class="confirm-dialog">
            <p>আপনি কি নিশ্চিত যে আপনি এই কাজটি মুছে ফেলতে চান?</p>
            <div class="confirm-actions">
                <button class="btn confirm-yes" onclick="confirmDelete(${taskId})">
                    <i class="fas fa-check"></i> হ্যাঁ
                </button>
                <button class="btn confirm-no" onclick="closeDeleteConfirmation()">
                    <i class="fas fa-times"></i> না
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(dialog);
}

function closeDeleteConfirmation() {
    const dialog = document.querySelector('.overlay')?.parentNode;
    if (dialog) {
        document.body.removeChild(dialog);
    }
}

function confirmDelete(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    closeDeleteConfirmation();
    renderTasks();
    showToast('কাজটি মুছে ফেলা হয়েছে!', 'success');
}
// Toggle task completion
function toggleTaskComplete(taskId) {
    tasks = tasks.map(task => {
        if (task.id === taskId) {
            const updatedTask = { ...task, completed: !task.completed };
            showToast(
                updatedTask.completed ? 'কাজটি সম্পন্ন করা হয়েছে!' : 'কাজটি পুনরায় অসম্পূর্ণ করা হয়েছে!',
                'info'
            );
            return updatedTask;
        }
        return task;
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
}

// Edit task functionality
function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        document.getElementById('editTaskId').value = task.id;
        document.getElementById('editSubject').value = task.subject;
        document.getElementById('editTitle').value = task.title;
        document.getElementById('editDescription').value = task.description;
        document.getElementById('editPriority').value = task.priority;
        document.getElementById('editCustomSubjectDiv').style.display = 'none';
        document.getElementById('editTaskModal').style.display = 'block';
    }
}

// Update task
function updateTask(event) {
    event.preventDefault();
    const taskId = parseInt(document.getElementById('editTaskId').value);
    
    tasks = tasks.map(task => {
        if (task.id === taskId) {
            return {
                ...task,
                subject: document.getElementById('editSubject').value,
                title: document.getElementById('editTitle').value,
                description: document.getElementById('editDescription').value,
                priority: document.getElementById('editPriority').value
            };
        }
        return task;
    });

    localStorage.setItem('tasks', JSON.stringify(tasks));
    closeEditModal();
    renderTasks();
    showToast('কাজটি আপডেট করা হয়েছে!', 'success');
}

// Group tasks by date
function groupTasksByDate(tasks) {
    const grouped = {};
    tasks.forEach(task => {
        const date = new Date(task.timestamp).toLocaleDateString('bn-BD');
        if (!grouped[date]) {
            grouped[date] = [];
        }
        grouped[date].push(task);
    });
    return grouped;
}

// Render tasks
function renderTasks() {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000);

    // Today's tasks (including completed)
    const todaysAllTasks = tasks.filter(task => {
        const taskDate = new Date(task.timestamp);
        return taskDate > twentyFourHoursAgo;
    });

    const todaysActiveTasks = todaysAllTasks.filter(task => !task.completed);
    const todaysCompletedTasks = todaysAllTasks.filter(task => task.completed);

    // Unfinished tasks (older than 24 hours and not completed)
    const unfinishedTasks = tasks.filter(task => {
        const taskDate = new Date(task.timestamp);
        return taskDate <= twentyFourHoursAgo && !task.completed;
    });

    // All completed tasks
    const completedTasks = tasks.filter(task => task.completed && 
        new Date(task.timestamp) <= twentyFourHoursAgo);

    // Render today's tasks
    let todaysHtml = renderTaskList(todaysActiveTasks);
    if (todaysCompletedTasks.length > 0) {
        todaysHtml += `
            <div class="today-completed">
                <h4><i class="fas fa-check-circle"></i> আজকের সম্পন্ন কাজ</h4>
                ${renderTaskList(todaysCompletedTasks)}
            </div>
        `;
    }
    document.getElementById('todaysTasksList').innerHTML = todaysHtml || 
        '<div class="no-tasks">কোন কাজ নেই</div>';

    // Render unfinished tasks grouped by date
    const groupedUnfinished = groupTasksByDate(unfinishedTasks);
    const unfinishedHtml = Object.entries(groupedUnfinished)
        .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
        .map(([date, tasks]) => `
            <div class="date-header">
                <i class="fas fa-calendar-day"></i> ${date}
            </div>
            ${renderTaskList(tasks)}
        `).join('');
    document.getElementById('upcomingTasksList').innerHTML = unfinishedHtml || 
        '<div class="no-tasks">কোন কাজ নেই</div>';

    // Render completed tasks grouped by date
    const groupedCompleted = groupTasksByDate(completedTasks);
    const completedHtml = Object.entries(groupedCompleted)
        .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
        .map(([date, tasks]) => `
            <div class="date-header">
                <i class="fas fa-calendar-check"></i> ${date}
            </div>
            ${renderTaskList(tasks)}
        `).join('');
    document.getElementById('completedTasksList').innerHTML = completedHtml || 
        '<div class="no-tasks">কোন কাজ নেই</div>';

    // Update task counts
    updateTaskCounts(todaysActiveTasks.length, unfinishedTasks.length, completedTasks.length);
}

// Update task counts in navigation
function updateTaskCounts(today, unfinished, completed) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems[0].querySelector('span').textContent = `আজকের (${today})`;
    navItems[1].querySelector('span').textContent = `অসম্পূর্ণ (${unfinished})`;
    navItems[2].querySelector('span').textContent = `সম্পন্ন (${completed})`;
}

// Render individual task list
function renderTaskList(tasks) {
    if (tasks.length === 0) {
        return '<div class="no-tasks">কোন কাজ নেই</div>';
    }

    return tasks.map(task => `
        <div class="task-item">
            <div class="task-info">
                <span class="subject ${task.subject.startsWith('custom_') ? 
                    'subject-' + task.subject : task.subject}">
                    ${getSubjectName(task.subject)}
                </span>
                <span class="priority priority-${task.priority}">
                    ${getPriorityName(task.priority)}
                </span>
                <h4>${task.title}</h4>
                <p>${task.description}</p>
                <small>
                    <i class="fas fa-clock"></i> 
                    ${formatDate(task.timestamp)}
                </small>
            </div>
            <div class="task-actions">
                <button onclick="editTask(${task.id})" class="btn" title="সম্পাদনা করুন">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="toggleTaskComplete(${task.id})" class="btn" 
                    title="${task.completed ? 'অসম্পূর্ণ করুন' : 'সম্পন্ন করুন'}">
                    ${task.completed ? 
                        '<i class="fas fa-undo"></i>' : 
                        '<i class="fas fa-check"></i>'}
                </button>
                <button onclick="showDeleteConfirmation(${task.id})" class="btn btn-delete" 
                    title="মুছে ফেলুন">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}
// Helper Functions
function getSubjectName(subject) {
    if (subject.startsWith('custom_')) {
        return customSubjects[subject]?.name || subject;
    }

    const defaultSubjects = {
        math: 'গণিত',
        bangla: 'বাংলা',
        english: 'ইংরেজি'
    };
    return defaultSubjects[subject] || subject;
}

function getPriorityName(priority) {
    const priorities = {
        high: 'উচ্চ',
        medium: 'মধ্যম',
        low: 'নিম্ন'
    };
    return priorities[priority] || priority;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    };
    return date.toLocaleDateString('bn-BD', options);
}

// Date Filter Functions
function filterByDate(date, section) {
    if (!date) {
        renderTasks();
        return;
    }

    const filterDate = new Date(date);
    filterDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(filterDate);
    nextDay.setDate(filterDate.getDate() + 1);

    let filteredTasks = tasks.filter(task => {
        const taskDate = new Date(task.timestamp);
        return taskDate >= filterDate && taskDate < nextDay;
    });

    if (section === 'unfinished') {
        filteredTasks = filteredTasks.filter(task => !task.completed);
        document.getElementById('upcomingTasksList').innerHTML = renderTaskList(filteredTasks);
    } else if (section === 'completed') {
        filteredTasks = filteredTasks.filter(task => task.completed);
        document.getElementById('completedTasksList').innerHTML = renderTaskList(filteredTasks);
    }
}

function clearDateFilter(filterId) {
    document.getElementById(filterId).value = '';
    renderTasks();
}

// Settings Management
function changeUsername() {
    const newUsername = document.getElementById('changeUsername').value.trim();
    if (newUsername) {
        localStorage.setItem('username', newUsername);
        document.getElementById('currentUser').textContent = newUsername;
        showToast('ব্যবহারকারীর নাম পরিবর্তন করা হয়েছে!', 'success');
    } else {
        showToast('অনুগ্রহ করে একটি বৈধ নাম দিন!', 'error');
    }
}

// Backup and Restore Functions
function backupData() {
    const backup = {
        tasks: tasks,
        customSubjects: customSubjects,
        username: localStorage.getItem('username'),
        theme: localStorage.getItem('theme'),
        timestamp: new Date().toISOString()
    };
    const backupString = JSON.stringify(backup, null, 2);
    document.getElementById('restoreData').value = backupString;
    showToast('ব্যাকআপ ডাটা তৈরি করা হয়েছে!', 'success');
}

function downloadBackup() {
    const backup = {
        tasks: tasks,
        customSubjects: customSubjects,
        username: localStorage.getItem('username'),
        theme: localStorage.getItem('theme'),
        timestamp: new Date().toISOString()
    };
    const backupString = JSON.stringify(backup, null, 2);
    const blob = new Blob([backupString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `homework_backup_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('ব্যাকআপ ফাইল ডাউনলোড করা হয়েছে!', 'success');
}

function restoreFromText() {
    try {
        const backupString = document.getElementById('restoreData').value;
        const backup = JSON.parse(backupString);
        restoreBackup(backup);
    } catch (e) {
        showToast('অবৈধ ব্যাকআপ ডাটা!', 'error');
    }
}

// File restore handler
document.getElementById('restoreFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const backup = JSON.parse(e.target.result);
                restoreBackup(backup);
            } catch (err) {
                showToast('অবৈধ ব্যাকআপ ফাইল!', 'error');
            }
        };
        reader.readAsText(file);
    }
});

function restoreBackup(backup) {
    if (!backup.tasks || !Array.isArray(backup.tasks)) {
        showToast('অবৈধ ব্যাকআপ ডাটা ফরম্যাট!', 'error');
        return;
    }

    // Restore tasks
    tasks = backup.tasks;
    localStorage.setItem('tasks', JSON.stringify(tasks));

    // Restore custom subjects
    if (backup.customSubjects) {
        customSubjects = backup.customSubjects;
        localStorage.setItem('customSubjects', JSON.stringify(customSubjects));
        
        // Recreate custom subject styles
        Object.entries(customSubjects).forEach(([id, subject]) => {
            addCustomSubjectStyle(id, subject.color);
        });
    }

    // Restore username
    if (backup.username) {
        localStorage.setItem('username', backup.username);
        document.getElementById('currentUser').textContent = backup.username;
        document.getElementById('changeUsername').value = backup.username;
    }

    // Restore theme
    if (backup.theme) {
        localStorage.setItem('theme', backup.theme);
        if (backup.theme === 'dark') {
            document.body.setAttribute('data-theme', 'dark');
            document.querySelector('.theme-toggle i').classList.replace('fa-moon', 'fa-sun');
        } else {
            document.body.removeAttribute('data-theme');
            document.querySelector('.theme-toggle i').classList.replace('fa-sun', 'fa-moon');
        }
    }

    renderTasks();
    showToast('ব্যাকআপ সফলভাবে পুনরুদ্ধার করা হয়েছে!', 'success');
}

// Navigation functionality
function showSection(sectionId, navItem) {
    document.querySelectorAll('.task-section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active-nav');
    });
    navItem.classList.add('active-nav');
}

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Set current date/time format
    updateDateTime();

    // Load username
    const savedUsername = localStorage.getItem('username') || 'SayfullahSayeb';
    document.getElementById('currentUser').textContent = savedUsername;
    document.getElementById('changeUsername').value = savedUsername;
    
    // Load theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        document.querySelector('.theme-toggle i').classList.replace('fa-moon', 'fa-sun');
    }

    // Load custom subjects
    Object.entries(customSubjects).forEach(([id, subject]) => {
        ['subject', 'editSubject'].forEach(selectId => {
            const select = document.getElementById(selectId);
            const option = new Option(subject.name, id);
            select.add(option);
        });
        addCustomSubjectStyle(id, subject.color);
    });

    // Show initial section and render tasks
    document.getElementById('todaysTasks').style.display = 'block';
    renderTasks();
});

// Auto-refresh tasks every minute
setInterval(() => {
    renderTasks();
    updateDateTime();
}, 60000);