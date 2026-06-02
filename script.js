/* ============================================================
   Digitale Souveränität messbar machen — Interaktion
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Jahr im Footer ---- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Navigation: Scroll-Zustand + Burger ---- */
  const nav = document.getElementById('nav');
  const burger = document.getElementById('navBurger');
  const navLinks = document.getElementById('navLinks');

  const onScroll = () => {
    if (window.scrollY > 30) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (burger && navLinks) {
    burger.addEventListener('click', () => navLinks.classList.toggle('open'));
    navLinks.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => navLinks.classList.remove('open'))
    );
  }

  /* ---- Reveal on scroll ---- */
  const revealEls = document.querySelectorAll('.reveal');
  const revObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        revObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => revObserver.observe(el));

  /* ---- Count-up Stats ---- */
  const counters = document.querySelectorAll('.stat-num[data-count]');
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const dur = 1100;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      countObserver.unobserve(el);
    });
  }, { threshold: 0.6 });
  counters.forEach(c => countObserver.observe(c));

  /* ============================================================
     Capacities + Radar
     ============================================================ */
  const CAPS = [
    { key: 'switch', label: 'Switching',       color: '#f2f3f5', q: 'Wie schnell könntet ihr einen Anbieter wechseln?' },
    { key: 'int',    label: 'Internalisierung', color: '#c6cad1', q: 'Wie gut könntet ihr die Funktion selbst betreiben?' },
    { key: 'ms',     label: 'Multi-Sourcing',   color: '#9ba0a9', q: 'Wie gut könnt ihr mehrere Anbieter parallel nutzen?' },
    { key: 'neg',    label: 'Verhandlung',      color: '#71767f', q: 'Wie stark ist eure Verhandlungsposition?' }
  ];
  const LABELS = CAPS.map(c => c.label);
  const COLORS = CAPS.map(c => c.color);

  if (typeof Chart !== 'undefined') {
    Chart.defaults.font.family = "'Inter', system-ui, sans-serif";
    Chart.defaults.color = '#aeb6c8';
  }

  function radarConfig(data, animate) {
    return {
      type: 'radar',
      data: {
        labels: LABELS,
        datasets: [{
          data: data,
          fill: true,
          backgroundColor: 'rgba(255, 255, 255, 0.16)',
          borderColor: 'rgba(255, 255, 255, 0.9)',
          borderWidth: 2,
          pointBackgroundColor: COLORS,
          pointBorderColor: '#0a0b0d',
          pointBorderWidth: 1.5,
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        animation: animate ? { duration: 700 } : false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
          r: {
            min: 0, max: 3,
            ticks: { display: false, stepSize: 1 },
            grid: { color: 'rgba(255,255,255,0.12)' },
            angleLines: { color: 'rgba(255,255,255,0.12)' },
            pointLabels: {
              color: '#dfe5f2',
              font: { size: 13, weight: '600' }
            }
          }
        }
      }
    };
  }

  /* ---- Hero-Radar (dekorativ, Beispielprofil) ---- */
  const heroCanvas = document.getElementById('heroRadar');
  if (heroCanvas && typeof Chart !== 'undefined') {
    new Chart(heroCanvas, radarConfig([3, 2, 3, 2], true));
  }

  /* ---- Demo-Radar (interaktiv) ---- */
  const demoCanvas = document.getElementById('demoRadar');
  const questionsWrap = document.getElementById('demoQuestions');
  const interpEl = document.getElementById('demoInterpretation');
  const resetBtn = document.getElementById('demoReset');

  if (demoCanvas && questionsWrap && typeof Chart !== 'undefined') {
    const values = { switch: 0, int: 0, ms: 0, neg: 0 };
    const demoChart = new Chart(demoCanvas, radarConfig([0, 0, 0, 0], true));

    const SCORES = [
      { label: 'niedrig', val: 1 },
      { label: 'mittel',  val: 2 },
      { label: 'hoch',    val: 3 }
    ];

    // Fragen aufbauen
    CAPS.forEach((cap) => {
      const card = document.createElement('div');
      card.className = 'glass demo-q';
      card.style.setProperty('--cap', cap.color);
      card.innerHTML = `
        <p class="q-text"><span class="q-dot"></span>${cap.q}</p>
        <div class="q-options" role="group" aria-label="${cap.label}"></div>
      `;
      const opts = card.querySelector('.q-options');
      SCORES.forEach((s) => {
        const b = document.createElement('button');
        b.className = 'q-opt';
        b.type = 'button';
        b.textContent = s.label;
        b.addEventListener('click', () => {
          opts.querySelectorAll('.q-opt').forEach(o => o.classList.remove('active'));
          b.classList.add('active');
          values[cap.key] = s.val;
          updateChart();
        });
        opts.appendChild(b);
      });
      questionsWrap.appendChild(card);
    });

    function updateChart() {
      demoChart.data.datasets[0].data = CAPS.map(c => values[c.key]);
      demoChart.update();
      interpret();
    }

    function interpret() {
      const answered = CAPS.filter(c => values[c.key] > 0);
      if (answered.length < CAPS.length) {
        interpEl.innerHTML = `Beantwortet: ${answered.length} von 4. Beantworte alle Fragen, um dein Profil zu sehen.`;
        return;
      }
      let strong = CAPS[0], weak = CAPS[0];
      CAPS.forEach(c => {
        if (values[c.key] > values[strong.key]) strong = c;
        if (values[c.key] < values[weak.key]) weak = c;
      });
      if (strong.key === weak.key) {
        interpEl.innerHTML = `Ein ausgewogenes Profil. Alle vier Fähigkeiten sind gleich ausgeprägt.`;
      } else {
        interpEl.innerHTML = `Stark in <strong>${strong.label}</strong>, schwächer in <strong>${weak.label}</strong>. Genau hier setzt die Diagnose an.`;
      }
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        Object.keys(values).forEach(k => values[k] = 0);
        questionsWrap.querySelectorAll('.q-opt.active').forEach(o => o.classList.remove('active'));
        demoChart.data.datasets[0].data = [0, 0, 0, 0];
        demoChart.update();
        interpEl.innerHTML = 'Beantworte die Fragen, um dein Profil zu sehen.';
      });
    }
  }

});
