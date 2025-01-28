let searchTimer;
let completedTasks = [];

function getCompletedTasks() {
    return Storage.getTasks().filter(task => task.completed);
}

function updateStats() {
    const timeRange = parseInt(document.getElementById('statsTimeRange').value);
    const now = new Date();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - (timeRange || Infinity));

    const tasks = completedTasks.filter(task => 
        timeRange === 0 || new Date(task.completedAt) > cutoffDate
    );

    // Calculate statistics
    const onTime = tasks.filter(task => {
        const dueDateTime = new Date(`${task.dueDate} ${task.dueTime}`);
        const completedDateTime = new Date(task.completedAt);
        return completedDateTime <= dueDateTime;
    }).length;

    // Update stats display
    document.getElementById('totalCompleted').textContent = toBanglaNumber(tasks.length.toString());
    document.getElementById('onTimeCompleted').textContent = toBanglaNumber(onTime.toString());
    document.getElementById('lateCompleted').textContent = toBanglaNumber((tasks.length - onTime).toString());

    // Update subject stats
    updateSubjectStats(tasks);
}

function updateSubjectStats(tasks) {
    const subjectCounts = {};
    tasks.forEach(task => {
        subjectCounts[task.subject] = (subjectCounts[task.subject] || 0) + 1;
    });

    const subjectStatsContainer = document.getElementById('subjectStats');
    subjectStatsContainer.innerHTML = '';

    const maxCount = Math.max(...Object.values(subjectCounts));

    Object.entries(subjectCounts)
        .sort(([,a], [,b]) => b - a)
        .forEach(([subject, count]) => {
            const percentage = (count / maxCount) * 100;
            
            const subjectBar = document.createElement('div');
            subjectBar.className = 'subject-bar';
            subjectBar.innerHTML = `
                <span class="subject-name">${subject}</span>
                <div class="subject-progress">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
                <span class="subject-count">${toBanglaNumber(count.toString())}</span>
            `;
            
            subjectStatsContainer.appendChild(subjectBar);
        });
}

function handleSearch() {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(filterTasks, 300);
}

function filterTasks() {
    const searchTerm = document.getElementById('searchTasks').value.toLowerCase();
    const subject = document.getElementById('filterSubject').value;
    const timeframe = document.getElementById('filterTimeframe').value;

    let filteredTasks = completedTasks;

    // Apply search filter
    if (searchTerm) {
        filteredTasks = filteredTasks.filter(task =>
            task.title.toLowerCase().includes(searchTerm) ||
            task.description?.toLowerCase().includes(searchTerm)
        );
    }

    // Apply subject filter
    if (subject) {
        filteredTasks = filteredTasks.filter(task => task.subject === subject);
    }

    // Apply timeframe filter
    const now = new Date();
    switch (timeframe) {
        case 'today':
            filteredTasks = filteredTasks.filter(task => {
                const completedDate = new Date(task.completedAt);
                return completedDate.toDateString() === now.toDateString();
            });
            break;
        case 'week':
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            filteredTasks = filteredTasks.filter(task => 
                new Date(task.completedAt) > weekAgo
            );
            break;
        case 'month':
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            filteredTasks = filteredTasks.filter(task => 
                new Date(task.completedAt) > monthAgo
            );
            break;
    }

    renderTasks(filteredTasks);
}

function renderTasks(tasks) {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    // Group tasks by completion date
    const groupedTasks = {};
    tasks.forEach(task => {
        const date = new Date(task.completedAt).toDateString();
        if (!groupedTasks[date]) {
            groupedTasks[date] = [];
        }
        groupedTasks[date].push(task);
    });

    // Render task groups
    Object.entries(groupedTasks)
        .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
        .forEach(([date, tasks]) => {
            const group = document.createElement('div');
            group.className = 'completion-group';
            
            const dateHeader = document.createElement('div');
            dateHeader.className = 'completion-date';
            dateHeader.innerHTML = `
                <span>${formatCompletionDate(date)}</span>
                <span>${toBanglaNumber(tasks.length.toString())} টি কাজ</span>
            `;
            
            const tasksList = document.createElement('div');
            tasksList.className = 'tasks-list';
            
            tasks.forEach(task => {
                const taskElement = createCompletedTaskElement(task);
                tasksList.appendChild(taskElement);
            });
            
            group.appendChild(dateHeader);
            group.appendChild(tasksList);
            taskList.appendChild(group);
        });
}

function formatCompletionDate(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return 'আজ';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'গতকাল';
    } else {
        return formatTimeToBangla(date).split('|')[0];
    }
}

function createCompletedTaskElement(task) {
    const dueDateTime = new Date(`${task.dueDate} ${task.dueTime}`);
    const completedDateTime = new Date(task.completedAt);
    const isOnTime = completedDateTime <= dueDateTime;
    
    const element = document.createElement('div');
    element.className = 'task-item';
    element.innerHTML = `
        <div class="completion-status ${isOnTime ? 'on-time' : 'late'}">
            <i class="bi ${isOnTime ? 'bi-check-lg' : 'bi-clock-history'}"></i>
        </div>
        <div class="task-content">
            <div class="task-title">${task.title}</div>
            <div class="task-meta">
                <span><i class="bi bi-bookmark"></i> ${task.subject}</span>
                <span><i class="bi bi-calendar2"></i> 
                    শেষ করার সময়ছিল: ${formatTaskDueTime(task.dueDate, task.dueTime)}
                </span>
            </div>
        </div>
        <div class="completion-time">
            শেষ করেছেন:<br>
            ${formatCompletionTime(task.completedAt)}
        </div>
    `;
    return element;
}

function formatTaskDueTime(date, time) {
    const datetime = new Date(`${date} ${time}`);
    const hours = datetime.getHours();
    const minutes = datetime.getMinutes();
    return `${toBanglaNumber(hours.toString().padStart(2, '0'))}:${toBanglaNumber(minutes.toString().padStart(2, '0'))}`;
}

function formatCompletionTime(timestamp) {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${toBanglaNumber(hours.toString().padStart(2, '0'))}:${toBanglaNumber(minutes.toString().padStart(2, '0'))}`;
}

function populateSubjectFilter() {
    const subjects = [...new Set(completedTasks.map(task => task.subject))];
    const filterSelect = document.getElementById('filterSubject');
    
    subjects.sort().forEach(subject => {
        const option = document.createElement('option');
        option.value = subject;
        option.textContent = subject;
        filterSelect.appendChild(option);
    });
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    completedTasks = getCompletedTasks();
    updateStats();
    populateSubjectFilter();
    filterTasks();
});

document.addEventListener('DOMContentLoaded', () => {
    const userName = localStorage.getItem('userName') || '';
    document.getElementById('userLogin').textContent = userName;

});