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
  const initialLoadRef = useRef(true);

  useEffect(() => {
    // Check if we're in an iframe
    const isInIframe = window.self !== window.top;

    if (!isInIframe) return;

    // Reset state on route change - this is critical!
    lastHeightRef.current = 0;
    isUpdatingRef.current = false;
    initialLoadRef.current = true;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    // Function to send height to parent
    const sendHeight = (force = false) => {
      // Prevent re-entrant calls during height update (unless forced)
      if (isUpdatingRef.current && !force) return;

      const height = document.documentElement.scrollHeight;

      // On initial load or force, always send. Otherwise check threshold.
      if (!initialLoadRef.current && !force) {
        if (Math.abs(height - lastHeightRef.current) < 10) return;
      }

      isUpdatingRef.current = true;
      lastHeightRef.current = height;
      initialLoadRef.current = false;

      window.parent.postMessage(
        {
          type: 'IFRAME_HEIGHT',
          height: height,
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
      debounceTimerRef.current = setTimeout(() => sendHeight(false), 50);
    };

    // Initial sends (important for Safari compatibility)
    // Use requestAnimationFrame to ensure DOM is painted
    requestAnimationFrame(() => {
      sendHeight(true);
    });

    setTimeout(() => sendHeight(true), 100);
    setTimeout(() => sendHeight(true), 300);
    setTimeout(() => sendHeight(true), 800);

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
    const handleImageLoad = () => debouncedSendHeight();
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.complete) {
        img.addEventListener('load', handleImageLoad);
      }
    });

    // Cleanup
    return () => {
      window.removeEventListener('resize', debouncedSendHeight);
      observer.disconnect();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      // Clean up image listeners
      images.forEach(img => {
        img.removeEventListener('load', handleImageLoad);
      });
    };
  }, [pathname]); // Re-run when route changes

  return null; // This component doesn't render anything
}

