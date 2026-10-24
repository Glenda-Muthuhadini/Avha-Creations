import { useEffect } from 'react';

// Progressive enhancement: content remains visible if JS, motion or observers are unavailable.
export function useScrollReveal(root) {
  useEffect(() => {
    if (!root.current || !('IntersectionObserver' in window)) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const animations = new Set();
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        if (!preference.matches) {
          const animation = entry.target.animate([{ opacity: .5, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 650, easing: 'cubic-bezier(.2,.7,.3,1)' });
          animations.add(animation);
          animation.onfinish = () => animations.delete(animation);
        }
        observer.unobserve(entry.target);
      }
    }, { threshold: .08 });
    root.current.querySelectorAll('.campaign-section, .campaign-story, .social-gallery, .campaign-contact').forEach(element => observer.observe(element));
    const stopMotion = () => { if (preference.matches) animations.forEach(animation => animation.cancel()); };
    preference.addEventListener('change', stopMotion);
    return () => { observer.disconnect(); preference.removeEventListener('change', stopMotion); animations.forEach(animation => animation.cancel()); };
  }, [root]);
}
