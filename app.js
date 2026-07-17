/* =========================================================
   Dalia Hossam Esmat — Portfolio
   Vanilla JS: loads content.json, renders DOM, runs animations
   ========================================================= */
(function () {
  'use strict';

  /* ---------------- Icon library (lucide-react equivalents) ---------------- */
  const ICONS = {
    search:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    lightbulb:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26A7 7 0 0 0 12 2z"/></svg>',
    pencil:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z"/></svg>',
    scissors:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>',
    code:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/></svg>',
    send:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4Z"/></svg>',
  };

  /* ---------------- Utilities ---------------- */
  const esc = (s) =>
    String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));

  const get = (obj, path) =>
    String(path).split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);

  const PROJECTS_INITIAL = 3;

  /* ---------------- Scroll progress bar ---------------- */
  function initScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;
    const update = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const w = h > 0 ? (window.scrollY / h) * 100 : 0;
      bar.style.width = w + '%';
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------------- Scroll reveal (IntersectionObserver) ---------------- */
  function initReveal() {
    const els = document.querySelectorAll(
      '.reveal:not(.in-view), .reveal[data-stagger]:not(.in-view)'
    );
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in-view'));
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
    );
    els.forEach((el) => obs.observe(el));
  }

  /* ---------------- Stagger animation delays ---------------- */
  function applyStaggerDelays() {
    document.querySelectorAll('[data-stagger]').forEach((group) => {
      const step = parseInt(group.getAttribute('data-stagger-step') || '80', 10);
      const base = parseInt(group.getAttribute('data-stagger-base') || '0', 10);
      Array.from(group.children).forEach((child, i) => {
        child.style.transitionDelay = base + i * step + 'ms';
      });
    });
  }

  /* ---------------- Project placeholder SVG (shown when no image / image fails) ---------------- */
  function projectPlaceholder(n, category) {
    const id = 'p' + String(n).replace(/[^a-z0-9]/gi, '');
    return (
      '<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
      '<defs>' +
      '<linearGradient id="bg-' + id + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="#2a2522"/>' +
      '<stop offset="100%" stop-color="#14110f"/>' +
      '</linearGradient>' +
      '<radialGradient id="glow-' + id + '" cx="50%" cy="50%" r="60%">' +
      '<stop offset="0%" stop-color="rgba(214,58,58,0.18)"/>' +
      '<stop offset="100%" stop-color="rgba(214,58,58,0)"/>' +
      '</radialGradient>' +
      '<pattern id="dots-' + id + '" x="0" y="0" width="18" height="18" patternUnits="userSpaceOnUse">' +
      '<circle cx="2" cy="2" r="0.7" fill="rgba(255,255,255,0.08)"/>' +
      '</pattern>' +
      '</defs>' +
      '<rect width="400" height="300" fill="url(#bg-' + id + ')"/>' +
      '<rect width="400" height="300" fill="url(#glow-' + id + ')"/>' +
      '<rect width="400" height="300" fill="url(#dots-' + id + ')"/>' +
      // Garment sketch silhouette
      '<g transform="translate(200 150)" stroke="rgba(214,58,58,0.45)" stroke-width="1.1" fill="none" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M-38 -78 L38 -78 L46 -52 L52 82 L-52 82 L-46 -52 Z"/>' +
      '<path d="M-18 -78 C-13 -60 -8 -42 0 -32 C8 -42 13 -60 18 -78"/>' +
      '<line x1="0" y1="-32" x2="0" y2="82" stroke-dasharray="2 4" opacity="0.5"/>' +
      '<circle cx="0" cy="-5" r="1.6" fill="rgba(214,58,58,0.7)"/>' +
      '<circle cx="0" cy="18" r="1.6" fill="rgba(214,58,58,0.7)"/>' +
      '<circle cx="0" cy="41" r="1.6" fill="rgba(214,58,58,0.7)"/>' +
      // Stitch line at hem
      '<path d="M-52 60 Q0 66 52 60" stroke-dasharray="2 4" opacity="0.4"/>' +
      '</g>' +
      // Big italic number watermark
      '<text x="200" y="210" text-anchor="middle" ' +
      'font-family="Playfair Display, Georgia, serif" font-size="130" font-style="italic" font-weight="900" ' +
      'fill="rgba(214,58,58,0.14)">' + esc(n) + '</text>' +
      // Tiny category label
      (category
        ? '<text x="200" y="40" text-anchor="middle" ' +
          'font-family="Inter, sans-serif" font-size="9" letter-spacing="3" ' +
          'fill="rgba(247,244,242,0.35)" font-weight="600">' + esc(category.toUpperCase()) + '</text>'
        : '') +
      '</svg>'
    );
  }

  /* ---------------- Renderers ---------------- */
  function renderStats(items) {
    const root = document.querySelector('[data-stats]');
    if (!root || !Array.isArray(items)) return;
    root.innerHTML = items
      .map(
        (s) =>
          '<div class="stat">' +
          '<div class="stat-n">' + esc(s.n) + '</div>' +
          '<div class="stat-label">' + esc(s.label) + '</div>' +
          '</div>'
      )
      .join('');
  }

  /* ---------------- Normalize a project's images ----------------
     Accepts either an `images` array (preferred) or a single `image`
     string for backward compatibility. Returns up to 5 trimmed strings. */
  function normalizeImages(p) {
    let raw = [];
    if (Array.isArray(p.images)) raw = p.images;
    else if (p.image && String(p.image).trim()) raw = [p.image];
    return raw
      .map((s) => String(s || '').trim())
      .filter(Boolean)
      .slice(0, 5);
  }

  function renderProjects(items) {
    const root = document.querySelector('[data-projects]');
    const toggle = document.getElementById('projects-toggle');
    const counter = document.querySelector('[data-projects-count]');
    if (!root || !Array.isArray(items)) return;

    // Cache for the click-to-open-lightbox handler
    currentProjects = items;

    // Wire the click handler once — opens the lightbox for the clicked card
    if (!root._clickWired) {
      root.addEventListener('click', (e) => {
        // Don't open if the click came from an interactive child (arrow etc.)
        if (e.target.closest('a, button')) return;
        const card = e.target.closest('.project-card');
        if (!card) return;
        const idx = parseInt(card.getAttribute('data-index'), 10);
        if (isNaN(idx)) return;
        const project = currentProjects[idx];
        if (!project) return;
        const images = normalizeImages(project);
        if (!images.length) return;
        // Start from the currently visible photo (in case the user clicked mid-slideshow)
        const activeIdx = Array.from(card.querySelectorAll('.project-card-img'))
          .findIndex((img) => img.classList.contains('is-active'));
        lightbox.open(project, images, activeIdx >= 0 ? activeIdx : 0);
      });
      root._clickWired = true;
    }

    const total = items.length;
    const initial = Math.min(PROJECTS_INITIAL, total);

    root.innerHTML = items
      .map((p, i) => {
        const isExtra = i >= initial ? ' is-extra' : '';
        const images = normalizeImages(p);
        const photoCount = images.length;

        // Stack of images — first visible, rest faded in on hover
        const stackHtml =
          '<div class="project-card-images">' +
          images
            .map(
              (src, idx) =>
                '<img class="project-card-img' + (idx === 0 ? ' is-active' : '') + '"' +
                ' src="' + esc(src) + '"' +
                ' alt="' + esc(p.title) + (photoCount > 1 ? ' — photo ' + (idx + 1) : '') + '"' +
                ' loading="lazy"' +
                ' data-idx="' + idx + '">'
            )
            .join('') +
          '</div>';

        // Counter + dot indicators (only when 2+ photos)
        const meta =
          photoCount > 1
            ? '<span class="project-card-count" aria-label="' + photoCount + ' photos">' +
              '<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="6" width="20" height="14" rx="2"/><circle cx="12" cy="13" r="3"/><path d="M8 6l1.5-2h5L16 6"/></svg>' +
              '<span class="project-card-count-num">1</span>' +
              '<span class="project-card-count-sep">/</span>' +
              '<span class="project-card-count-total">' + photoCount + '</span>' +
              '</span>' +
              '<div class="project-card-dots" aria-hidden="true">' +
              images
                .map(
                  (_, idx) =>
                    '<span class="project-card-dot' + (idx === 0 ? ' is-active' : '') + '" data-idx="' + idx + '"></span>'
                )
                .join('') +
              '</div>'
            : '';

        return (
          '<article class="project-card' + isExtra + '" data-index="' + i + '">' +
          '<div class="project-card-media" data-photo-count="' + photoCount + '">' +
          stackHtml +
          '<div class="project-card-placeholder">' + projectPlaceholder(p.n, p.category) + '</div>' +
          (p.category ? '<span class="project-card-category">' + esc(p.category) + '</span>' : '') +
          meta +
          '<div class="project-card-tag">' + esc(p.tag) + '</div>' +
          '</div>' +
          '<div class="project-card-meta">' +
          '<div class="project-card-info">' +
          '<div class="num">' + esc(p.n) + '</div>' +
          '<h3>' + esc(p.title) + '</h3>' +
          '<p>' + esc(p.desc) + '</p>' +
          '</div>' +
          '<svg class="project-card-arrow" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>' +
          '</div>' +
          '</article>'
        );
      })
      .join('');

    // Wire up per-card hover slideshow
    setupProjectSlideshow(root);

    // If any image fails to load, remove it from its stack
    root.querySelectorAll('.project-card-img').forEach((img) => {
      img.addEventListener('error', () => {
        const wasActive = img.classList.contains('is-active');
        img.remove();
        // If the active image was removed, promote the next remaining one
        if (wasActive) {
          const stack = img.parentElement;
          const next = stack && stack.querySelector('.project-card-img');
          if (next) next.classList.add('is-active');
        }
        // Update count/dots after removal
        const media = img.closest('.project-card-media');
        if (media) refreshProjectMeta(media);
      });
    });

    // Update count badge
    if (counter) {
      counter.textContent = 'Showing ' + initial + ' of ' + total;
    }

    // Hide button if total <= initial
    if (toggle) {
      if (total <= initial) {
        toggle.parentElement.style.display = 'none';
      } else {
        toggle.parentElement.style.display = '';
        toggle.setAttribute('aria-expanded', 'false');
        const text = toggle.querySelector('[data-view-text]');
        if (text) text.textContent = 'View All ' + total + ' Projects';
        toggle.onclick = () => {
          const expanded = toggle.getAttribute('aria-expanded') === 'true';
          const next = !expanded;
          toggle.setAttribute('aria-expanded', String(next));
          root.classList.toggle('is-expanded', next);
          if (text) text.textContent = next ? 'Show Less' : 'View All ' + total + ' Projects';
          if (counter) counter.textContent = 'Showing ' + (next ? total : initial) + ' of ' + total;
          if (!next) {
            root.querySelectorAll('.is-extra').forEach((c) => {
              c.style.animation = 'none';
              void c.offsetWidth;
              c.style.animation = '';
            });
            const section = document.getElementById('projects');
            if (section) {
              const top = section.getBoundingClientRect().top + window.scrollY - 80;
              window.scrollTo({ top, behavior: 'smooth' });
            }
          }
        };
      }
    }
  }

  /* ---------------- Hover slideshow for project cards ---------------- */
  function setupProjectSlideshow(root) {
    const cards = root.querySelectorAll('.project-card-media');
    const isCoarse = window.matchMedia('(pointer: coarse)').matches;

    cards.forEach((media) => {
      const imgs = () => Array.from(media.querySelectorAll('.project-card-img'));
      if (imgs().length < 2) return;

      let current = 0;
      let timer = null;
      const interval = 1400;

      const setActive = (i) => {
        const all = imgs();
        all.forEach((img, idx) => img.classList.toggle('is-active', idx === i));
        const num = media.querySelector('.project-card-count-num');
        if (num) num.textContent = i + 1;
        media.querySelectorAll('.project-card-dot').forEach((d, idx) =>
          d.classList.toggle('is-active', idx === i)
        );
      };

      const start = () => {
        if (timer) return;
        if (isCoarse) return; // skip on touch
        timer = setInterval(() => {
          const all = imgs();
          if (all.length < 2) return stop();
          current = (current + 1) % all.length;
          setActive(current);
        }, interval);
      };

      const stop = () => {
        if (timer) clearInterval(timer);
        timer = null;
        current = 0;
        setActive(0);
      };

      // Pause when tab is hidden so it doesn't burn cycles offscreen
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          if (timer) { clearInterval(timer); timer = null; }
        }
      });

      media.addEventListener('mouseenter', start);
      media.addEventListener('mouseleave', stop);
      // Also support keyboard focus for accessibility
      media.parentElement.addEventListener('focusin', start);
      media.parentElement.addEventListener('focusout', stop);
    });
  }

  function refreshProjectMeta(media) {
    const imgs = media.querySelectorAll('.project-card-img');
    const count = imgs.length;
    media.setAttribute('data-photo-count', String(count));
    const num = media.querySelector('.project-card-count-num');
    const total = media.querySelector('.project-card-count-total');
    if (num) num.textContent = imgs.length ? (Array.from(imgs).findIndex((i) => i.classList.contains('is-active')) + 1 || 1) : 0;
    if (total) total.textContent = count;
  }

  /* ---------------- Project Lightbox ---------------- */
  const lightbox = {
    el: null,
    img: null,
    counter: null,
    titleEl: null,
    categoryEl: null,
    dotsEl: null,
    isOpen: false,
    currentIndex: 0,
    images: [],
    project: null,
    touchStartX: 0,

    init() {
      this.el = document.getElementById('lightbox');
      if (!this.el) return;
      this.img = this.el.querySelector('[data-lightbox-image]');
      this.counter = this.el.querySelector('[data-lightbox-counter]');
      this.titleEl = this.el.querySelector('[data-lightbox-title]');
      this.categoryEl = this.el.querySelector('[data-lightbox-category]');
      this.dotsEl = this.el.querySelector('[data-lightbox-dots]');

      // Close handlers (backdrop + X button)
      this.el.querySelectorAll('[data-lightbox-close]').forEach((el) => {
        el.addEventListener('click', () => this.close());
      });

      // Nav arrows
      this.el.querySelectorAll('[data-lightbox-nav]').forEach((el) => {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          const dir = parseInt(el.getAttribute('data-lightbox-nav'), 10) || 0;
          this.navigate(dir);
        });
      });

      // Click on the image area: left half = prev, right half = next
      const wrap = this.el.querySelector('.lightbox-image-wrap');
      if (wrap) {
        wrap.addEventListener('click', (e) => {
          if (this.images.length <= 1) return;
          const rect = wrap.getBoundingClientRect();
          const x = e.clientX - rect.left;
          this.navigate(x > rect.width / 2 ? 1 : -1);
        });
      }

      // Keyboard
      document.addEventListener('keydown', (e) => {
        if (!this.isOpen) return;
        if (e.key === 'Escape') { this.close(); }
        else if (e.key === 'ArrowLeft') { this.navigate(-1); }
        else if (e.key === 'ArrowRight') { this.navigate(1); }
      });

      // Touch swipe
      this.el.addEventListener(
        'touchstart',
        (e) => { this.touchStartX = e.touches[0].clientX; },
        { passive: true }
      );
      this.el.addEventListener(
        'touchend',
        (e) => {
          const diff = this.touchStartX - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 50) this.navigate(diff > 0 ? 1 : -1);
        },
        { passive: true }
      );
    },

    open(project, images, startIndex) {
      if (!this.el || !images || !images.length) return;
      this.project = project;
      this.images = images;
      this.currentIndex = Math.max(0, Math.min(startIndex || 0, images.length - 1));
      this.el.classList.add('open');
      this.el.classList.toggle('is-single', images.length <= 1);
      this.el.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lightbox-open');
      this.isOpen = true;
      this.update();
    },

    close() {
      if (!this.el) return;
      this.el.classList.remove('open');
      this.el.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('lightbox-open');
      this.isOpen = false;
    },

    navigate(dir) {
      if (!this.images || this.images.length <= 1) return;
      const len = this.images.length;
      this.currentIndex = (this.currentIndex + dir + len) % len;
      this.update();
    },

    update() {
      const src = this.images[this.currentIndex];

      // Preload next image for smoother transition
      this.img.classList.remove('is-loaded');
      const pre = new Image();
      pre.onload = () => {
        this.img.src = src;
        // give the browser a frame to apply the new src, then fade in
        requestAnimationFrame(() => this.img.classList.add('is-loaded'));
      };
      pre.onerror = () => {
        this.img.src = src;
        this.img.classList.add('is-loaded');
      };
      pre.src = src;

      this.img.alt = (this.project && this.project.title ? this.project.title : 'Project') +
        ' — photo ' + (this.currentIndex + 1) + ' of ' + this.images.length;

      this.counter.textContent = (this.currentIndex + 1) + ' / ' + this.images.length;

      if (this.project) {
        this.titleEl.textContent = this.project.title || '';
        this.categoryEl.textContent = this.project.category || '';
      }

      // Dots
      this.dotsEl.innerHTML = this.images
        .map((_, i) =>
          '<button type="button" class="lightbox-dot' + (i === this.currentIndex ? ' is-active' : '') + '"' +
          ' data-lightbox-dot="' + i + '"' +
          ' aria-label="Go to photo ' + (i + 1) + '"></button>'
        )
        .join('');
      this.dotsEl.querySelectorAll('[data-lightbox-dot]').forEach((dot) => {
        dot.addEventListener('click', (e) => {
          e.stopPropagation();
          this.currentIndex = parseInt(dot.getAttribute('data-lightbox-dot'), 10) || 0;
          this.update();
        });
      });
    },
  };

  /* Store the current projects list so the click handler can look up
     the project for a clicked card. */
  let currentProjects = [];

  function renderExperience(items) {
    const root = document.querySelector('[data-experience]');
    if (!root || !Array.isArray(items)) return;
    root.innerHTML = items
      .map(
        (e) =>
          '<article class="experience-item">' +
          '<div class="experience-year">' +
          '<span class="experience-year-num">' + esc(e.year) + '</span>' +
          (e.tag ? '<span class="experience-year-tag">' + esc(e.tag) + '</span>' : '') +
          '</div>' +
          '<div class="experience-content">' +
          '<h3>' + esc(e.title) + '</h3>' +
          '<p>' + esc(e.desc) + '</p>' +
          (e.link && e.link.url
            ? '<a href="' + esc(e.link.url) + '" target="_blank" rel="noopener">' +
              esc(e.link.text || e.link.url) +
              ' <span aria-hidden="true">↗</span></a>'
            : '') +
          '</div>' +
          '</article>'
      )
      .join('');
  }

  function renderEducation(items) {
    const root = document.querySelector('[data-education]');
    if (!root || !Array.isArray(items)) return;
    root.innerHTML = items
      .map(
        (e) =>
          '<div class="edu-item">' +
          '<div>' +
          '<div class="edu-title">' + esc(e.title) + '</div>' +
          '<div class="edu-inst">' + esc(e.institution) + '</div>' +
          (e.grade ? '<div class="edu-grade">' + esc(e.grade) + '</div>' : '') +
          '</div>' +
          '<div class="edu-date">' + esc(e.date) + '</div>' +
          '</div>'
      )
      .join('');
  }

  function renderSkills(skills) {
    const root = document.querySelector('[data-skills]');
    if (!root || !skills) return;

    if (Array.isArray(skills.groups)) {
      root.innerHTML = skills.groups
        .map((g) => {
          const items = (g.items || [])
            .map((s) => '<span class="skill">' + esc(s) + '</span>')
            .join('');
          return (
            '<div class="skills-group">' +
            '<div class="skills-group-label">' + esc(g.label) + '</div>' +
            '<div class="skills-list">' + items + '</div>' +
            '</div>'
          );
        })
        .join('');
    } else if (Array.isArray(skills)) {
      root.innerHTML = '<div class="skills-list">' +
        skills.map((s) => '<span class="skill">' + esc(s) + '</span>').join('') +
        '</div>';
    }
  }

  function renderProcess(items) {
    const root = document.querySelector('[data-process]');
    if (!root || !Array.isArray(items)) return;
    root.innerHTML = items
      .map(
        (p) =>
          '<li class="process-item">' +
          '<div class="process-num">' + esc(p.n) + '</div>' +
          '<div class="process-icon">' + (ICONS[p.icon] || ICONS.search) + '</div>' +
          '<div class="process-body">' +
          '<div class="process-title">' + esc(p.title) + '</div>' +
          '<p>' + esc(p.desc) + '</p>' +
          '</div>' +
          '</li>'
      )
      .join('');
  }

  function renderSoftSkills(items) {
    const root = document.querySelector('[data-soft-skills]');
    if (!root || !Array.isArray(items)) return;
    root.innerHTML = items
      .map((s) => '<span class="soft-skill">' + esc(s) + '</span>')
      .join('');
  }

  /* ---------------- Portrait (replace fallback with real photo) ---------------- */
  function setPortrait(slot, src) {
    const el = document.querySelector('[data-portrait-slot="' + slot + '"]');
    if (!el || !src || !String(src).trim()) return;
    const frame = el.querySelector('.portrait-frame');
    if (!frame) return;
    const fallback = frame.querySelector('.portrait-fallback');
    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Portrait of Dalia Hossam Esmat';
    img.loading = 'eager';
    img.onerror = () => {
      img.remove();
      if (fallback) fallback.style.display = '';
    };
    img.onload = () => {
      if (fallback) fallback.style.display = 'none';
    };
    frame.insertBefore(img, frame.firstChild);
  }

  /* ---------------- Apply [data-bind] text replacements ---------------- */
  function applyBinds(data) {
    document.querySelectorAll('[data-bind]').forEach((el) => {
      const val = get(data, el.getAttribute('data-bind'));
      if (val != null) el.textContent = val;
    });
    document.querySelectorAll('[data-contact]').forEach((a) => {
      const key = a.getAttribute('data-contact');
      const prefix = a.getAttribute('data-prefix') || '';
      const val = get(data, 'contact.' + key);
      if (val) {
        const suffix = prefix === 'tel:' ? String(val).replace(/[^\d+]/g, '') : String(val);
        a.href = prefix + suffix;
      }
    });
  }

  /* ---------------- Subtle parallax on hero portrait + PORTFOLIO text ---------------- */
  function initParallax() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const portrait = document.querySelector('.hero-portrait');
    const backdrop = document.querySelector('.hero-backdrop span');
    const glow = document.querySelector('.hero-glow');
    if (!portrait && !backdrop && !glow) return;

    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      if (y > 0 && y < window.innerHeight) {
        const t = Math.min(1, y / window.innerHeight);
        if (portrait) portrait.style.transform = `translateY(${y * 0.12}px) scale(${1 - t * 0.04})`;
        if (backdrop) {
          backdrop.style.transform = `translateY(${8 - t * 4}%) scale(${1 + t * 0.02})`;
          backdrop.style.opacity = String(1 - t * 0.6);
        }
        if (glow) glow.style.opacity = String(0.7 - t * 0.5);
      } else {
        if (portrait) portrait.style.transform = '';
        if (backdrop) { backdrop.style.transform = ''; backdrop.style.opacity = ''; }
        if (glow) glow.style.opacity = '';
      }
      ticking = false;
    };

    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  /* ---------------- Magnetic effect on availability CTA ---------------- */
  function initMagnetic() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const cta = document.querySelector('.availability-cta');
    if (!cta) return;
    let rafId = null;
    cta.addEventListener('mousemove', (e) => {
      const rect = cta.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        cta.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
      });
    });
    cta.addEventListener('mouseleave', () => {
      if (rafId) cancelAnimationFrame(rafId);
      cta.style.transform = '';
    });
  }

  /* ---------------- Inline fallback data ----------------
     Used when content.json can't be loaded (e.g. file:// protocol).
     When the page is served over HTTP, content.json overrides this. */
  const FALLBACK = {
    profile: {
      name: 'Dalia Hossam Esmat',
      nameLine1: 'Dalia',
      nameLine2: 'Hossam',
      script: "Hello, I'm",
      role: 'Fashion Designer',
      tagline: 'Creative Portfolio',
      availability: 'Available for Freelance',
      summary:
        'Passionate Fashion Designer with a strong eye for creativity, detail, and emerging trends. Dedicated to creating unique designs that combine aesthetics, functionality, and innovation. Continuously exploring new ideas and techniques to deliver impactful and contemporary fashion experiences.',
      location: 'Cairo, Egypt',
      portrait: 'images/hero.jpg',
    },
    stats: [
      { n: '5+', label: 'Years Studying Fashion' },
      { n: '20+', label: 'Original Designs' },
      { n: '1', label: 'Founded Brand · Dibaj' },
    ],
    projects: [
      {
        n: '01',
        title: 'Couture Evening Gown',
        tag: 'SS · 26',
        category: 'Evening Wear',
        images: [
          'images/project-01-1.jpg',
          'images/project-01-2.jpg',
          'images/project-01-3.jpg',
          'images/project-01-4.jpg',
        ],
        desc:
          'Floor-length draped gown in silk crepe with hand-finished pleating and a sculpted bodice — designed for the runway and bespoke commissions.',
      },
      {
        n: '02',
        title: 'Tailored Wool Coat',
        tag: 'AW · 25',
        category: 'Outerwear',
        images: [
          'images/project-02-1.jpg',
          'images/project-02-2.jpg',
          'images/project-02-3.jpg',
        ],
        desc:
          'Double-breasted wool coat with a notched lapel, hand-stitched lining and mother-of-pearl buttons — a study in clean, lasting structure.',
      },
      {
        n: '03',
        title: 'Bridal Capsule',
        tag: 'SS · 26',
        category: 'Bridal',
        images: [
          'images/project-03-1.jpg',
          'images/project-03-2.jpg',
          'images/project-03-3.jpg',
          'images/project-03-4.jpg',
          'images/project-03-5.jpg',
        ],
        desc:
          'Three-piece bridal capsule built around a removable overskirt, beaded bodice and veil — engineered for a seamless ceremony-to-reception transition.',
      },
      {
        n: '04',
        title: 'Resort Capsule',
        tag: 'Summer · 25',
        category: 'Resort',
        images: ['images/project-04-1.jpg', 'images/project-04-2.jpg'],
        desc:
          'Light, sun-bleached palette with linen, cotton voile and hand-crocheted trims — a 6-look capsule built around movement and breathability.',
      },
      {
        n: '05',
        title: 'Streetwear Capsule',
        tag: 'FW · 25',
        category: 'Ready-to-Wear',
        image: 'images/project-05.jpg',
        desc:
          'Six-piece unisex capsule mixing technical nylons with heritage tailoring — a streetwear drop rooted in clean construction and quiet detail.',
      },
      {
        n: '06',
        title: 'Cocktail Collection',
        tag: 'Holiday · 25',
        category: 'Cocktail',
        image: 'images/project-06.jpg',
        desc:
          'Five short, sculpted cocktail dresses in duchess satin and crepe-back satin, each finished with a single statement seam down the centre back.',
      },
    ],
    experience: [
      {
        year: '2026',
        tag: 'Runway',
        title: 'Cairo Fashion Show 2026',
        desc:
          'Showcased original fashion designs on the Cairo Fashion Show 2026 runway, gaining hands-on experience in show production, styling and presentation.',
      },
      {
        year: '2024',
        tag: 'Training',
        title: 'Al Nasser Textile Factory',
        desc:
          'Completed a training program inside a working textile factory — garment production, fabric handling and quality control from the floor up.',
      },
      {
        year: '2023',
        tag: 'Founder',
        title: 'Dibaj Fashion — ديباج',
        desc:
          'Founded an online fashion brand on Instagram, curating pieces and managing design selection, marketing and customer relationships end to end.',
        link: { text: '@dibajfashion_', url: 'https://www.instagram.com/dibajfashion_' },
      },
    ],
    education: [
      {
        title: 'B.A. — Fashion Design',
        institution: 'Faculty of Applied Arts — Fashion Department, Helwan University',
        date: '2021 – 2026',
        grade: 'Overall Grade: Very Good',
      },
      {
        title: 'Motion Graphics Course',
        institution: 'Digital Egypt Pioneers Initiative (DEPI)',
        date: 'Oct 2024 – May 2025',
      },
    ],
    skills: {
      title: 'Technical Skills',
      groups: [
        { label: 'Adobe', items: ['Photoshop', 'Illustrator', 'After Effects'] },
        { label: '3D & AI', items: ['CLO 3D', 'AI-assisted design'] },
        {
          label: 'Fashion',
          items: [
            'Fashion Illustration',
            'Pattern Making',
            'Technical Drawing',
            'Garment Construction',
            'Trend Forecasting',
            'Fabric Selection',
          ],
        },
        { label: 'Office & Design', items: ['Excel', 'PowerPoint', 'Word', 'Canva'] },
      ],
    },
    softSkills: [
      'Creativity',
      'Attention to Detail',
      'Time Management',
      'Communication',
      'Teamwork & Collaboration',
      'Problem Solving',
      'Adaptability',
      'Organization',
    ],
    process: [
      { n: '01', title: 'Discover', icon: 'search', desc: 'Researching audience, mood, and the story a collection needs to tell.' },
      { n: '02', title: 'Ideate', icon: 'lightbulb', desc: 'Sketching silhouettes, exploring fabrics, and shaping the concept.' },
      { n: '03', title: 'Design', icon: 'pencil', desc: 'Fashion illustration, pattern making, and technical drawings in Illustrator & CLO 3D.' },
      { n: '04', title: 'Construct', icon: 'scissors', desc: 'Garment construction — fabric selection, fittings, and refinement.' },
      { n: '05', title: 'Deliver', icon: 'send', desc: 'Styling, presentation, and bringing the collection to the runway or client.' },
    ],
    quote: {
      text: 'Good design is not just how it looks, but how it wears.',
      signature: 'Dalia',
      cta: "Let's create\nsomething great together.",
    },
    contact: {
      title: "LET'S WORK",
      titleLine2: 'TOGETHER',
      titleDot: '.',
      description:
        'Open to collaborations, internships and made-to-order commissions. Let’s create something beautiful.',
      email: 'daliahossamesmat@gmail.com',
      phone: '+20 114 225 8835',
      phoneHref: '+201142258835',
      location: 'Cairo, Egypt',
      linkedin: 'https://www.linkedin.com/in/dalia-hossam-esmat',
      instagram: 'https://www.instagram.com/dibajfashion_',
      languages: 'Arabic · English',
      footerCopy: '© 2026 Dalia Hossam Esmat',
      footerTag: 'Fashion Designer · Cairo',
    },
  };

  /* ---------------- Load content.json ---------------- */
  async function loadContent() {
    let data = FALLBACK;
    try {
      const res = await fetch('content.json', { cache: 'no-cache' });
      if (res.ok) {
        const json = await res.json();
        if (json && typeof json === 'object') data = json;
      }
    } catch (e) {
      /* use FALLBACK when fetch is blocked (e.g. file:// protocol) */
    }

    applyBinds(data);
    setPortrait('hero', data.profile && data.profile.portrait);
    renderStats(data.stats);
    renderProjects(data.projects);
    renderExperience(data.experience);
    renderEducation(data.education);
    renderSkills(data.skills);
    renderProcess(data.process);
    renderSoftSkills(data.softSkills);

    applyStaggerDelays();
    initReveal();
  }

  /* ---------------- Boot ---------------- */
  function boot() {
    initScrollProgress();
    applyStaggerDelays();
    initReveal();
    initParallax();
    initMagnetic();
    lightbox.init();
    loadContent();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
