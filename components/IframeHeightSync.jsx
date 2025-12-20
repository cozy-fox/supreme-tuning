'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Simple iframe height sync - sends height once after page loads
 * No observers, no intervals - prevents infinite loops
 */
export default function IframeHeightSync() {
  const pathname = usePathname();

  useEffect(() => {
    // Check if we're in an iframe
    if (window.self === window.top) return;

    let sent = false;

    const sendHeight = () => {
      if (sent) return;

      // Use body.scrollHeight but cap it at a reasonable value
      const height = Math.min(document.body.scrollHeight, 3000);

      if (height > 100) {
        sent = true;
        window.parent.postMessage({ type: 'IFRAME_HEIGHT', height }, '*');
      }
    };

    // Send after content has rendered
    const t1 = setTimeout(sendHeight, 500);
    const t2 = setTimeout(sendHeight, 1500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [pathname]);

  return null;
}

