(function () {

  /* ============================================================
     1. PAGE LOADER
  ============================================================ */
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => loader.classList.add('hidden'));
  setTimeout(() => loader.classList.add('hidden'), 2000);

  /* ============================================================
     2. CUSTOM CURSOR
  ============================================================ */
  const cursorOuter = document.getElementById('cursor-outer');
  const cursorInner = document.getElementById('cursor-inner');
  const cursorTrail = document.getElementById('cursor-trail');

  let mouseX = 0, mouseY = 0;
  let outerX = 0, outerY = 0;
  let trailX = 0, trailY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorInner.style.left = mouseX + 'px';
    cursorInner.style.top  = mouseY + 'px';
  });

  // Smooth outer cursor
  function animateCursor() {
    outerX += (mouseX - outerX) * 0.18;
    outerY += (mouseY - outerY) * 0.18;
    trailX += (mouseX - trailX) * 0.08;
    trailY += (mouseY - trailY) * 0.08;

    cursorOuter.style.left = outerX + 'px';
    cursorOuter.style.top  = outerY + 'px';
    cursorTrail.style.left = trailX + 'px';
    cursorTrail.style.top  = trailY + 'px';

    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Hover state
  const hoverTargets = 'a, button, .service-card, .project-card, .member-card, .tech-pill, .stat-card, input, select, textarea';
  document.querySelectorAll(hoverTargets).forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  // Click state
  document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
  document.addEventListener('mouseup',   () => document.body.classList.remove('cursor-click'));

  /* ============================================================
     3. THEME TOGGLE
  ============================================================ */
  const toggle = document.getElementById('themeToggle');
  const icon   = document.getElementById('themeIcon');
  const html   = document.documentElement;

  const saved = localStorage.getItem('PyTech-theme') || 'light';
  html.setAttribute('data-theme', saved);
  icon.className = saved === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';

  toggle.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    icon.className = next === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    localStorage.setItem('PyTech-theme', next);
  });

  /* ============================================================
     4. MOBILE NAV
  ============================================================ */
  const burger   = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  burger.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => navLinks.classList.remove('open'))
  );

  /* ============================================================
     5. SCROLL PROGRESS BAR
  ============================================================ */
  const progressBar = document.getElementById('scroll-progress');
  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (total > 0 ? (window.scrollY / total) * 100 : 0) + '%';
  }, { passive: true });

  /* ============================================================
     6. ACTIVE NAV LINK ON SCROLL
  ============================================================ */
  const sections   = document.querySelectorAll('section[id]');
  const navAnchors = navLinks.querySelectorAll('a[href^="#"]');

  const activateNav = () => {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    navAnchors.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  };
  window.addEventListener('scroll', activateNav, { passive: true });
  activateNav();

  /* ============================================================
     7. SCROLL REVEAL
  ============================================================ */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  /* ============================================================
     8. ANIMATED STAT COUNTERS
  ============================================================ */
  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    if (isNaN(target)) return;
    const suffix = el.textContent.includes('+') ? '+' : '';
    let start = 0;
    const step = ts => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 1200, 1);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(e * target) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { animateCounter(e.target); counterObs.unobserve(e.target); }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.stat-num[data-count]').forEach(el => counterObs.observe(el));

  /* ============================================================
     9. CODE BLOCK TYPING EFFECT
  ============================================================ */
  const codeBlock = document.querySelector('.code-block');
  if (codeBlock) {
    const lines  = codeBlock.querySelectorAll('.code-line');
    const codeObs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        codeBlock.classList.add('typed');
        lines.forEach((line, i) => line.style.transitionDelay = (i * 80) + 'ms');
        codeObs.disconnect();
      }
    }, { threshold: 0.3 });
    codeObs.observe(codeBlock);
  }

  /* ============================================================
     10. TERMINAL TYPEWRITER — last line animation
  ============================================================ */
  const typedLine = document.getElementById('typed-line');
  if (typedLine) {
    const phrases = [
      '>>> π.build("Doisneau")',
      '>>> π.build("Cartier-Bresson")',
      '>>> π.build("Vivian Maier")',
      '>>> π.build("Sebastião Salgado")',
    ];
    let phraseIdx = 0;
    let charIdx   = 0;
    let deleting  = false;
    let paused    = false;

    const speed = { type: 60, delete: 30, pause: 1800 };

    function tick() {
      const phrase = phrases[phraseIdx];

      if (paused) {
        paused = false;
        deleting = true;
        setTimeout(tick, speed.pause);
        return;
      }

      if (!deleting) {
        charIdx++;
        typedLine.textContent = phrase.slice(0, charIdx);
        if (charIdx === phrase.length) {
          paused = true;
          setTimeout(tick, speed.pause);
          return;
        }
        setTimeout(tick, speed.type);
      } else {
        charIdx--;
        typedLine.textContent = phrase.slice(0, charIdx);
        if (charIdx === 0) {
          deleting = false;
          phraseIdx = (phraseIdx + 1) % phrases.length;
        }
        setTimeout(tick, speed.delete);
      }
    }
    setTimeout(tick, 2000);
  }

  /* ============================================================
     11. HERO CANVAS — FLOATING PARTICLE GRID
  ============================================================ */
  const canvas = document.getElementById('hero-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, particles;

    const resize = () => {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };

    class Particle {
      constructor() { this.reset(true); }
      reset(init) {
        this.x  = Math.random() * W;
        this.y  = init ? Math.random() * H : H + 10;
        this.r  = Math.random() * 1.5 + 0.5;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = -(Math.random() * 0.4 + 0.1);
        this.alpha = Math.random() * 0.5 + 0.1;
      }
      update() {
        this.x += this.vx; this.y += this.vy;
        if (this.y < -10) this.reset(false);
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(46,204,113,${this.alpha})`;
        ctx.fill();
      }
    }

    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(46,204,113,${0.08 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    };

    const init = () => {
      resize();
      particles = Array.from({ length: 80 }, () => new Particle());
    };

    const loop = () => {
      ctx.clearRect(0, 0, W, H);
      drawConnections();
      particles.forEach(p => { p.update(); p.draw(); });
      requestAnimationFrame(loop);
    };

    init(); loop();
    window.addEventListener('resize', resize, { passive: true });
  }

  /* ============================================================
     12. 3D TILT ON TEAM CARDS
  ============================================================ */
  document.querySelectorAll('.member-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const rx =  (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2) * 8;
      const ry = -(e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2) * 8;
      card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-5px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
    });
  });

  /* ============================================================
     13. MAGNETIC BUTTONS
  ============================================================ */
  document.querySelectorAll('.btn-primary, .btn-outline, .form-submit').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const dx = (e.clientX - rect.left - rect.width  / 2) * 0.25;
      const dy = (e.clientY - rect.top  - rect.height / 2) * 0.25;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    btn.addEventListener('mouseleave', () => btn.style.transform = '');
  });

  /* ============================================================
     14. RIPPLE EFFECT ON BUTTONS
  ============================================================ */
  document.querySelectorAll('.btn-primary, .btn-outline, .form-submit, .member-btn').forEach(btn => {
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.addEventListener('click', e => {
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      const rect = btn.getBoundingClientRect();
      ripple.style.left = (e.clientX - rect.left - 10) + 'px';
      ripple.style.top  = (e.clientY - rect.top  - 10) + 'px';
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });

  /* ============================================================
     15. FORM VALIDATION
  ============================================================ */
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');

  function setError(groupId, show) {
    const g = document.getElementById(groupId);
    if (!g) return;
    g.classList.toggle('has-error', show);
    const input = g.querySelector('input, select, textarea');
    if (input) input.classList.toggle('error', show);
  }

  function validateEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      let valid = true;
      const name    = document.getElementById('name').value.trim();
      const email   = document.getElementById('email').value.trim();
      const subject = document.getElementById('subject').value;
      const message = document.getElementById('message').value.trim();

      if (!name)                { setError('group-name',    true);  valid = false; } else setError('group-name',    false);
      if (!validateEmail(email)){ setError('group-email',   true);  valid = false; } else setError('group-email',   false);
      if (!subject)             { setError('group-subject', true);  valid = false; } else setError('group-subject', false);
      if (!message || message.length < 20) { setError('group-message', true); valid = false; } else setError('group-message', false);

      if (valid) {
        success.style.display = 'block';
        form.reset();
        setTimeout(() => success.style.display = 'none', 4000);
      }
    });
  }

})();
