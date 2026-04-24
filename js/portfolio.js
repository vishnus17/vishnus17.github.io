(function () {
  'use strict';

  // Typed role animation
  const roles = [
    'Cloud Engineer',
    'DevOps Engineer',
    'AWS Community Builder',
    'Infrastructure Automator',
    'Open Source Contributor'
  ];

  const typedEl = document.getElementById('typed');
  if (typedEl) {
    let roleIdx = 0;
    let charIdx = 0;
    let deleting = false;

    function tick() {
      const current = roles[roleIdx];
      if (deleting) {
        charIdx--;
        typedEl.textContent = current.substring(0, charIdx);
        if (charIdx === 0) {
          deleting = false;
          roleIdx = (roleIdx + 1) % roles.length;
          setTimeout(tick, 400);
          return;
        }
        setTimeout(tick, 35);
      } else {
        charIdx++;
        typedEl.textContent = current.substring(0, charIdx);
        if (charIdx === current.length) {
          deleting = true;
          setTimeout(tick, 1800);
          return;
        }
        setTimeout(tick, 70);
      }
    }
    tick();
  }

  // Mobile nav
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
    links.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => links.classList.remove('open'))
    );
  }

  // Scroll reveal
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  // Nav shadow on scroll
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => {
      if (window.scrollY > 10) nav.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
      else nav.style.boxShadow = 'none';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
