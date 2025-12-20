'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Production-ready iframe auto-height component
 * Syncs the app's content height with parent WordPress iframe
 * Measures #root element directly for accurate height
 */
export default function IframeHeightSync() {
  const pathname = usePathname();
  const lastSentHeightRef = useRef(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Check if we're in an iframe
    const isInIframe = window.self !== window.top;
    if (!isInIframe) return;

    // Reset on route change
    lastSentHeightRef.current = 0;

    const sendHeight = () => {
      // Measure the #root element which contains all content
      const root = document.getElementById('root');
      const header = document.querySelector('header');

      let height = 0;

      if (root) {
        // Get the bottom position of #root
        const rootRect = root.getBoundingClientRect();
        height = rootRect.height;
      }

      if (header) {
        // Add header height
        const headerRect = header.getBoundingClientRect();
        height += headerRect.height;
      }

      // Add small padding
      height = Math.ceil(height) + 40;

      // Only send if height changed significantly
      if (Math.abs(height - lastSentHeightRef.current) < 20) return;

      // Sanity check
      if (height < 100) return;

      lastSentHeightRef.current = height;

      window.parent.postMessage(
        { type: 'IFRAME_HEIGHT', height },
        '*'
      );
    };

    // Initial sends with delays
    sendHeight();
    const t1 = setTimeout(sendHeight, 200);
    const t2 = setTimeout(sendHeight, 500);
    const t3 = setTimeout(sendHeight, 1000);

    // Check periodically for first 5 seconds only
    intervalRef.current = setInterval(sendHeight, 300);
    const stopInterval = setTimeout(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, 5000);

    // Resize listener
    window.addEventListener('resize', sendHeight);

    // Cleanup
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(stopInterval);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener('resize', sendHeight);
    };
  }, [pathname]);

  return null;
}

