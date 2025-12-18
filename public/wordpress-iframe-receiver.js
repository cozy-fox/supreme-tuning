/**
 * Supreme Tuning - WordPress Iframe Receiver Script
 * 
 * Add this script to your WordPress page to automatically resize the iframe
 * based on the content height sent from the Supreme Tuning app.
 * 
 * INSTALLATION INSTRUCTIONS:
 * ===========================
 * 
 * 1. Add this script to your WordPress page (in HTML block or theme footer):
 * 
 *    <script src="https://your-supreme-tuning-domain.com/wordpress-iframe-receiver.js"></script>
 * 
 *    OR copy the code below into a Custom HTML block or your theme's footer.php
 * 
 * 2. Make sure your iframe has an ID or class. Example:
 * 
 *    <iframe id="supreme-tuning-iframe" 
 *            src="https://your-supreme-tuning-domain.com" 
 *            width="100%" 
 *            frameborder="0"
 *            scrolling="no"></iframe>
 * 
 * 3. The script will automatically detect and resize the iframe.
 */

(function() {
  'use strict';

  // Configuration - adjust these if needed
  const config = {
    iframeSelector: '#supreme-tuning-iframe', // Change this to match your iframe ID/class
    minHeight: 400,
    maxHeight: 10000,
    animationDuration: 300, // Smooth resize animation in ms
  };

  let iframe = null;

  /**
   * Find the Supreme Tuning iframe
   */
  function findIframe() {
    // Try specific selector first
    iframe = document.querySelector(config.iframeSelector);

    // If not found, try to find any iframe with supreme-tuning in the src
    if (!iframe) {
      const iframes = document.querySelectorAll('iframe');
      for (let i = 0; i < iframes.length; i++) {
        if (iframes[i].src && iframes[i].src.includes('supreme-tuning')) {
          iframe = iframes[i];
          break;
        }
      }
    }

    // If still not found, try common selectors
    if (!iframe) {
      const selectors = [
        'iframe[src*="localhost:3000"]',
        'iframe[src*="vercel.app"]',
        '.supreme-tuning-iframe',
        '#tuning-calculator'
      ];

      for (let selector of selectors) {
        iframe = document.querySelector(selector);
        if (iframe) break;
      }
    }

    if (iframe) {
      console.log('Supreme Tuning: Iframe found', iframe);
      // Ensure scrolling is disabled
      iframe.setAttribute('scrolling', 'no');
      iframe.style.overflow = 'hidden';
      iframe.style.width = '100%';
      iframe.style.border = 'none';
    } else {
      console.warn('Supreme Tuning: Iframe not found. Please check the selector:', config.iframeSelector);
    }

    return iframe;
  }

  /**
   * Resize the iframe with smooth animation
   */
  function resizeIframe(height) {
    if (!iframe) return;

    const newHeight = Math.min(
      Math.max(height, config.minHeight),
      config.maxHeight
    );

    // Add smooth transition
    if (!iframe.style.transition) {
      iframe.style.transition = `height ${config.animationDuration}ms ease-out`;
    }

    iframe.style.height = newHeight + 'px';

    console.log('Supreme Tuning: Iframe resized to', newHeight + 'px');
  }

  /**
   * Handle messages from the iframe
   */
  function handleMessage(event) {
    // Security: Verify the message is from our iframe
    // In production, replace '*' with your actual domain
    // if (event.origin !== 'https://your-domain.com') return;

    const data = event.data;

    // Check if this is a Supreme Tuning resize message
    if (data && data.type === 'supremeTuningResize' && data.height) {
      resizeIframe(data.height);
    }
  }

  /**
   * Initialize the receiver
   */
  function init() {
    // Find the iframe
    if (!findIframe()) {
      // Retry after a delay if iframe not found immediately
      setTimeout(() => {
        findIframe();
      }, 1000);
    }

    // Listen for messages from the iframe
    window.addEventListener('message', handleMessage, false);

    console.log('Supreme Tuning: WordPress receiver initialized');
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

