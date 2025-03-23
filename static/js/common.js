// Common JavaScript functions for Telegram Bot Monitoring Dashboard

// Initialize Socket.IO connection
const socket = io();

// Global variables
let selectedTimeRange = '24h';
let selectedBotId = 'all';
let botsData = [];
let chartsInstances = {};

// Document ready function
document.addEventListener('DOMContentLoaded', function() {
    // Initialize time range selector
    const timeRangeSelector = document.getElementById('timeRangeSelector');
    if (timeRangeSelector) {
        timeRangeSelector.addEventListener('change', function() {
            selectedTimeRange = this.value;
            refreshDashboardData();
        });
    }

    // Initialize bot selector
    const botSelector = document.getElementById('botSelector');
    if (botSelector) {
        botSelector.addEventListener('change', function() {
            selectedBotId = this.value;
            refreshDashboardData();
        });
        
        // Load bots for selector
        loadBots();
    }

    // Socket.IO event listeners
    socket.on('connect', function() {
        // Connection established
    });

    socket.on('disconnect', function() {
        // Connection lost
    });

    socket.on('metrics_update', function(data) {
        // Refresh dashboard data when metrics update received
        refreshDashboardData();
    });

    socket.on('new_error', function(data) {
        showErrorNotification(data);
        refreshDashboardData();
    });
});

// Load bots and populate selector
function loadBots() {
    fetch('/api/bots')
        .then(response => response.json())
        .then(data => {
            botsData = data;
            const botSelector = document.getElementById('botSelector');
            
            // Clear existing options except "All Bots"
            while (botSelector.options.length > 1) {
                botSelector.remove(1);
            }
            
            // Add bot options
            data.forEach(bot => {
                const option = document.createElement('option');
                option.value = bot.id;
                option.textContent = bot.name;
                botSelector.appendChild(option);
            });
        })
        .catch(error => {
            // Error handling without console logging
        });
}

// Refresh dashboard data based on current selections
function refreshDashboardData() {
    // This function will be implemented differently on each page
    if (typeof pageSpecificRefresh === 'function') {
        pageSpecificRefresh();
    }
}

// Format timestamp for display
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
}

// Format status with appropriate class
function formatStatus(status) {
    let statusClass = '';
    
    switch(status.toLowerCase()) {
        case 'active':
            statusClass = 'status-active';
            break;
        case 'inactive':
            statusClass = 'status-inactive';
            break;
        case 'error':
            statusClass = 'status-error';
            break;
        default:
            statusClass = '';
    }
    
    return `<span class="${statusClass}">${status}</span>`;
}

// Format severity with appropriate class
function formatSeverity(severity) {
    let severityClass = '';
    
    switch(severity.toLowerCase()) {
        case 'low':
            severityClass = 'severity-low';
            break;
        case 'medium':
            severityClass = 'severity-medium';
            break;
        case 'high':
            severityClass = 'severity-high';
            break;
        case 'critical':
            severityClass = 'severity-critical';
            break;
        default:
            severityClass = '';
    }
    
    return `<span class="${severityClass}">${severity}</span>`;
}

// Show error notification
function showErrorNotification(error) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'toast show';
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = 'var(--card-bg)';
    notification.style.color = 'var(--text-primary)';
    notification.style.borderColor = 'var(--border-color)';
    notification.style.zIndex = '1050';
    
    // Get bot name
    const botName = botsData.find(bot => bot.id === error.bot_id)?.name || `Bot #${error.bot_id}`;
    
    notification.innerHTML = `
        <div class="toast-header bg-dark text-light">
            <strong class="me-auto">${error.error_type}</strong>
            <small>${formatSeverity(error.severity)}</small>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
        </div>
        <div class="toast-body">
            <p><strong>${botName}:</strong> ${error.error_message}</p>
            <small>${formatTimestamp(error.timestamp)}</small>
        </div>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
    }, 5000);
    
    // Add close button functionality
    const closeButton = notification.querySelector('.btn-close');
    closeButton.addEventListener('click', function() {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
    });
}

// Create or update chart
function createOrUpdateChart(canvasId, type, labels, datasets, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    
    const ctx = canvas.getContext('2d');
    
    // Default options for dark theme
    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: 'var(--text-primary)'
                }
            },
            tooltip: {
                backgroundColor: 'var(--card-bg)',
                titleColor: 'var(--text-primary)',
                bodyColor: 'var(--text-primary)',
                borderColor: 'var(--border-color)',
                borderWidth: 1
            }
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                    color: 'var(--text-secondary)'
                }
            },
            y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                    color: 'var(--text-secondary)'
                }
            }
        }
    };
    
    // Merge options
    const mergedOptions = {...defaultOptions, ...options};
    
    // If chart already exists, update it
    if (chartsInstances[canvasId]) {
        chartsInstances[canvasId].data.labels = labels;
        chartsInstances[canvasId].data.datasets = datasets;
        chartsInstances[canvasId].options = mergedOptions;
        chartsInstances[canvasId].update();
        return chartsInstances[canvasId];
    }
    
    // Create new chart
    chartsInstances[canvasId] = new Chart(ctx, {
        type: type,
        data: {
            labels: labels,
            datasets: datasets
        },
        options: mergedOptions
    });
    
    return chartsInstances[canvasId];
}

// Get consistent color based on bot ID with specified opacity
function getRandomColor(opacity = 1) {
    const colors = [
        `rgba(13, 110, 253, ${opacity})`,  // Blue
        `rgba(32, 201, 151, ${opacity})`,  // Teal
        `rgba(13, 202, 240, ${opacity})`,  // Cyan
        `rgba(220, 53, 69, ${opacity})`,   // Red
        `rgba(255, 193, 7, ${opacity})`,   // Yellow
        `rgba(25, 135, 84, ${opacity})`,   // Green
        `rgba(111, 66, 193, ${opacity})`,  // Purple
        `rgba(253, 126, 20, ${opacity})`,  // Orange
        `rgba(233, 30, 99, ${opacity})`,   // Pink
        `rgba(0, 188, 212, ${opacity})`,   // Light Blue
    ];
    
    // Store a mapping of bot IDs to colors to ensure consistency
    if (!window.botColorMap) {
        window.botColorMap = {};
    }
    
    // If called from a context with botId parameter, use that for consistent color mapping
    if (arguments.length > 1 && arguments[1] !== undefined) {
        const botId = arguments[1];
        if (!window.botColorMap[botId]) {
            // Assign a consistent color based on bot ID
            window.botColorMap[botId] = colors[botId % colors.length];
        }
        return window.botColorMap[botId];
    }
    
    // Fallback to first color if no bot ID is provided
    return colors[0];
}

// Format large numbers
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num;
}
