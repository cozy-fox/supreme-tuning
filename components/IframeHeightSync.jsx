'use client';

import { useEffect } from 'react';

/**
 * Component that syncs the app's height with parent WordPress iframe
 * Sends postMessage to parent window with current height
 */
export default function IframeHeightSync() {
  useEffect(() => {
    // Check if we're in an iframe
    const isInIframe = window.self !== window.top;
    
    if (!isInIframe) return;

    // Function to send height to parent
    const sendHeight = () => {
      try {
        const height = document.documentElement.scrollHeight;
        window.parent.postMessage({
          type: 'supremeTuningHeight',
          height: height
        }, '*');
      } catch (e) {
        console.error('Failed to send height to parent:', e);
      }
    };

    // Send height on mount
    sendHeight();

    // Send height on window resize
    window.addEventListener('resize', sendHeight);

    // Use ResizeObserver to detect content changes
    const resizeObserver = new ResizeObserver(() => {
      sendHeight();
    });

    // Observe the root element
    const root = document.getElementById('root');
    if (root) {
      resizeObserver.observe(root);
    }

    // Also observe body
    resizeObserver.observe(document.body);

    // Send height periodically (fallback)
    const interval = setInterval(sendHeight, 500);

    // Cleanup
    return () => {
      window.removeEventListener('resize', sendHeight);
      resizeObserver.disconnect();
      clearInterval(interval);
    };
  }, []);

  return null; // This component doesn't render anything
}

