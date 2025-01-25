// Global variables
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let customSubjects = JSON.parse(localStorage.getItem('customSubjects')) || {};

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

// Improved error handling and validation
class AppError extends Error {
    constructor(message, type = 'error') {
        super(message);
        this.type = type;
    }
}

// Task validation
function validateTask(task) {
    if (!task.title?.trim()) {
        throw new AppError('শিরোনাম খালি রাখা যাবে না!');
    }
    if (!task.subject) {
        throw new AppError('বিষয় নির্বাচন করুন!');
    }
    // Use sanitizer
    return {
        ...task,
        title: sanitizer.sanitize(task.title.trim()),
        description: sanitizer.sanitize(task.description?.trim() || '')
    };
}

// Enhanced initialization with offline support
async function initializeApp() {
    try {
        showLoading();
        hideAllSections();
        showDefaultSection();
        updateDateTime();
        loadUsername();
        loadTheme();
        loadCustomSubjects();
        renderTasks();

        // Start auto-update every minute
        setInterval(() => {
            updateDateTime();
            renderTasks();
        }, 60000);
        
        // Setup offline detection
        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
        updateOnlineStatus();
        
        // Setup scroll handling for nav
        setupScrollHandler();
    } catch (error) {
        handleError(error);
    } finally {
        hideLoading();
    }
}

function updateOnlineStatus() {
    const offlineAlert = document.getElementById('offlineAlert');
    if (navigator.onLine) {
        offlineAlert.classList.add('hidden');
    } else {
        offlineAlert.classList.remove('hidden');
    }
}

// Date and Time Functions
function updateDateTime() {
    const now = new Date();
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    
    // Format: YYYY-MM-DD HH:MM:SS
    const formattedDate = now.toLocaleString('en-US', options)
        .replace(/(\d+)\/(\d+)\/(\d+),\s/, '$3-$1-$2 ');
    
    document.getElementById('currentDateTime').textContent = formattedDate;
}

