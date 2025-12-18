/**
 * Supreme Tuning - Dynamic Iframe Height Resizer
 * 
 * This script automatically adjusts the iframe height in WordPress
 * by sending the content height to the parent window.
 * 
 * Usage in WordPress:
 * 1. Add this script to your Next.js app
 * 2. Add the receiver script to your WordPress page
 */

(function() {
  'use strict';

  // Configuration
  const config = {
    heightCalculationMethod: 'documentElementScroll', // Most reliable method
    minHeight: 400, // Minimum iframe height
    maxHeight: 10000, // Maximum iframe height
    interval: 250, // Check interval in ms
    tolerance: 10, // Height change tolerance in pixels
  };

  let lastHeight = 0;
  let resizeTimer = null;

  /**
   * Calculate the actual content height
   */
  function getContentHeight() {
    const body = document.body;
    const html = document.documentElement;

    // Try multiple methods and use the largest value
    const heights = [
      body.scrollHeight,
      body.offsetHeight,
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight
    ];

    return Math.max(...heights);
  }

  /**
   * Send height to parent window
   */
  function sendHeight() {
    const currentHeight = getContentHeight();

    // Only send if height changed significantly
    if (Math.abs(currentHeight - lastHeight) > config.tolerance) {
      const height = Math.min(
        Math.max(currentHeight, config.minHeight),
        config.maxHeight
      );

      // Send message to parent window
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'supremeTuningResize',
          height: height,
          url: window.location.href
        }, '*');
      }

      lastHeight = height;
      
      // Debug log (remove in production)
      console.log('Supreme Tuning: Sending height to parent:', height);
    }
  }

  /**
   * Debounced resize handler
   */
  function handleResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(sendHeight, 100);
  }

  /**
   * Initialize the resizer
   */
  function init() {
    // Send initial height
    setTimeout(sendHeight, 100);

    // Watch for resize events
    window.addEventListener('resize', handleResize);

    // Watch for DOM changes
    if (window.MutationObserver) {
      const observer = new MutationObserver(handleResize);
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true
      });
    }

    // Periodic check as fallback
    setInterval(sendHeight, config.interval);

    // Send height after images load
    window.addEventListener('load', () => {
      setTimeout(sendHeight, 500);
    });

    // Send height on route changes (for Next.js)
    if (typeof window !== 'undefined') {
      // Listen for Next.js route changes
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;

      history.pushState = function() {
        originalPushState.apply(this, arguments);
        setTimeout(sendHeight, 300);
      };

      history.replaceState = function() {
        originalReplaceState.apply(this, arguments);
        setTimeout(sendHeight, 300);
      };

      window.addEventListener('popstate', () => {
        setTimeout(sendHeight, 300);
      });
    }
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

