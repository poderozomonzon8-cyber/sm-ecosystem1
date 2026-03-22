import { useEffect } from 'react';

export function useScrollLock(open: boolean) {
  useEffect(() => {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (open) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.documentElement.style.overflow = '';
    };
  }, [open]);
}

