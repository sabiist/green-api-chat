import { useCallback, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';

import { useLocalStorage } from '@/hooks/useLocalStorage';
import { clampSidebarWidth } from '@/lib/utils';

export function useSidebar() {
  const [storedWidth, setStoredWidth] = useLocalStorage<number>('sidebarWidth', 360);
  const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage<boolean>(
    'sidebarCollapsed',
    false,
  );
  const sidebarRef = useRef<HTMLElement | null>(null);
  const [sidebarResizing, setSidebarResizing] = useState(false);

  const sidebarWidth = clampSidebarWidth(storedWidth);

  const setSidebarWidth = useCallback(
    (width: number) => setStoredWidth(clampSidebarWidth(width)),
    [setStoredWidth],
  );

  const startSidebarResize = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      event.preventDefault();

      const aside = sidebarRef.current;
      if (!aside) return;

      const startX = event.clientX;
      const startWidth = sidebarWidth;

      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      const onMove = (moveEvent: MouseEvent) => {
        aside.style.width = `${clampSidebarWidth(startWidth + moveEvent.clientX - startX)}px`;
      };

      const onUp = (upEvent: MouseEvent) => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        setSidebarResizing(false);
        setSidebarWidth(startWidth + upEvent.clientX - startX);
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      setSidebarResizing(true);
    },
    [sidebarWidth, setSidebarWidth],
  );

  return {
    sidebarRef,
    sidebarWidth,
    sidebarCollapsed,
    setSidebarCollapsed,
    sidebarResizing,
    startSidebarResize,
  };
}
