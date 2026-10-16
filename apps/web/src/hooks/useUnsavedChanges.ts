import { useEffect } from 'react';
import { useBlocker } from 'react-router';

/**
 * Warns before leaving a form with unsaved edits — both in-app navigation (returns a blocker
 * to drive a confirm dialog) and tab close/reload (native browser prompt).
 */
export function useUnsavedChanges(dirty: boolean) {
  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty && currentLocation.pathname !== nextLocation.pathname);

  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  return blocker;
}
