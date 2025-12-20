'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Iframe height sync - measures content and sends to parent
 * Height is REPLACED not ADDED on each update
 */
export default function IframeHeightSync() {
  const pathname = usePathname();
  const lastHeightRef = useRef(0);

  useEffect(() => {
    if (window.self === window.top) return;

    // Reset last height on route change so new page gets fresh measurement
    lastHeightRef.current = 0;

    const getHeight = () => {
      const main = document.querySelector('main');
      const header = document.querySelector('header');

      if (!main) return 600;

      // Temporarily set body height to auto to get true content height
      const originalHeight = document.body.style.height;
      document.body.style.height = 'auto';

      // Force reflow
      void document.body.offsetHeight;

      // Now measure
      const headerHeight = header ? header.offsetHeight : 0;
      const mainHeight = main.offsetHeight;

      // Restore original height
      document.body.style.height = originalHeight;

      return headerHeight + mainHeight + 20;
    };

    const sendHeight = () => {
      const height = getHeight();

      // Only send if height actually changed by more than 5px
      if (Math.abs(height - lastHeightRef.current) < 5) return;
      if (height < 100) return;

      lastHeightRef.current = height;

      window.parent.postMessage({ type: 'IFRAME_HEIGHT', height }, '*');
    };

    // Send height after page renders
    const t1 = setTimeout(sendHeight, 100);
    const t2 = setTimeout(sendHeight, 300);
    const t3 = setTimeout(sendHeight, 600);
    const t4 = setTimeout(sendHeight, 1000);

    // Only listen for clicks on stage arrow buttons
    const handleClick = (e) => {
      // Check if clicked element or its parent has the stage-arrow-btn class
      const target = e.target.closest('.stage-arrow-btn');
      if (target) {
        // Reset last height to force sending new height
        lastHeightRef.current = 0;
        setTimeout(sendHeight, 150);
        setTimeout(sendHeight, 400);
      }
    };

    document.addEventListener('click', handleClick);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      document.removeEventListener('click', handleClick);
    };
  }, [pathname]);

  return null;
}

