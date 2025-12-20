'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Production-ready iframe auto-height component
 * Syncs the app's content height with parent WordPress iframe
 * Uses MutationObserver for dynamic content detection
 */
export default function IframeHeightSync() {
  const pathname = usePathname();

  useEffect(() => {
    // Check if we're in an iframe
    const isInIframe = window.self !== window.top;

    if (!isInIframe) return;

    let lastHeight = 0;

    // Function to send height to parent
    const sendHeight = () => {
      const height = document.documentElement.scrollHeight;

      // Prevent resize loops - only send if height changed by more than 5px
      if (Math.abs(height - lastHeight) < 5) return;

      window.parent.postMessage(
        {
          type: 'IFRAME_HEIGHT',
          height,
        },
        '*'
        // For production, replace "*" with your WordPress domain for security:
        // "https://yourwordpresssite.com"
      );

      lastHeight = height;
    };

    // Initial sends (important for Safari compatibility)
    sendHeight();
    setTimeout(sendHeight, 300);
    setTimeout(sendHeight, 800);

    // Resize listener
    window.addEventListener('resize', sendHeight);

    // Observe DOM changes (API content, toggles, dynamic content, etc.)
    const observer = new MutationObserver(sendHeight);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    // Also observe images loading
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.complete) {
        img.addEventListener('load', sendHeight);
      }
    });

    // Cleanup
    return () => {
      window.removeEventListener('resize', sendHeight);
      observer.disconnect();
    };
  }, [pathname]); // Re-run when route changes

  return null; // This component doesn't render anything
}

