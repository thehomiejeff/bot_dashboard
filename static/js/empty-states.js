// Empty States Components for Telegram Bot Monitoring Dashboard

/**
 * Creates an empty state component for tables
 * @param {string} type - Type of empty state (error, data, bot)
 * @param {string} title - Title text for the empty state
 * @param {string} description - Description text for the empty state
 * @param {string} actionText - Text for the action button (optional)
 * @param {string} actionUrl - URL for the action button (optional)
 * @param {string} iconName - Name of the icon to use
 * @returns {string} HTML for the empty state
 */
function createEmptyState(type, title, description, actionText = null, actionUrl = null, iconName = null) {
    // Default icons based on type if not specified
    if (!iconName) {
        switch (type) {
            case 'error':
                iconName = 'alert-triangle';
                break;
            case 'data':
                iconName = 'bar-chart-2';
                break;
            case 'bot':
                iconName = 'bot';
                break;
            default:
                iconName = 'info';
        }
    }

    // Generate icon SVG based on iconName
    let iconSvg = '';
    switch (iconName) {
        case 'alert-triangle':
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>`;
            break;
        case 'bar-chart-2':
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`;
            break;
        case 'bot':
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>`;
            break;
        case 'search':
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;
            break;
        case 'activity':
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>`;
            break;
        default:
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    // Build action button if provided
    let actionButton = '';
    if (actionText && actionUrl) {
        actionButton = `<a href="${actionUrl}" class="btn btn-outline-${type === 'error' ? 'danger' : type === 'bot' ? 'success' : 'info'} empty-state-action">${actionText}</a>`;
    }

    // Return the complete empty state HTML
    return `
    <div class="empty-state empty-state-${type}">
        <div class="empty-state-icon">
            ${iconSvg}
        </div>
        <h4 class="empty-state-title">${title}</h4>
        <p class="empty-state-description">${description}</p>
        ${actionButton}
    </div>
    `;
}

/**
 * Creates a loading state component
 * @param {string} message - Message to display while loading
 * @returns {string} HTML for the loading state
 */
function createLoadingState(message = 'Loading data...') {
    return `
    <div class="empty-state loading-pulse">
        <div class="empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
        </div>
        <h4 class="empty-state-title">${message}</h4>
    </div>
    `;
}

/**
 * Creates an empty state for charts
 * @param {string} canvasId - ID of the canvas element to replace
 * @param {string} message - Message to display in the empty state
 * @returns {void} - Replaces the canvas with the empty state
 */
function createChartEmptyState(canvasId, message = 'No data available for this chart') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const parent = canvas.parentElement;
    const emptyState = document.createElement('div');
    emptyState.className = 'chart-empty-state';
    emptyState.innerHTML = `
        <div class="empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
        </div>
        <p class="text-muted">${message}</p>
    `;
    
    // Hide the canvas and append the empty state
    canvas.style.display = 'none';
    parent.appendChild(emptyState);
    
    // Store reference to the empty state in the canvas data attribute
    canvas.setAttribute('data-empty-state', true);
}

/**
 * Removes the chart empty state and shows the canvas again
 * @param {string} canvasId - ID of the canvas element
 * @returns {void}
 */
function removeChartEmptyState(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || canvas.getAttribute('data-empty-state') !== 'true') return;
    
    const parent = canvas.parentElement;
    const emptyState = parent.querySelector('.chart-empty-state');
    
    if (emptyState) {
        parent.removeChild(emptyState);
    }
    
    canvas.style.display = 'block';
    canvas.setAttribute('data-empty-state', false);
}

/**
 * Creates a table empty state
 * @param {string} type - Type of empty state (error, data, bot)
 * @param {string} title - Title text for the empty state
 * @param {string} description - Description text for the empty state
 * @param {number} colSpan - Number of columns to span
 * @returns {string} HTML for the table empty state
 */
function createTableEmptyState(type, title, description, colSpan) {
    return `
    <tr>
        <td colspan="${colSpan}" class="p-0">
            ${createEmptyState(type, title, description)}
        </td>
    </tr>
    `;
}
