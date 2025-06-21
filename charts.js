// SmartTask Charts - Pure JavaScript Chart Implementation
// No external dependencies - using HTML5 Canvas for data visualization

class ProductivityChart {
    constructor(ctx) {
      this.ctx = ctx;
      this.canvas = ctx.canvas;
      this.data = { completed: 0, pending: 0, overdue: 0 };
      this.colors = {
        completed: '#10b981',
        pending: '#f59e0b', 
        overdue: '#ef4444'
      };
      this.animationProgress = 0;
      this.animationId = null;
      
      this.setupCanvas();
    }
  
    setupCanvas() {
      // Set up high DPI canvas
      const rect = this.canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      this.canvas.width = rect.width * dpr;
      this.canvas.height = rect.height * dpr;
      this.ctx.scale(dpr, dpr);
      
      this.canvas.style.width = rect.width + 'px';
      this.canvas.style.height = rect.height + 'px';
      
      this.centerX = rect.width / 2;
      this.centerY = rect.height / 2;
      this.radius = Math.min(rect.width, rect.height) / 2 - 20;
    }
  
    updateData(newData) {
      this.data = newData;
      this.animateChart();
    }
  
    animateChart() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }
      
      this.animationProgress = 0;
      const animate = () => {
        this.animationProgress += 0.05;
        this.draw();
        
        if (this.animationProgress < 1) {
          this.animationId = requestAnimationFrame(animate);
        }
      };
      
      animate();
    }
  
    draw() {
      // Clear canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      const total = this.data.completed + this.data.pending + this.data.overdue;
      
      if (total === 0) {
        this.drawEmptyState();
        return;
      }
  
      // Calculate angles
      const completedAngle = (this.data.completed / total) * 2 * Math.PI;
      const pendingAngle = (this.data.pending / total) * 2 * Math.PI;
      const overdueAngle = (this.data.overdue / total) * 2 * Math.PI;
  
      let currentAngle = -Math.PI / 2; // Start at top
      const progress = this.easeInOutCubic(this.animationProgress);
  
      // Draw completed section
      if (this.data.completed > 0) {
        this.drawArc(
          currentAngle, 
          currentAngle + (completedAngle * progress), 
          this.colors.completed,
          'Completed'
        );
        currentAngle += completedAngle;
      }
  
      // Draw pending section
      if (this.data.pending > 0) {
        this.drawArc(
          currentAngle, 
          currentAngle + (pendingAngle * progress), 
          this.colors.pending,
          'Pending'
        );
        currentAngle += pendingAngle;
      }
  
      // Draw overdue section
      if (this.data.overdue > 0) {
        this.drawArc(
          currentAngle, 
          currentAngle + (overdueAngle * progress), 
          this.colors.overdue,
          'Overdue'
        );
      }
  
      // Draw center circle for donut effect
      this.drawCenterCircle();
      
      // Draw center text
      this.drawCenterText(total);
    }
  
    drawArc(startAngle, endAngle, color, label) {
      this.ctx.beginPath();
      this.ctx.arc(this.centerX, this.centerY, this.radius, startAngle, endAngle);
      this.ctx.arc(this.centerX, this.centerY, this.radius * 0.6, endAngle, startAngle, true);
      this.ctx.closePath();
      this.ctx.fillStyle = color;
      this.ctx.fill();
  
      // Add subtle shadow
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      this.ctx.shadowBlur = 4;
      this.ctx.shadowOffsetX = 2;
      this.ctx.shadowOffsetY = 2;
      this.ctx.fill();
      
      // Reset shadow
      this.ctx.shadowColor = 'transparent';
      this.ctx.shadowBlur = 0;
      this.ctx.shadowOffsetX = 0;
      this.ctx.shadowOffsetY = 0;
    }
  
    drawCenterCircle() {
      // Get theme colors
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const bgColor = isDark ? '#1e293b' : '#ffffff';
      
      this.ctx.beginPath();
      this.ctx.arc(this.centerX, this.centerY, this.radius * 0.6, 0, 2 * Math.PI);
      this.ctx.fillStyle = bgColor;
      this.ctx.fill();
      
      // Add border
      this.ctx.strokeStyle = isDark ? '#334155' : '#e2e8f0';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }
  
    drawCenterText(total) {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const textColor = isDark ? '#f8fafc' : '#1e293b';
      const subtextColor = isDark ? '#cbd5e1' : '#64748b';
      
      this.ctx.fillStyle = textColor;
      this.ctx.font = 'bold 24px Inter, sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      
      // Draw total number
      this.ctx.fillText(total.toString(), this.centerX, this.centerY - 8);
      
      // Draw label
      this.ctx.fillStyle = subtextColor;
      this.ctx.font = '12px Inter, sans-serif';
      this.ctx.fillText('Total Tasks', this.centerX, this.centerY + 12);
    }
  
    drawEmptyState() {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const textColor = isDark ? '#94a3b8' : '#64748b';
      
      // Draw empty circle
      this.ctx.beginPath();
      this.ctx.arc(this.centerX, this.centerY, this.radius, 0, 2 * Math.PI);
      this.ctx.strokeStyle = isDark ? '#334155' : '#e2e8f0';
      this.ctx.lineWidth = 8;
      this.ctx.stroke();
      
      // Draw center text
      this.ctx.fillStyle = textColor;
      this.ctx.font = '16px Inter, sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('No tasks yet', this.centerX, this.centerY - 8);
      
      this.ctx.font = '12px Inter, sans-serif';
      this.ctx.fillText('Create your first task!', this.centerX, this.centerY + 12);
    }
  
    easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
  }
  
  // Simple Bar Chart for additional analytics (can be extended)
  class BarChart {
    constructor(ctx) {
      this.ctx = ctx;
      this.canvas = ctx.canvas;
      this.data = [];
      this.labels = [];
      this.colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
      
      this.setupCanvas();
    }
  
    setupCanvas() {
      const rect = this.canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      this.canvas.width = rect.width * dpr;
      this.canvas.height = rect.height * dpr;
      this.ctx.scale(dpr, dpr);
      
      this.canvas.style.width = rect.width + 'px';
      this.canvas.style.height = rect.height + 'px';
      
      this.width = rect.width;
      this.height = rect.height;
      this.padding = 40;
    }
  
    updateData(data, labels) {
      this.data = data;
      this.labels = labels;
      this.draw();
    }
  
    draw() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      if (this.data.length === 0) {
        this.drawEmptyState();
        return;
      }
  
      const maxValue = Math.max(...this.data);
      const barWidth = (this.width - this.padding * 2) / this.data.length * 0.8;
      const barSpacing = (this.width - this.padding * 2) / this.data.length * 0.2;
      
      this.data.forEach((value, index) => {
        const barHeight = (value / maxValue) * (this.height - this.padding * 2);
        const x = this.padding + index * (barWidth + barSpacing);
        const y = this.height - this.padding - barHeight;
        
        // Draw bar
        this.ctx.fillStyle = this.colors[index % this.colors.length];
        this.ctx.fillRect(x, y, barWidth, barHeight);
        
        // Draw value label
        this.ctx.fillStyle = '#374151';
        this.ctx.font = '12px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(value.toString(), x + barWidth / 2, y - 5);
        
        // Draw category label
        this.ctx.fillText(this.labels[index], x + barWidth / 2, this.height - 10);
      });
    }
  
    drawEmptyState() {
      this.ctx.fillStyle = '#9ca3af';
      this.ctx.font = '16px Inter, sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('No data to display', this.width / 2, this.height / 2);
    }
  }
  
  // Weekly Progress Chart (Line Chart)
  class ProgressChart {
    constructor(ctx) {
      this.ctx = ctx;
      this.canvas = ctx.canvas;
      this.data = [];
      this.labels = [];
      this.color = '#3b82f6';
      this.fillColor = 'rgba(59, 130, 246, 0.1)';
      this.animationProgress = 0;
      this.animationId = null;
      
      this.setupCanvas();
    }
  
    setupCanvas() {
      const rect = this.canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      this.canvas.width = rect.width * dpr;
      this.canvas.height = rect.height * dpr;
      this.ctx.scale(dpr, dpr);
      
      this.canvas.style.width = rect.width + 'px';
      this.canvas.style.height = rect.height + 'px';
      
      this.width = rect.width;
      this.height = rect.height;
      this.padding = 50;
    }
  
    updateData(data, labels) {
      this.data = data;
      this.labels = labels;
      this.animateChart();
    }
  
    animateChart() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }
      
      this.animationProgress = 0;
      const animate = () => {
        this.animationProgress += 0.03;
        this.draw();
        
        if (this.animationProgress < 1) {
          this.animationId = requestAnimationFrame(animate);
        }
      };
      
      animate();
    }
  
    draw() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      if (this.data.length === 0) {
        this.drawEmptyState();
        return;
      }
  
      this.drawGrid();
      this.drawAxes();
      this.drawLine();
      this.drawPoints();
      this.drawLabels();
    }
  
    drawGrid() {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const gridColor = isDark ? '#374151' : '#e5e7eb';
      
      this.ctx.strokeStyle = gridColor;
      this.ctx.lineWidth = 1;
      this.ctx.setLineDash([2, 2]);
  
      // Horizontal grid lines
      const maxValue = Math.max(...this.data);
      const gridLines = 5;
      for (let i = 0; i <= gridLines; i++) {
        const y = this.padding + (i / gridLines) * (this.height - this.padding * 2);
        this.ctx.beginPath();
        this.ctx.moveTo(this.padding, y);
        this.ctx.lineTo(this.width - this.padding, y);
        this.ctx.stroke();
      }
  
      // Vertical grid lines
      if (this.data.length > 1) {
        const stepX = (this.width - this.padding * 2) / (this.data.length - 1);
        for (let i = 0; i < this.data.length; i++) {
          const x = this.padding + i * stepX;
          this.ctx.beginPath();
          this.ctx.moveTo(x, this.padding);
          this.ctx.lineTo(x, this.height - this.padding);
          this.ctx.stroke();
        }
      }
  
      this.ctx.setLineDash([]);
    }
  
    drawAxes() {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const axisColor = isDark ? '#6b7280' : '#374151';
      
      this.ctx.strokeStyle = axisColor;
      this.ctx.lineWidth = 2;
  
      // Y-axis
      this.ctx.beginPath();
      this.ctx.moveTo(this.padding, this.padding);
      this.ctx.lineTo(this.padding, this.height - this.padding);
      this.ctx.stroke();
  
      // X-axis
      this.ctx.beginPath();
      this.ctx.moveTo(this.padding, this.height - this.padding);
      this.ctx.lineTo(this.width - this.padding, this.height - this.padding);
      this.ctx.stroke();
    }
  
    drawLine() {
      if (this.data.length < 2) return;
  
      const maxValue = Math.max(...this.data);
      const stepX = (this.width - this.padding * 2) / (this.data.length - 1);
      const progress = this.easeInOutCubic(this.animationProgress);
      const visiblePoints = Math.ceil(this.data.length * progress);
  
      // Draw area fill
      this.ctx.fillStyle = this.fillColor;
      this.ctx.beginPath();
      this.ctx.moveTo(this.padding, this.height - this.padding);
      
      for (let i = 0; i < visiblePoints; i++) {
        const x = this.padding + i * stepX;
        const y = this.height - this.padding - (this.data[i] / maxValue) * (this.height - this.padding * 2);
        if (i === 0) {
          this.ctx.lineTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      }
      
      if (visiblePoints > 0) {
        const lastX = this.padding + (visiblePoints - 1) * stepX;
        this.ctx.lineTo(lastX, this.height - this.padding);
      }
      this.ctx.closePath();
      this.ctx.fill();
  
      // Draw line
      this.ctx.strokeStyle = this.color;
      this.ctx.lineWidth = 3;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      
      this.ctx.beginPath();
      for (let i = 0; i < visiblePoints; i++) {
        const x = this.padding + i * stepX;
        const y = this.height - this.padding - (this.data[i] / maxValue) * (this.height - this.padding * 2);
        
        if (i === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      }
      this.ctx.stroke();
    }
  
    drawPoints() {
      const maxValue = Math.max(...this.data);
      const stepX = (this.width - this.padding * 2) / (this.data.length - 1);
      const progress = this.easeInOutCubic(this.animationProgress);
      const visiblePoints = Math.ceil(this.data.length * progress);
  
      this.ctx.fillStyle = this.color;
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 3;
  
      for (let i = 0; i < visiblePoints; i++) {
        const x = this.padding + i * stepX;
        const y = this.height - this.padding - (this.data[i] / maxValue) * (this.height - this.padding * 2);
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, 6, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.stroke();
      }
    }
  
    drawLabels() {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const textColor = isDark ? '#d1d5db' : '#374151';
      
      this.ctx.fillStyle = textColor;
      this.ctx.font = '12px Inter, sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'top';
  
      // X-axis labels
      const stepX = (this.width - this.padding * 2) / (this.data.length - 1);
      for (let i = 0; i < this.labels.length; i++) {
        const x = this.padding + i * stepX;
        this.ctx.fillText(this.labels[i], x, this.height - this.padding + 10);
      }
  
      // Y-axis labels
      const maxValue = Math.max(...this.data);
      this.ctx.textAlign = 'right';
      this.ctx.textBaseline = 'middle';
      
      for (let i = 0; i <= 5; i++) {
        const value = Math.round((maxValue / 5) * (5 - i));
        const y = this.padding + (i / 5) * (this.height - this.padding * 2);
        this.ctx.fillText(value.toString(), this.padding - 10, y);
      }
    }
  
    drawEmptyState() {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const textColor = isDark ? '#94a3b8' : '#64748b';
      
      this.ctx.fillStyle = textColor;
      this.ctx.font = '16px Inter, sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('No progress data yet', this.width / 2, this.height / 2 - 10);
      
      this.ctx.font = '12px Inter, sans-serif';
      this.ctx.fillText('Complete some tasks to see your progress!', this.width / 2, this.height / 2 + 15);
    }
  
    easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
  }
  
  // Chart Manager - Utility class to manage multiple charts
  class ChartManager {
    constructor() {
      this.charts = new Map();
    }
  
    createChart(type, canvasId, options = {}) {
      const canvas = document.getElementById(canvasId);
      if (!canvas) {
        console.error(`Canvas with id '${canvasId}' not found`);
        return null;
      }
  
      const ctx = canvas.getContext('2d');
      let chart;
  
      switch (type) {
        case 'productivity':
          chart = new ProductivityChart(ctx);
          break;
        case 'bar':
          chart = new BarChart(ctx);
          break;
        case 'progress':
          chart = new ProgressChart(ctx);
          break;
        default:
          console.error(`Unknown chart type: ${type}`);
          return null;
      }
  
      this.charts.set(canvasId, chart);
      return chart;
    }
  
    getChart(canvasId) {
      return this.charts.get(canvasId);
    }
  
    updateChart(canvasId, data, labels = null) {
      const chart = this.charts.get(canvasId);
      if (chart) {
        if (chart instanceof ProductivityChart) {
          chart.updateData(data);
        } else {
          chart.updateData(data, labels);
        }
      }
    }
  
    resizeChart(canvasId) {
      const chart = this.charts.get(canvasId);
      if (chart) {
        chart.setupCanvas();
        // Redraw the chart with current data
        if (chart instanceof ProductivityChart) {
          chart.draw();
        } else {
          chart.draw();
        }
      }
    }
  
    resizeAllCharts() {
      this.charts.forEach((chart, canvasId) => {
        this.resizeChart(canvasId);
      });
    }
  
    removeChart(canvasId) {
      const chart = this.charts.get(canvasId);
      if (chart && chart.animationId) {
        cancelAnimationFrame(chart.animationId);
      }
      this.charts.delete(canvasId);
    }
  }
  
  // Theme observer for automatic theme switching
  class ThemeObserver {
    constructor(chartManager) {
      this.chartManager = chartManager;
      this.setupObserver();
    }
  
    setupObserver() {
      // Watch for theme changes
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
            // Redraw all charts when theme changes
            this.chartManager.resizeAllCharts();
          }
        });
      });
  
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
      });
  
      // Also listen for system theme changes
      if (window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addListener(() => {
          setTimeout(() => {
            this.chartManager.resizeAllCharts();
          }, 100);
        });
      }
    }
  }
  
  // Export for use in other modules
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      ProductivityChart,
      BarChart,
      ProgressChart,
      ChartManager,
      ThemeObserver
    };
  }
  
  // Auto-resize handler for window resize events
  window.addEventListener('resize', () => {
    if (window.chartManager) {
      window.chartManager.resizeAllCharts();
    }
  });
  
  // Initialize theme observation if chart manager exists
  window.addEventListener('DOMContentLoaded', () => {
    if (window.chartManager) {
      new ThemeObserver(window.chartManager);
    }
  });