function formatDateForDisplay(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('bn-BD', {
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

// User Functions
function loadUsername() {
    const savedUsername = localStorage.getItem('username') || 'SayfullahSayeb';
    document.getElementById('currentUser').textContent = savedUsername;
    document.getElementById('changeUsername').value = savedUsername;
}

function changeUsername() {
    const newUsername = document.getElementById('changeUsername').value.trim();
    if (!newUsername) {
        showToast('অনুগ্রহ করে একটি বৈধ নাম দিন!', 'error');
        return;
    }
    localStorage.setItem('username', newUsername);
    document.getElementById('currentUser').textContent = newUsername;
    showToast('ব্যবহারকারীর নাম পরিবর্তন করা হয়েছে!', 'success');
}

// Theme Functions
function toggleTheme() {
    const body = document.body;
    const themeToggle = document.querySelector('.theme-toggle i');
    const currentTheme = body.getAttribute('data-theme');

    if (currentTheme === 'dark') {
        body.removeAttribute('data-theme');
        themeToggle.classList.replace('fa-sun', 'fa-moon');
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        themeToggle.classList.replace('fa-moon', 'fa-sun');
        localStorage.setItem('theme', 'dark');
    }
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        document.querySelector('.theme-toggle i').classList.replace('fa-moon', 'fa-sun');
    }
}

// Subject Management
function loadCustomSubjects() {
    ['subject', 'editSubject'].forEach(selectId => {
        const select = document.getElementById(selectId);
        if (!select) return;

        // Clear existing custom options
        Array.from(select.options).forEach(option => {
            if (option.value.startsWith('custom_')) {
                select.removeChild(option);
            }
        });

        // Add custom subjects
        Object.entries(customSubjects).forEach(([subjectId, subject]) => {
            const option = new Option(subject.name, subjectId);
            select.add(option);
            
            // Add or update CSS for custom subjects
            addCustomSubjectStyle(subjectId, subject.color);
        });
    });

    renderSubjectsTable();
}

function handleSubjectSelect(selectElement, mode = 'add') {
    const prefix = mode === 'edit' ? 'edit' : '';
    const customDiv = document.getElementById(`${prefix}CustomSubjectDiv`);
    
    if (customDiv) {
        customDiv.style.display = selectElement.value === 'custom' ? 'block' : 'none';
    }
}

function addCustomSubject(mode = 'add') {
    const prefix = mode === 'edit' ? 'edit' : '';
    const subjectInput = document.getElementById(`${prefix}CustomSubject`);
    const colorInput = document.getElementById(`${prefix}SubjectColor`);
    const selectElement = document.getElementById(`${prefix}subject`);

    if (!subjectInput || !colorInput || !selectElement) {
        showToast('ফর্ম এলিমেন্ট পাওয়া যায়নি!', 'error');
        return;
    }

    const subjectName = subjectInput.value.trim();
    const subjectColor = colorInput.value;

    if (!subjectName) {
        showToast('বিষয়ের নাম দিন!', 'error');
        return;
    }

    const subjectId = 'custom_' + subjectName.toLowerCase().replace(/\s+/g, '_');
    
    if (customSubjects[subjectId]) {
        showToast('এই বিষয়টি ইতিমধ্যে বিদ্যমান!', 'error');
        return;
    }

    customSubjects[subjectId] = {
        name: subjectName,
        color: subjectColor
    };

    localStorage.setItem('customSubjects', JSON.stringify(customSubjects));

    // Add to select elements and update CSS
    loadCustomSubjects();

    // Select the new subject
    selectElement.value = subjectId;

    // Hide custom subject div
    document.getElementById(`${prefix}CustomSubjectDiv`).style.display = 'none';

    // Clear inputs
    subjectInput.value = '';
    colorInput.value = '#4ecdc4';

    showToast('নতুন বিষয় যোগ করা হয়েছে!', 'success');
}

function addCustomSubjectStyle(subjectId, color) {
    const existingStyle = document.querySelector(`style[data-subject="${subjectId}"]`);
    if (existingStyle) {
        existingStyle.remove();
    }

    const style = document.createElement('style');
    style.setAttribute('data-subject', subjectId);
    style.textContent = `.subject-${subjectId} { background-color: ${color} !important; color: white; }`;
    document.head.appendChild(style);
}

// Task Management
async function addTask(event) {
    event.preventDefault();
    const submitBtn = event.target.querySelector('button[type="submit"]');
    
    try {
        submitBtn.classList.add('loading');
        const task = {
            id: Date.now(),
            subject: document.getElementById('subject').value,
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            priority: document.getElementById('priority').value,
            timestamp: new Date().toISOString(),
            completed: false
        };
        
        const validatedTask = validateTask(task);
        tasks.push(validatedTask);
        await saveTasksToStorage();
        
        closeModal();
        renderTasks();
        showToast('নতুন কাজ যোগ করা হয়েছে!', 'success');
    } catch (error) {
        handleError(error);
    } finally {
        submitBtn.classList.remove('loading');
    }
}

function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    document.getElementById('editTaskId').value = task.id;
    document.getElementById('editSubject').value = task.subject;
    document.getElementById('editTitle').value = task.title;
    document.getElementById('editDescription').value = task.description;
    document.getElementById('editPriority').value = task.priority;
    
    document.getElementById('editTaskModal').style.display = 'block';
}

function updateTask(event) {
    event.preventDefault();
    const taskId = parseInt(document.getElementById('editTaskId').value);
    const subject = document.getElementById('editSubject').value;

    if (!subject) {
        showToast('বিষয় নির্বাচন করুন!', 'error');
        return;
    }

    tasks = tasks.map(task => {
        if (task.id === taskId) {
            return {
                ...task,
                subject: subject,
                title: document.getElementById('editTitle').value,
                description: document.getElementById('editDescription').value || '',
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

function toggleTaskComplete(taskId) {
    const now = new Date().toISOString();
    tasks = tasks.map(task => {
        if (task.id === taskId) {
            return {
                ...task,
                completed: !task.completed,
                timestamp: !task.completed ? now : task.timestamp
            };
        }
        return task;
    });

    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
    
    const task = tasks.find(t => t.id === taskId);
    showToast(
        task.completed ? 'কাজটি সম্পন্ন করা হয়েছে!' : 'কাজটি পুনরায় অসম্পূর্ণ করা হয়েছে!',
        'success'
    );
}

function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
    showToast('কাজটি মুছে ফেলা হয়েছে!', 'success');
}

// Render Functions
function renderTasks() {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000);

    // Filter tasks
    const todaysActiveTasks = tasks.filter(task => 
        !task.completed && new Date(task.timestamp) > twentyFourHoursAgo);
    
    const todaysCompletedTasks = tasks.filter(task => 
        task.completed && new Date(task.timestamp) > twentyFourHoursAgo);
    
    const unfinishedTasks = tasks.filter(task => 
        !task.completed && new Date(task.timestamp) <= twentyFourHoursAgo);
    
    const completedTasks = tasks.filter(task => 
        task.completed && new Date(task.timestamp) <= twentyFourHoursAgo);

    // Render each section
    renderTodaysTasks(todaysActiveTasks, todaysCompletedTasks);
    renderUnfinishedTasks(unfinishedTasks);
    renderCompletedTasks(completedTasks);

    // Update counts
    updateTaskCounts(todaysActiveTasks.length, unfinishedTasks.length, completedTasks.length);
}

function renderTodaysTasks(activeTasks, completedTasks) {
    let html = renderTaskList(activeTasks);
    
    if (completedTasks.length > 0) {
        html += `
            <div class="completed-tasks-section">
                <h3><i class="fas fa-check-circle"></i> আজকের সম্পন্ন কাজ</h3>
                ${renderTaskList(completedTasks)}
            </div>
        `;
    }
    
    document.getElementById('todaysTasksList').innerHTML = html || 
        '<div class="no-tasks">কোন কাজ নেই</div>';
}

function renderUnfinishedTasks(tasks) {
    const groupedTasks = groupTasksByDate(tasks);
    renderGroupedTasks('upcomingTasksList', groupedTasks);
}

function renderCompletedTasks(tasks) {
    const groupedTasks = groupTasksByDate(tasks);
    renderGroupedTasks('completedTasksList', groupedTasks);
}

function renderGroupedTasks(containerId, groupedTasks) {
    const html = Object.entries(groupedTasks)
        .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
        .map(([date, tasks]) => `
            <div class="date-group">
                <h3 class="date-header">
                    <i class="fas fa-calendar-day"></i> ${date}
                </h3>
                ${renderTaskList(tasks)}
            </div>
        `).join('');

    document.getElementById(containerId).innerHTML = html || 
        '<div class="no-tasks">কোন কাজ নেই</div>';
}

function renderTaskList(tasks) {
    if (!tasks.length) return '';

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
                ${task.description ? `<p>${task.description}</p>` : ''}
                <small>
                    <i class="fas fa-clock"></i> 
                    ${formatDateForDisplay(task.timestamp)}
                </small>
            </div>
            <div class="task-actions">
                <button onclick="editTask(${task.id})" class="btn btn-sm" 
                        title="সম্পাদনা করুন">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="toggleTaskComplete(${task.id})" class="btn btn-sm"
                        title="${task.completed ? 'অসম্পূর্ণ করুন' : 'সম্পন্ন করুন'}">
                    <i class="fas fa-${task.completed ? 'undo' : 'check'}"></i>
                </button>
                <button onclick="showDeleteConfirmation(${task.id})" class="btn btn-sm btn-danger"
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
    return {
        high: 'উচ্চ',
        medium: 'মধ্যম',
        low: 'নিম্ন'
    }[priority] || priority;
}

function groupTasksByDate(tasks) {
    const grouped = {};
    tasks.forEach(task => {
        const date = new Date(task.timestamp);
        const dateKey = date.toLocaleDateString('bn-BD', {
            month: 'long',
            day: 'numeric'
        });
        if (!grouped[dateKey]) {
            grouped[dateKey] = [];
        }
        grouped[dateKey].push(task);
    });
    return grouped;
}

// Navigation Functions
function hideAllSections() {
    document.querySelectorAll('.task-section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById('todaysTasks').style.display = 'block';
}

function showSection(sectionId, navItem) {
    // Hide all sections
    document.querySelectorAll('.task-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show selected section
    document.getElementById(sectionId).style.display = 'block';
    
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active-nav');
    });
    navItem.classList.add('active-nav');

    // If settings section, render subjects table
    if (sectionId === 'settings') {
        renderSubjectsTable();
    }
}

function updateTaskCounts(today, unfinished, completed) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems[0].querySelector('span').textContent = `আজকের (${today})`;
    navItems[1].querySelector('span').textContent = `অসম্পূর্ণ (${unfinished})`;
    navItems[2].querySelector('span').textContent = `সম্পন্ন (${completed})`;
}

// Modal Functions
function openModal() {
    document.getElementById('addTaskModal').style.display = 'block';
    document.getElementById('customSubjectDiv').style.display = 'none';
    document.getElementById('subject').value = '';
    document.getElementById('title').value = '';
    document.getElementById('description').value = '';
    document.getElementById('priority').value = 'high';
}

function closeModal() {
    document.getElementById('addTaskModal').style.display = 'none';
    document.getElementById('addTaskForm').reset();
}

function closeEditModal() {
    document.getElementById('editTaskModal').style.display = 'none';
    document.getElementById('editTaskForm').reset();
}

// Delete Confirmation
function showDeleteConfirmation(taskId) {
    const confirmDialog = document.createElement('div');
    confirmDialog.className = 'modal';
    confirmDialog.innerHTML = `
        <div class="modal-content modal-sm">
            <div class="modal-header">
                <h3>নিশ্চিতকরণ</h3>
                <button class="close-btn" onclick="closeDeleteConfirmation()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <p>আপনি কি নিশ্চিত যে আপনি এই কাজটি মুছে ফেলতে চান?</p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeDeleteConfirmation()">
                    <i class="fas fa-times"></i>
                    <span>না</span>
                </button>
                <button class="btn btn-danger" onclick="confirmDelete(${taskId})">
                    <i class="fas fa-trash"></i>
                    <span>হ্যাঁ, মুছে ফেলুন</span>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(confirmDialog);
    confirmDialog.style.display = 'block';
}

function closeDeleteConfirmation() {
    const confirmDialog = document.querySelector('.modal');
    if (confirmDialog) {
        confirmDialog.remove();
    }
}

function confirmDelete(taskId) {
    deleteTask(taskId);
    closeDeleteConfirmation();
}

// Filter Functions
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
        document.getElementById('upcomingTasksList').innerHTML = 
            renderTaskList(filteredTasks) || '<div class="no-tasks">কোন কাজ নেই</div>';
    } else if (section === 'completed') {
        filteredTasks = filteredTasks.filter(task => task.completed);
        document.getElementById('completedTasksList').innerHTML = 
            renderTaskList(filteredTasks) || '<div class="no-tasks">কোন কাজ নেই</div>';
    }
}

function clearDateFilter(filterId) {
    document.getElementById(filterId).value = '';
    renderTasks();
}

// Toast Notifications
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    }[type] || 'fa-info-circle';

    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;

    const container = document.getElementById('toastContainer');
    if (!container) {
        const newContainer = document.createElement('div');
        newContainer.id = 'toastContainer';
        newContainer.className = 'toast-container';
        document.body.appendChild(newContainer);
    }

    document.getElementById('toastContainer').appendChild(toast);

    setTimeout(() => {
        toast.remove();
        if (document.getElementById('toastContainer').children.length === 0) {
            document.getElementById('toastContainer').remove();
        }
    }, 3000);
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
    document.getElementById('restoreData').value = JSON.stringify(backup, null, 2);
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

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
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

// Initialize file input listener
document.getElementById('restoreFile')?.addEventListener('change', function(e) {
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

function restoreFromText() {
    try {
        const backup = JSON.parse(document.getElementById('restoreData').value);
        restoreBackup(backup);
    } catch (e) {
        showToast('অবৈধ ব্যাকআপ ডাটা!', 'error');
    }
}

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
        loadCustomSubjects();
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

// Improved storage handling
async function saveTasksToStorage() {
    try {
        await localStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
        throw new AppError('ডাটা সংরক্ষণ করা যায়নি! স্টোরেজ স্পেস শেষ হয়ে গেছে।');
    }
}

// Error handling
function handleError(error) {
    console.error(error);
    showToast(
        error instanceof AppError ? error.message : 'একটি ত্রুটি ঘটেছে!',
        error instanceof AppError ? error.type : 'error'
    );
}

// Loading state management
function showLoading() {
    document.body.classList.add('loading');
}

function hideLoading() {
    document.body.classList.remove('loading');
}

// Scroll handling for navigation
function setupScrollHandler() {
    let lastScroll = 0;
    const nav = document.querySelector('.mobile-nav');
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > lastScroll && currentScroll > 100) {
            nav.classList.add('hidden');
        } else {
            nav.classList.remove('hidden');
        }
        lastScroll = currentScroll;
    });
}

// Add after initializeApp function
function showDefaultSection() {
    document.querySelectorAll('.task-section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById('todaysTasks').style.display = 'block';
    document.querySelector('.nav-item').classList.add('active-nav');
}

// Add before renderTasks function
function renderSubjectsTable() {
    const tableBody = document.getElementById('subjectsTableBody');
    if (!tableBody) return;

    let html = '';
    // Add default subjects
    const defaultSubjects = {
        math: { name: 'গণিত', color: getComputedStyle(document.documentElement).getPropertyValue('--danger').trim() },
        bangla: { name: 'বাংলা', color: getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() },
        english: { name: 'ইংরেজি', color: getComputedStyle(document.documentElement).getPropertyValue('--info').trim() }
    };

    // Combine default and custom subjects
    const allSubjects = { ...defaultSubjects, ...customSubjects };

    Object.entries(allSubjects).forEach(([id, subject]) => {
        html += `
            <tr>
                <td>${subject.name}</td>
                <td>
                    <span class="color-preview" style="background-color: ${subject.color}"></span>
                </td>
                <td>
                    ${!['math', 'bangla', 'english'].includes(id) ? `
                        <button onclick="editSubject('${id}')" class="btn btn-sm">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteSubject('${id}')" class="btn btn-sm btn-danger">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : '(Default)'}
                </td>
            </tr>
        `;
    });

    tableBody.innerHTML = html;
}

// Add basic sanitizer as DOMPurify fallback
const sanitizer = {
    sanitize: (str) => {
        if (typeof DOMPurify !== 'undefined') {
            return DOMPurify.sanitize(str);
        }
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
};