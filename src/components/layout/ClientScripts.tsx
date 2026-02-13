'use client';

import { useEffect } from 'react';

export default function ClientScripts() {
  useEffect(() => {
    // Mobile navigation toggle
    const toggle = document.getElementById('navToggle');
    const nav = document.getElementById('nav');
    const header = document.getElementById('header');

    const handleToggle = () => {
      nav?.classList.toggle('is-open');
      toggle?.classList.toggle('is-active');
    };

    toggle?.addEventListener('click', handleToggle);

    // Header scroll behavior
    let lastScroll = 0;
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY > 50) {
        header?.classList.add('is-scrolled');
      } else {
        header?.classList.remove('is-scrolled');
      }
      lastScroll = scrollY;
    };

    window.addEventListener('scroll', handleScroll);

    // Intersection Observer for fade-in animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.fade-in, .fade-in-delay-1, .fade-in-delay-2, .stagger-children').forEach((el) => {
      observer.observe(el);
    });

    // Cleanup
    return () => {
      toggle?.removeEventListener('click', handleToggle);
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  return null;
}
