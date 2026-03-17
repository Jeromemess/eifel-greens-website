/* ============================================================
   EIFEL GREENS – MAIN JS
   ============================================================ */

/* ── 1. NAVIGATION ─────────────────────────────────────────── */
const nav       = document.getElementById('nav');
const navBurger = document.getElementById('navBurger');
const navLinks  = document.getElementById('navLinks');

// Set active link based on current page filename
(function setActiveLink() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    if (href === page || (page === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
})();

// Transparent nav on hero pages (auto-detects .hero or .page-hero)
const hasHero = document.querySelector('.hero');
if (hasHero && nav) {
  const toggleTransparent = () => {
    nav.classList.toggle('is-transparent', window.scrollY < 60);
  };
  toggleTransparent();
  window.addEventListener('scroll', toggleTransparent, { passive: true });
}

// Mobile burger menu
if (navBurger && navLinks) {
  navBurger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navBurger.classList.toggle('open', isOpen);
    navBurger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navBurger.classList.remove('open');
      navBurger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      navBurger.classList.remove('open');
      navBurger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      navBurger.classList.remove('open');
      navBurger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
}

/* ── 2. SCROLL REVEAL ──────────────────────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.08,
  rootMargin: '0px 0px -40px 0px'
});

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ── 3. FAQ ACCORDION ──────────────────────────────────────── */
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');

    // Close all
    document.querySelectorAll('.faq-item.open').forEach(openItem => {
      openItem.classList.remove('open');
      openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
    });

    // Open clicked if it was closed
    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

/* ── 4. SMOOTH SCROLL FOR ANCHOR LINKS ─────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY;
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
      window.scrollTo({ top: top - navH - 16, behavior: 'smooth' });
    }
  });
});

/* ── 5. INTERACTIVE HERO PLANT (Spring Physics) ────────────── */
(function initHeroPlant() {
  const section   = document.querySelector('.hero');
  const plant     = document.getElementById('heroPlantInner');
  const spotlight = document.getElementById('heroCursorSpotlight');
  if (!section || !plant) return;

  let tx = 0, ty = 0, cx = 0, cy = 0;   // target & current rotation
  let sx = 0, sy = 0, csx = 0, csy = 0; // target & current spotlight pos
  let active = false;

  section.addEventListener('mousemove', (e) => {
    const r = section.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width  - 0.5) * 24;  // ±12° Y-axis
    ty = -((e.clientY - r.top)  / r.height - 0.5) * 14; // ±7°  X-axis
    sx = e.clientX - r.left;
    sy = e.clientY - r.top;
    if (!active) { active = true; if (spotlight) spotlight.style.opacity = '1'; }
  });

  section.addEventListener('mouseleave', () => {
    tx = 0; ty = 0; active = false;
    if (spotlight) spotlight.style.opacity = '0';
  });

  (function loop() {
    const spring = 0.055, spotSpring = 0.10;
    cx  += (tx  - cx)  * spring;
    cy  += (ty  - cy)  * spring;
    csx += (sx  - csx) * spotSpring;
    csy += (sy  - csy) * spotSpring;

    plant.style.transform =
      `perspective(900px) rotateY(${cx.toFixed(3)}deg) rotateX(${cy.toFixed(3)}deg)`;

    if (spotlight) {
      spotlight.style.left = csx.toFixed(1) + 'px';
      spotlight.style.top  = csy.toFixed(1) + 'px';
    }
    requestAnimationFrame(loop);
  })();
})();

/* ── 6. CONTACT FORM VALIDATION ────────────────────────────── */
document.querySelectorAll('form[data-validate]').forEach(form => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    form.querySelectorAll('[required]').forEach(field => {
      const group = field.closest('.form-group');
      const err = group?.querySelector('.form-error');
      if (!field.value.trim()) {
        valid = false;
        field.style.borderColor = '#e05050';
        if (err) err.style.display = 'block';
      } else {
        field.style.borderColor = '';
        if (err) err.style.display = 'none';
      }
    });

    if (valid) {
      const btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.textContent = '✓ Nachricht gesendet';
        btn.style.background = '#588018';
        btn.disabled = true;
      }
    }
  });

  // Live clear error on input
  form.querySelectorAll('[required]').forEach(field => {
    field.addEventListener('input', () => {
      if (field.value.trim()) {
        field.style.borderColor = '';
        const err = field.closest('.form-group')?.querySelector('.form-error');
        if (err) err.style.display = 'none';
      }
    });
  });
});
