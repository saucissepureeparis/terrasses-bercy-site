/* Les Terrasses Bercy — Script partagé v2
   Animations modernes : split text, cursor follower, magnetic buttons, parallax,
   reveal au scroll, nav scroll, menu mobile, sélecteur de langue */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // ========================================================================
  // Nav : ombre / glassmorphism au scroll
  // ========================================================================
  const nav = document.querySelector('.nav');
  const onScroll = () => {
    if (!nav) return;
    if (window.scrollY > 30) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ========================================================================
  // Menu mobile burger
  // ========================================================================
  const burger = document.querySelector('.nav-burger');
  const links = document.querySelector('.nav-links');
  if (burger && links) {
    burger.addEventListener('click', () => {
      const isOpen = burger.classList.toggle('open');
      links.classList.toggle('open', isOpen);
      burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        burger.classList.remove('open');
        links.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // ========================================================================
  // Sélecteur de langue
  // ========================================================================
  const langSwitcher = document.querySelector('.lang-switcher');
  const langToggle = document.querySelector('.lang-toggle');
  if (langSwitcher && langToggle) {
    langToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = langSwitcher.classList.toggle('open');
      langToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', (e) => {
      if (!langSwitcher.contains(e.target)) {
        langSwitcher.classList.remove('open');
        langToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ========================================================================
  // Split text — wrap chaque mot du h1 du hero pour révélation animée
  // ========================================================================
  const heroH1 = document.querySelector('.hero h1');
  if (heroH1 && !prefersReducedMotion) {
    const text = heroH1.textContent.trim();
    const words = text.split(/\s+/);
    heroH1.innerHTML = words
      .map(word => `<span class="split-word"><span>${word}</span></span>`)
      .join(' ');
    // Force un reflow puis déclenche l'animation
    void heroH1.offsetWidth;
    setTimeout(() => {
      heroH1.querySelectorAll('.split-word').forEach(w => w.classList.add('in'));
    }, 80);
  } else if (heroH1 && prefersReducedMotion) {
    // Pas d'animation : on garde le texte tel quel
    heroH1.style.opacity = '1';
  }

  // ========================================================================
  // Reveal au scroll (IntersectionObserver)
  // ========================================================================
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('visible'));
  }

  // ========================================================================
  // Parallax doux sur le hero-bg
  // ========================================================================
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg && !prefersReducedMotion) {
    let ticking = false;
    const updateParallax = () => {
      const y = window.scrollY;
      if (y < window.innerHeight) {
        heroBg.style.transform = `translate3d(0, ${y * 0.32}px, 0)`;
      }
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
  }

  // ========================================================================
  // Cursor follower (desktop, pointer fin uniquement)
  // ========================================================================
  if (isFinePointer && !prefersReducedMotion) {
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');

    if (dot && ring) {
      let mouseX = window.innerWidth / 2;
      let mouseY = window.innerHeight / 2;
      let dotX = mouseX, dotY = mouseY;
      let ringX = mouseX, ringY = mouseY;

      window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
      });

      const animateCursor = () => {
        // Le dot suit instantanément, le ring lerp en douceur
        dotX += (mouseX - dotX) * 0.85;
        dotY += (mouseY - dotY) * 0.85;
        ringX += (mouseX - ringX) * 0.18;
        ringY += (mouseY - ringY) * 0.18;
        dot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;
        ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
        requestAnimationFrame(animateCursor);
      };
      animateCursor();

      // État hover sur les éléments interactifs
      const hoverables = document.querySelectorAll('a, button, summary, .feature-card, .spot, .privat-card, [role="menuitem"]');
      hoverables.forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
      });
    }
  }

  // ========================================================================
  // Magnetic buttons : léger effet d'attraction au survol
  // ========================================================================
  if (isFinePointer && !prefersReducedMotion) {
    const magneticBtns = document.querySelectorAll('.btn, .nav-phone');
    magneticBtns.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.22}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  // ========================================================================
  // Galerie : lightbox simple
  // ========================================================================
  const galleryItems = document.querySelectorAll('.gallery-item');
  if (galleryItems.length) {
    // Construit le DOM lightbox une seule fois
    const lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Galerie photo');
    lb.innerHTML = `
      <button class="lightbox-close" aria-label="Fermer">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      <button class="lightbox-prev" aria-label="Précédent">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <img class="lightbox-img" alt="">
      <button class="lightbox-next" aria-label="Suivant">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    `;
    document.body.appendChild(lb);
    const lbImg = lb.querySelector('.lightbox-img');
    const sources = [...galleryItems].map(it => {
      const img = it.querySelector('img');
      return { src: img?.src || '', alt: img?.alt || '' };
    });
    let current = 0;
    const open = (i) => {
      current = i;
      lbImg.src = sources[i].src;
      lbImg.alt = sources[i].alt;
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    };
    const close = () => {
      lb.classList.remove('open');
      document.body.style.overflow = '';
    };
    const next = () => open((current + 1) % sources.length);
    const prev = () => open((current - 1 + sources.length) % sources.length);
    galleryItems.forEach((item, i) => {
      item.addEventListener('click', () => open(i));
    });
    lb.querySelector('.lightbox-close').addEventListener('click', close);
    lb.querySelector('.lightbox-next').addEventListener('click', next);
    lb.querySelector('.lightbox-prev').addEventListener('click', prev);
    lb.addEventListener('click', (e) => {
      if (e.target === lb) close();
    });
    document.addEventListener('keydown', (e) => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    });
  }

  // ========================================================================
  // Année dynamique footer
  // ========================================================================
  const y = document.querySelector('.year');
  if (y) y.textContent = new Date().getFullYear();
})();
