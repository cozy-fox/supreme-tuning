'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Production-ready iframe auto-height component
 * Syncs the app's content height with parent WordPress iframe
 * Uses MutationObserver for dynamic content detection with loop prevention
 */
export default function IframeHeightSync() {
  const pathname = usePathname();
  const lastHeightRef = useRef(0);
  const isUpdatingRef = useRef(false);
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    // Check if we're in an iframe
    const isInIframe = window.self !== window.top;

    if (!isInIframe) return;

    // Function to send height to parent
    const sendHeight = () => {
      // Prevent re-entrant calls during height update
      if (isUpdatingRef.current) return;

      const height = document.documentElement.scrollHeight;

      // Prevent resize loops - only send if height changed significantly
      if (Math.abs(height - lastHeightRef.current) < 10) return;

      // Set a maximum reasonable height to prevent runaway growth
      const maxHeight = 5000; // Adjust based on your content
      const safeHeight = Math.min(height, maxHeight);

      isUpdatingRef.current = true;
      lastHeightRef.current = safeHeight;

      window.parent.postMessage(
        {
          type: 'IFRAME_HEIGHT',
          height: safeHeight,
        },
        '*'
        // For production, replace "*" with your WordPress domain for security:
        // "https://yourwordpresssite.com"
      );

      // Reset the updating flag after a short delay
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 100);
    };

    // Debounced version to prevent rapid-fire updates
    const debouncedSendHeight = () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(sendHeight, 50);
    };

    // Initial sends (important for Safari compatibility)
    sendHeight();
    setTimeout(sendHeight, 300);
    setTimeout(sendHeight, 800);
    // One more after animations typically complete
    setTimeout(sendHeight, 1500);

    // Resize listener
    window.addEventListener('resize', debouncedSendHeight);

    // Observe DOM changes - but NOT attributes to prevent animation loops
    const observer = new MutationObserver(debouncedSendHeight);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false, // Disabled to prevent CSS animation/transition loops
    });

    // Also observe images loading
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.complete) {
        img.addEventListener('load', debouncedSendHeight);
      }
    });

    // Cleanup
    return () => {
      window.removeEventListener('resize', debouncedSendHeight);
      observer.disconnect();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [pathname]); // Re-run when route changes

  return null; // This component doesn't render anything
}

