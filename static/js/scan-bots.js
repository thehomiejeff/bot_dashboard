// Scan for bots functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize scan button
    const scanBotsBtn = document.getElementById('scanBotsBtn');
    if (scanBotsBtn) {
        scanBotsBtn.addEventListener('click', function() {
            scanForBots();
        });
    }
});

// Scan for bots function
function scanForBots() {
    // Show scanning animation
    const scanBtn = document.getElementById('scanBotsBtn');
    const originalText = scanBtn.innerHTML;
    scanBtn.innerHTML = `
        <span class="btn-onboarding-icon">
            <div class="spinner-border spinner-border-sm" role="status">
                <span class="visually-hidden">Scanning...</span>
            </div>
        </span>
        Scanning...
    `;
    scanBtn.disabled = true;
    
    // Simulate scanning process (in a real app, this would be an API call)
    setTimeout(function() {
        // Reset button
        scanBtn.innerHTML = originalText;
        scanBtn.disabled = false;
        
        // Show notification
        const notification = document.createElement('div');
        notification.className = 'toast show';
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.backgroundColor = 'var(--card-bg)';
        notification.style.color = 'var(--text-primary)';
        notification.style.borderColor = 'var(--border-color)';
        notification.style.zIndex = '1050';
        
        notification.innerHTML = `
            <div class="toast-header bg-dark text-light">
                <strong class="me-auto">Bot Scanner</strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">
                <p>No Telegram bots were found on this system. Please add a bot manually.</p>
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
    }, 2000);
}
