import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from './usePrefersReducedMotion';

/**
 * Fades/slides an element in the first time it enters the viewport.
 * One shared IntersectionObserver serves every revealed element on the page.
 * Content is never hidden when motion is reduced, the observer is unavailable,
 * or the element is already on screen at mount.
 */
let observer: IntersectionObserver | null = null;

function getObserver(): IntersectionObserver | null {
  if (typeof IntersectionObserver === 'undefined') return null;
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).dataset['reveal'] = 'visible';
          observer?.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  return observer;
}

export function useReveal<T extends HTMLElement>(index = 0) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    const io = getObserver();
    if (!el || !io || prefersReducedMotion()) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) return; // Already visible: no animation needed.
    // Cap the stagger so long lists never make users wait.
    el.style.setProperty('--reveal-delay', `${Math.min(index, 5) * 60}ms`);
    el.dataset['reveal'] = 'armed';
    io.observe(el);
    return () => {
      io.unobserve(el);
      if (el.dataset['reveal'] === 'armed') el.dataset['reveal'] = 'visible';
    };
  }, [index]);

  return ref;
}
