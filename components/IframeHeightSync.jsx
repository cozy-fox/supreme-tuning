'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Component that syncs the app's height with parent WordPress iframe
 * Sends postMessage to parent window with current height
 */
export default function IframeHeightSync() {
  const pathname = usePathname();

  useEffect(() => {
    // Check if we're in an iframe
    const isInIframe = window.self !== window.top;

    if (!isInIframe) return;

    let lastHeight = 0;
    const tolerance = 10; // Only send if height changed by more than 10px

    // Function to get accurate content height
    const getContentHeight = () => {
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
    };

    // Function to send height to parent
    const sendHeight = () => {
      try {
        const currentHeight = getContentHeight();

        // Only send if height changed significantly
        if (Math.abs(currentHeight - lastHeight) > tolerance) {
          window.parent.postMessage({
            type: 'supremeTuningResize',
            height: currentHeight,
            url: window.location.href
          }, '*');

          lastHeight = currentHeight;
          console.log('Supreme Tuning: Height sent to parent:', currentHeight);
        }
      } catch (e) {
        console.error('Failed to send height to parent:', e);
      }
    };

    // Debounced send height
    let resizeTimer;
    const debouncedSendHeight = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(sendHeight, 100);
    };

    // Send height on mount
    setTimeout(sendHeight, 100);

    // Send height on window resize
    window.addEventListener('resize', debouncedSendHeight);

    // Use ResizeObserver to detect content changes
    const resizeObserver = new ResizeObserver(debouncedSendHeight);

    // Observe the root element
    const root = document.getElementById('root');
    if (root) {
      resizeObserver.observe(root);
    }

    // Also observe body
    resizeObserver.observe(document.body);

    // Send height periodically (fallback)
    const interval = setInterval(sendHeight, 300);

    // Send height after images load
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (img.complete) {
        sendHeight();
      } else {
        img.addEventListener('load', sendHeight);
      }
    });

    // Cleanup
    return () => {
      window.removeEventListener('resize', debouncedSendHeight);
      resizeObserver.disconnect();
      clearInterval(interval);
      clearTimeout(resizeTimer);
    };
  }, [pathname]); // Re-run when route changes

  return null; // This component doesn't render anything
}

