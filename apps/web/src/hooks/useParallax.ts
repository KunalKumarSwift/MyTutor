import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from './usePrefersReducedMotion';

/**
 * Lightweight decorative parallax: translates layers by a fraction of the scroll offset.
 * - One passive scroll listener, coalesced to one write per animation frame.
 * - Transform-only (compositor friendly); stops updating once the section is off screen.
 * - Disabled for reduced motion, small screens and coarse pointers (typical low-end phones).
 */
export function useParallax<T extends HTMLElement>() {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || prefersReducedMotion()) return;
    const constrained =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(max-width: 767px), (pointer: coarse)').matches;
    if (constrained) return;

    const layers = Array.from(container.querySelectorAll<HTMLElement>('[data-parallax-speed]'));
    if (layers.length === 0) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = container.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const offset = -rect.top;
      for (const layer of layers) {
        const speed = Number(layer.dataset['parallaxSpeed'] ?? 0);
        layer.style.transform = `translate3d(0, ${(offset * speed).toFixed(1)}px, 0)`;
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
      for (const layer of layers) layer.style.transform = '';
    };
  }, []);

  return containerRef;
}
