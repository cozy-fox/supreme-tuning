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
      const root = document.getElementById('root');
      const header = document.querySelector('header');

      let totalHeight = 0;

      if (header) {
        totalHeight += header.offsetHeight;
      }

      if (root) {
        totalHeight += root.offsetHeight;
      }

      return totalHeight + 20; // small padding
    };

    const sendHeight = () => {
      const height = getHeight();

      // Only send if height actually changed
      if (height === lastHeightRef.current) return;
      if (height < 100) return;

      lastHeightRef.current = height;

      window.parent.postMessage({ type: 'IFRAME_HEIGHT', height }, '*');
    };

    // Send height after page renders
    const t1 = setTimeout(sendHeight, 100);
    const t2 = setTimeout(sendHeight, 300);
    const t3 = setTimeout(sendHeight, 600);
    const t4 = setTimeout(sendHeight, 1000);

    // Listen for click events to recalculate height after interactions
    const handleClick = () => {
      setTimeout(sendHeight, 100);
      setTimeout(sendHeight, 300);
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

