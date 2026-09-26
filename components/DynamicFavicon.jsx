'use client';

import { useEffect } from 'react';

/**
 * DynamicFavicon
 * Automatically synchronizes the browser tab icon with the gang logo (settings.logoUrl).
 * Dynamically updates DOM <link rel="icon"> tags on client mount to bypass aggressive browser caching.
 */
export default function DynamicFavicon({ logoUrl }) {
  useEffect(() => {
    if (!logoUrl || typeof document === 'undefined') return;

    try {
      // Find existing icon link tags or create a primary one
      const existingIcons = document.querySelectorAll("link[rel*='icon']");
      if (existingIcons.length > 0) {
        existingIcons.forEach(link => {
          link.href = logoUrl;
        });
      } else {
        const link = document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        link.href = logoUrl;
        document.getElementsByTagName('head')[0].appendChild(link);
      }

      // Also ensure apple-touch-icon is updated
      const appleIcon = document.querySelector("link[rel='apple-touch-icon']");
      if (appleIcon) {
        appleIcon.href = logoUrl;
      }
    } catch (e) {
      console.warn('Failed to dynamically update favicon:', e);
    }
  }, [logoUrl]);

  return null;
}
