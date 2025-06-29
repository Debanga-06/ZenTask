// SmartTask - Personal Task Manager with Firebase Integration
// Main JavaScript file for task management functionality

// Import Firebase task service functions
import { addTask, getTasks, updateTask, deleteTask } from './taskService.js';

class SmartTask {
    constructor() {
      this.tasks = [];
      this.currentFilter = 'all';
      this.currentEditId = null;
      this.chart = null;
      this.isLoading = false;
      
      this.init();
    }
  
    async init() {
      this.bindEvents();
      this.loadTheme();
      await this.loadTasksFromFirebase(); // Load from Firebase instead of localStorage
      this.updateStats();
      this.initChart();
      this.checkReminders();
      
      // Check for reminders every minute
      setInterval(() => this.checkReminders(), 60000);
    }
  
    bindEvents() {
      // Theme toggle
      document.getElementById('themeToggle').addEventListener('click', () => {
        this.toggleTheme();
      });
  
      // Task form submission
      document.getElementById('taskForm').addEventListener('submit', (e) => {
        e.preventDefault();
        this.addNewTask(); // Updated method name to match Firebase pattern
      });
  
      // Edit task form submission
      document.getElementById('editTaskForm').addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveEditTask();
      });
  
      // Filter buttons
      document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          this.setFilter(e.target.dataset.filter);
        });
      });
  
      // Search functionality
      document.getElementById('searchTasks').addEventListener('input', (e) => {
        this.searchTasks(e.target.value);
      });
  
      // Modal close events
      document.querySelector('.modal-close').addEventListener('click', () => {
        this.closeModal();
      });
  
      document.getElementById('cancelEdit').addEventListener('click', () => {
        this.closeModal();
      });
  
      // Close modal when clicking outside
      document.getElementById('taskModal').addEventListener('click', (e) => {
        if (e.target.id === 'taskModal') {
          this.closeModal();
        }
      });
  
      // Keyboard shortcuts
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.closeModal();
        }
      });
    }
  
    // Loading state management
    setLoading(loading) {
      this.isLoading = loading;
      const addBtn = document.querySelector('#taskForm button[type="submit"]');
      const editBtn = document.querySelector('#editTaskForm button[type="submit"]');
      
      if (addBtn) {
        addBtn.disabled = loading;
        addBtn.textContent = loading ? 'Adding...' : 'Add Task';
      }
      
      if (editBtn) {
        editBtn.disabled = loading;
        editBtn.textContent = loading ? 'Saving...' : 'Save Changes';
      }
      
      // Show loading indicator in task list if needed
      if (loading && this.tasks.length === 0) {
        const taskList = document.getElementById('taskList');
        taskList.innerHTML = '<div class="loading-indicator">Loading tasks...</div>';
      }
    }
  
    // Firebase Integration Methods
    
    // Add task function (matches Firebase integration example)
    async addNewTask() {
      const title = document.getElementById('taskTitle').value.trim();
      const description = document.getElementById('taskDescription').value.trim();
      const dueDate = document.getElementById('taskDueDate').value;
      const priority = document.getElementById('taskPriority').value;
  
      if (!title) {
        this.showNotification('Please enter a task title', 'error');
        return;
      }

      if (this.isLoading) return;
      
      this.setLoading(true);
      
      try {
        // Save to Firebase instead of just local storage/memory
        await addTask({
          title,
          description,
          dueDate,
          priority,
          completed: false,
          createdAt: new Date().toISOString(),
          completedAt: null,
          notifiedToday: false
        });
        
        this.clearForm();
        await this.loadTasksFromFirebase(); // Load updated tasks
        this.showNotification('Task added successfully!', 'success');
      } catch (error) {
        console.error('Failed to add task:', error);
        this.showNotification('Failed to add task. Please try again.', 'error');
      } finally {
        this.setLoading(false);
      }
    }

    // Load tasks from Firebase (matches Firebase integration example)
    async loadTasksFromFirebase() {
      if (this.isLoading) return;
      
      this.setLoading(true);
      
      try {
        const tasks = await getTasks();
        this.tasks = tasks; // Update local tasks array
        this.renderTasks(); // Use existing display function
        this.updateStats();
        this.updateChart();
      } catch (error) {
        console.error('Failed to load tasks:', error);
        this.showNotification('Failed to load tasks. Please refresh the page.', 'error');
      } finally {
        this.setLoading(false);
      }
    }

    // Toggle task completion (matches Firebase integration example)
    async toggleTaskComplete(taskId, currentStatus) {
      try {
        const updateData = { 
          completed: !currentStatus,
          completedAt: !currentStatus ? new Date().toISOString() : null
        };
        
        await updateTask(taskId, updateData);
        await this.loadTasksFromFirebase(); // Refresh the display
        
        const message = !currentStatus ? 'Task completed! 🎉' : 'Task marked as pending';
        this.showNotification(message, 'success');
      } catch (error) {
        console.error('Failed to update task:', error);
        this.showNotification('Failed to update task. Please try again.', 'error');
      }
    }

    // Delete task (matches Firebase integration example)
    async deleteTaskById(taskId) {
      if (!confirm('Are you sure you want to delete this task?')) return;
      
      try {
        await deleteTask(taskId);
        await this.loadTasksFromFirebase(); // Refresh the display
        this.showNotification('Task deleted successfully!', 'success');
      } catch (error) {
        console.error('Failed to delete task:', error);
        this.showNotification('Failed to delete task. Please try again.', 'error');
      }
    }
  
    // Updated Task Management Methods
    
    async editTask(id) {
      const task = this.tasks.find(t => t.id === id);
      if (!task) return;

      this.currentEditId = id;
      
      // Populate edit form
      document.getElementById('editTaskTitle').value = task.title;
      document.getElementById('editTaskDescription').value = task.description || '';
      document.getElementById('editTaskDueDate').value = task.dueDate || '';
      document.getElementById('editTaskPriority').value = task.priority;

      // Show modal
      document.getElementById('taskModal').classList.add('show');
    }

    async saveEditTask() {
      const title = document.getElementById('editTaskTitle').value.trim();
      const description = document.getElementById('editTaskDescription').value.trim();
      const dueDate = document.getElementById('editTaskDueDate').value;
      const priority = document.getElementById('editTaskPriority').value;

      if (!title) {
        this.showNotification('Please enter a task title', 'error');
        return;
      }

      if (this.isLoading) return;
      
      this.setLoading(true);

      try {
        await updateTask(this.currentEditId, {
          title,
          description,
          dueDate,
          priority
        });

        await this.loadTasksFromFirebase();
        this.closeModal();
        this.showNotification('Task updated successfully!', 'success');
      } catch (error) {
        console.error('Failed to update task:', error);
        this.showNotification('Failed to update task. Please try again.', 'error');
      } finally {
        this.setLoading(false);
      }
    }

    // Wrapper methods to maintain compatibility with existing HTML onclick handlers
    async deleteTask(id) {
      await this.deleteTaskById(id);
    }

    async toggleTask(id) {
      const task = this.tasks.find(t => t.id === id);
      if (!task) return;
      
      await this.toggleTaskComplete(id, task.completed);
    }
  
    // Filtering and Search (unchanged)
    setFilter(filter) {
      this.currentFilter = filter;
      
      // Update active filter button
      document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
      
      this.renderTasks();
    }
  
    searchTasks(query) {
      this.renderTasks(query);
    }
  
    getFilteredTasks(searchQuery = '') {
      let filtered = [...this.tasks];

      // Apply filter
      switch (this.currentFilter) {
        case 'completed':
          filtered = filtered.filter(t => t.completed);
          break;
        case 'pending':
          filtered = filtered.filter(t => !t.completed);
          break;
        case 'overdue':
          filtered = filtered.filter(t => !t.completed && this.isOverdue(t));
          break;
      }

      // Apply search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(t => 
          t.title.toLowerCase().includes(query) ||
          (t.description && t.description.toLowerCase().includes(query))
        );
      }

      return filtered;
    }
  
    // Rendering (unchanged)
    renderTasks(searchQuery = '') {
      const taskList = document.getElementById('taskList');
      const emptyState = document.getElementById('emptyState');
      const filteredTasks = this.getFilteredTasks(searchQuery);

      if (filteredTasks.length === 0) {
        taskList.style.display = 'none';
        emptyState.style.display = 'block';
        return;
      }

      taskList.style.display = 'flex';
      emptyState.style.display = 'none';

      taskList.innerHTML = filteredTasks.map(task => this.createTaskHTML(task)).join('');

      // Bind task-specific events
      this.bindTaskEvents();
    }
  
    createTaskHTML(task) {
      const isOverdue = !task.completed && this.isOverdue(task);
      const dueDateFormatted = task.dueDate ? this.formatDate(task.dueDate) : '';
      
      return `
        <div class="task-item ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}" data-id="${task.id}">
          <div class="task-header">
            <div class="task-main">
              <div class="task-title-row" style="display: flex; align-items: flex-start; gap: var(--spacing-sm);">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                       onchange="smartTask.toggleTask('${task.id}')">
                <div style="flex: 1;">
                  <h3 class="task-title">${this.escapeHtml(task.title)}</h3>
                  ${task.description ? `<p class="task-description">${this.escapeHtml(task.description)}</p>` : ''}
                  <div class="task-meta">
                    <span class="task-priority priority-${task.priority}">
                      ${this.getPriorityIcon(task.priority)} ${task.priority}
                    </span>
                    ${task.dueDate ? `
                      <span class="task-due-date">
                        📅 ${dueDateFormatted}
                        ${isOverdue ? '<span style="color: var(--danger-color); font-weight: 500;">Overdue</span>' : ''}
                      </span>
                    ` : ''}
                    <span class="task-created">
                      Created ${this.getRelativeTime(task.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div class="task-actions">
              <button class="btn btn-small btn-secondary" onclick="smartTask.editTask('${task.id}')" title="Edit task">
                ✏️
              </button>
              <button class="btn btn-small btn-danger" onclick="smartTask.deleteTask('${task.id}')" title="Delete task">
                🗑️
              </button>
            </div>
          </div>
        </div>
      `;
    }
  
    bindTaskEvents() {
      // Additional task-specific event binding if needed
      // Currently, events are handled via onclick attributes for simplicity
    }
  
    // Statistics (unchanged)
    updateStats() {
      const total = this.tasks.length;
      const completed = this.tasks.filter(t => t.completed).length;
      const pending = total - completed;
      const overdue = this.tasks.filter(t => !t.completed && this.isOverdue(t)).length;

      document.getElementById('totalTasks').textContent = total;
      document.getElementById('completedTasks').textContent = completed;
      document.getElementById('pendingTasks').textContent = pending;
      document.getElementById('overdueTasks').textContent = overdue;
    }
  
    // Chart Management (unchanged)
    initChart() {
      const canvas = document.getElementById('productivityChart');
      const ctx = canvas.getContext('2d');
      this.chart = new ProductivityChart(ctx);
      this.updateChart();
    }
  
    updateChart() {
      if (!this.chart) return;

      const completed = this.tasks.filter(t => t.completed).length;
      const pending = this.tasks.filter(t => !t.completed && !this.isOverdue(t)).length;
      const overdue = this.tasks.filter(t => !t.completed && this.isOverdue(t)).length;

      this.chart.updateData({
        completed,
        pending,
        overdue
      });
    }
  
    // Utility Functions (unchanged)
    isOverdue(task) {
      if (!task.dueDate || task.completed) return false;
      return new Date(task.dueDate) < new Date().setHours(0, 0, 0, 0);
    }
  
    formatDate(dateStr) {
      const date = new Date(dateStr);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      if (date.toDateString() === today.toDateString()) {
        return 'Today';
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
      } else {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        });
      }
    }
  
    getRelativeTime(dateStr) {
      const date = new Date(dateStr);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);

      if (diffInSeconds < 60) return 'just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
      return date.toLocaleDateString();
    }
  
    getPriorityIcon(priority) {
      switch (priority) {
        case 'high': return '🔴';
        case 'medium': return '🟡';
        case 'low': return '🟢';
        default: return '⚪';
      }
    }
  
    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  
    // Theme Management (unchanged)
    toggleTheme() {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      
      // Update theme toggle icon
      const themeIcon = document.querySelector('.theme-icon');
      themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
      
      this.showNotification(`Switched to ${newTheme} mode`, 'success');
    }
  
    loadTheme() {
      const savedTheme = localStorage.getItem('theme') || 'light';
      document.documentElement.setAttribute('data-theme', savedTheme);
      
      const themeIcon = document.querySelector('.theme-icon');
      themeIcon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }
  
    // Data Persistence - Updated to use Firebase instead of localStorage
    // Note: These methods are now handled by Firebase service functions
    // Keeping them for compatibility but they no longer use localStorage
    
    saveTasks() {
      // This method is now handled by individual Firebase operations
      // (addTask, updateTask, deleteTask) so this is essentially a no-op
      console.log('saveTasks called - now handled by Firebase operations');
    }
  
    loadTasks() {
      // This method is replaced by loadTasksFromFirebase()
      // Keeping for compatibility
      console.log('loadTasks called - use loadTasksFromFirebase() instead');
      return this.tasks;
    }
  
    // Form Management (unchanged)
    clearForm() {
      document.getElementById('taskForm').reset();
      // Set today as default due date
      const today = new Date().toISOString().split('T')[0];
      document.getElementById('taskDueDate').value = today;
    }
  
    closeModal() {
      document.getElementById('taskModal').classList.remove('show');
      this.currentEditId = null;
    }
  
    // Notifications (unchanged)
    showNotification(message, type = 'success') {
      const container = document.getElementById('notificationContainer');
      const notification = document.createElement('div');
      notification.className = `notification ${type}`;
      
      const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : '⚠️';
      notification.innerHTML = `
        <span>${icon}</span>
        <span>${message}</span>
      `;
      
      container.appendChild(notification);
      
      // Auto remove after 3 seconds
      setTimeout(() => {
        notification.remove();
      }, 3000);
    }
  
    // Reminders (updated to work with Firebase tasks)
    async checkReminders() {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      
      const todayTasks = this.tasks.filter(task => 
        task.dueDate === todayStr && 
        !task.completed && 
        !task.notifiedToday
      );

      if (todayTasks.length > 0) {
        const taskTitles = todayTasks.map(t => t.title).join(', ');
        this.showNotification(`You have ${todayTasks.length} task(s) due today: ${taskTitles}`, 'warning');
        
        // Mark as notified and update in Firebase
        for (const task of todayTasks) {
          try {
            await updateTask(task.id, { notifiedToday: true });
          } catch (error) {
            console.error('Failed to update notification status:', error);
          }
        }
        
        // Refresh tasks to get updated notification status
        await this.loadTasksFromFirebase();
      }
    }
  
    // Export functionality (updated to work with current tasks)
    exportTasks() {
      const dataStr = JSON.stringify(this.tasks, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `smarttask-backup-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      this.showNotification('Tasks exported successfully!', 'success');
    }

    // Clear all tasks (updated to use Firebase)
    async clearAllTasks() {
      if (!confirm('Are you sure you want to clear all tasks? This cannot be undone.')) {
        return;
      }

      this.setLoading(true);
      
      try {
        // Delete all tasks from Firebase
        const deletePromises = this.tasks.map(task => deleteTask(task.id));
        await Promise.all(deletePromises);
        
        // Refresh the display
        await this.loadTasksFromFirebase();
        this.showNotification('All tasks cleared!', 'success');
      } catch (error) {
        console.error('Failed to clear tasks:', error);
        this.showNotification('Failed to clear all tasks. Please try again.', 'error');
      } finally {
        this.setLoading(false);
      }
    }
  }
  
  // Initialize the application when DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    window.smartTask = new SmartTask();
  });
  
  // Expose functions globally for easier debugging and HTML onclick handlers
  window.exportTasks = () => window.smartTask.exportTasks();
  window.clearAllTasks = () => window.smartTask.clearAllTasks();