/**
 * Supreme Tuning - WordPress Iframe Dynamic Height Integration
 * 
 * This script should be added to your WordPress site to enable
 * dynamic height adjustment for the Supreme Tuning iframe.
 * 
 * Usage:
 * 1. Add this script to your WordPress theme or use a plugin like "Insert Headers and Footers"
 * 2. Add the iframe to your WordPress page with id="supreme-tuning-iframe"
 * 3. The iframe height will automatically adjust based on content
 */

(function() {
  'use strict';

  // Configuration
  const config = {
    iframeId: 'supreme-tuning-iframe',
    minHeight: 400,
    maxHeight: 10000,
    transitionDuration: '0.3s',
    debug: true // Set to false in production
  };

  // Find the iframe
  function getIframe() {
    return document.getElementById(config.iframeId);
  }

  // Resize the iframe
  function resizeIframe(height) {
    const iframe = getIframe();
    
    if (!iframe) {
      if (config.debug) {
        console.warn('Supreme Tuning: Iframe not found with id:', config.iframeId);
      }
      return;
    }

    // Validate height
    const validHeight = Math.max(config.minHeight, Math.min(height, config.maxHeight));

    // Apply smooth transition
    iframe.style.transition = `height ${config.transitionDuration} ease`;
    iframe.style.height = validHeight + 'px';

    if (config.debug) {
      console.log('Supreme Tuning: Iframe resized to', validHeight + 'px');
    }
  }

  // Handle messages from iframe
  function handleMessage(event) {
    // Security: Verify the message structure
    const data = event.data;
    
    if (!data || typeof data !== 'object') {
      return;
    }

    // Check if this is a Supreme Tuning resize message
    if (data.type === 'supremeTuningResize' && data.height) {
      resizeIframe(data.height);
    }
  }

  // Initialize when DOM is ready
  function init() {
    // Add message event listener
    window.addEventListener('message', handleMessage, false);

    if (config.debug) {
      console.log('Supreme Tuning: WordPress iframe integration initialized');
    }

    // Initial resize after a short delay
    setTimeout(() => {
      const iframe = getIframe();
      if (iframe) {
        // Set initial height
        iframe.style.height = config.minHeight + 'px';
        iframe.style.width = '100%';
        iframe.style.border = 'none';
        iframe.style.overflow = 'hidden';
      }
    }, 100);
  }

  // Run initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

