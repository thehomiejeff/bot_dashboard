// Sparkle Text Effect for macOS-inspired UI
document.addEventListener('DOMContentLoaded', function() {
  // Add sparkle animation to elements with sparkle-text class
  const sparkleElements = document.querySelectorAll('.sparkle-text');
  
  sparkleElements.forEach(element => {
    // Create sparkle particles
    for (let i = 0; i < 2; i++) {
      const sparkle = document.createElement('span');
      sparkle.className = 'sparkle-particle';
      sparkle.innerHTML = '✨';
      sparkle.style.position = 'absolute';
      sparkle.style.fontSize = '0.5em';
      sparkle.style.opacity = '0';
      sparkle.style.pointerEvents = 'none';
      
      // Random position around the element
      sparkle.style.top = (i === 0 ? '-0.5em' : '100%');
      sparkle.style.left = (i === 0 ? '-0.5em' : '100%');
      
      // Add animation
      sparkle.style.animation = `sparkle ${2 + i}s ${i * 0.5}s infinite`;
      
      element.style.position = 'relative';
      element.appendChild(sparkle);
    }
  });
  
  // Add hover effect to bento items
  const bentoItems = document.querySelectorAll('.bento-item');
  
  bentoItems.forEach(item => {
    item.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-5px)';
      this.style.boxShadow = 'var(--hover-shadow)';
    });
    
    item.addEventListener('mouseleave', function() {
      this.style.transform = '';
      this.style.boxShadow = '';
    });
  });
});

// Function to create consistent color mapping for charts
function getColorForBot(botId) {
  // macOS-inspired color palette
  const colors = [
    'rgba(10, 132, 255, 0.8)',  // Blue
    'rgba(48, 209, 88, 0.8)',   // Green
    'rgba(255, 159, 10, 0.8)',  // Orange
    'rgba(94, 92, 230, 0.8)',   // Indigo
    'rgba(255, 69, 58, 0.8)',   // Red
    'rgba(100, 210, 255, 0.8)', // Cyan
    'rgba(255, 214, 10, 0.8)',  // Yellow
    'rgba(191, 90, 242, 0.8)'   // Purple
  ];
  
  // Use modulo to ensure we always get a valid color
  const colorIndex = (parseInt(botId) || 0) % colors.length;
  return colors[colorIndex];
}

// Function to create glass morphism effect for cards
function applyGlassMorphism() {
  const cards = document.querySelectorAll('.card, .bento-item');
  
  cards.forEach(card => {
    // Add backdrop-filter if not already present
    if (!card.style.backdropFilter) {
      card.style.backdropFilter = 'blur(10px)';
      card.style.webkitBackdropFilter = 'blur(10px)';
    }
    
    // Add subtle inner border
    card.style.boxShadow = 'inset 0 0 0 1px rgba(255, 255, 255, 0.1)';
  });
}

// Apply glass morphism on page load
document.addEventListener('DOMContentLoaded', applyGlassMorphism);
