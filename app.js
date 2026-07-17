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

  function renderProjects(items) {
    const root = document.querySelector('[data-projects]');
    const toggle = document.getElementById('projects-toggle');
    const counter = document.querySelector('[data-projects-count]');
    if (!root || !Array.isArray(items)) return;

    const total = items.length;
    const initial = Math.min(PROJECTS_INITIAL, total);

    root.innerHTML = items
      .map(
        (p, i) =>
          '<article class="project-card' + (i >= initial ? ' is-extra' : '') + '"' +
          ' data-index="' + i + '">' +
          '<div class="project-card-media">' +
          '<span class="project-card-num">' + esc(p.n) + '</span>' +
          (p.category ? '<span class="project-card-category">' + esc(p.category) + '</span>' : '') +
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
      )
      .join('');

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
            // Re-trigger the entrance animation when collapsing then re-expanding
            root.querySelectorAll('.is-extra').forEach((c) => {
              c.style.animation = 'none';
              // force reflow
              void c.offsetWidth;
              c.style.animation = '';
            });
            // Smooth scroll back to top of projects
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
        desc:
          'Floor-length draped gown in silk crepe with hand-finished pleating and a sculpted bodice — designed for the runway and bespoke commissions.',
      },
      {
        n: '02',
        title: 'Tailored Wool Coat',
        tag: 'AW · 25',
        category: 'Outerwear',
        desc:
          'Double-breasted wool coat with a notched lapel, hand-stitched lining and mother-of-pearl buttons — a study in clean, lasting structure.',
      },
      {
        n: '03',
        title: 'Bridal Capsule',
        tag: 'SS · 26',
        category: 'Bridal',
        desc:
          'Three-piece bridal capsule built around a removable overskirt, beaded bodice and veil — engineered for a seamless ceremony-to-reception transition.',
      },
      {
        n: '04',
        title: 'Resort Capsule',
        tag: 'Summer · 25',
        category: 'Resort',
        desc:
          'Light, sun-bleached palette with linen, cotton voile and hand-crocheted trims — a 6-look capsule built around movement and breathability.',
      },
      {
        n: '05',
        title: 'Streetwear Capsule',
        tag: 'FW · 25',
        category: 'Ready-to-Wear',
        desc:
          'Six-piece unisex capsule mixing technical nylons with heritage tailoring — a streetwear drop rooted in clean construction and quiet detail.',
      },
      {
        n: '06',
        title: 'Cocktail Collection',
        tag: 'Holiday · 25',
        category: 'Cocktail',
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
    loadContent();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
