const loader = document.getElementById('pageLoader');
window.addEventListener('load', () => setTimeout(() => loader?.classList.add('loaded'), 350));

const progress = document.createElement('div');
progress.className = 'scroll-progress';
document.body.prepend(progress);

const mobileToggle = document.getElementById('mobileToggle');
const mobileNav = document.getElementById('mobileNav');
mobileToggle?.addEventListener('click', () => mobileNav.classList.toggle('active'));
mobileNav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => mobileNav.classList.remove('active')));

const header = document.getElementById('siteHeader');
let lastScroll = 0;
const navLinks = [...document.querySelectorAll('.desktop-nav a, .mobile-nav a')];
const sections = navLinks
  .map(link => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

function onScrollEffects() {
  const current = window.scrollY || document.documentElement.scrollTop;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${docHeight > 0 ? (current / docHeight) * 100 : 0}%`;

  header?.classList.toggle('scrolled', current > 24);
  header?.classList.remove('hide-on-scroll');
  lastScroll = Math.max(current, 0);

  const activeSection = sections
    .filter(section => section.offsetTop <= current + 150)
    .pop();
  navLinks.forEach(link => {
    link.classList.toggle('active', activeSection && link.getAttribute('href') === `#${activeSection.id}`);
  });

}
let tickingScroll = false;
window.addEventListener('scroll', () => {
  if (!tickingScroll) {
    window.requestAnimationFrame(() => {
      onScrollEffects();
      tickingScroll = false;
    });
    tickingScroll = true;
  }
}, { passive: true });
onScrollEffects();

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -70px 0px' });

document.querySelectorAll('.reveal, .poster-card, .clean-gallery-card').forEach(el => revealObserver.observe(el));

document.querySelectorAll('.dashboard-card, .brand-mark').forEach(el => el.classList.add('float-soft'));

const search = document.getElementById('announcementSearch');
const announcementRows = [...document.querySelectorAll('#announcementList .announcement-row')];
const filterButtons = [...document.querySelectorAll('.filter-btn')];
const emptyNotice = document.getElementById('announcementEmpty');
let activeFilter = 'all';

let filterAnnouncements = function filterAnnouncements() {
  const value = (search?.value || '').toLowerCase().trim();
  let visibleCount = 0;

  announcementRows.forEach(row => {
    const category = (row.dataset.category || '').toLowerCase();
    const text = (row.textContent + ' ' + (row.dataset.keywords || '')).toLowerCase();
    const matchesSearch = !value || text.includes(value);
    const matchesFilter = activeFilter === 'all' || category === activeFilter;
    const isVisible = matchesSearch && matchesFilter;
    row.style.display = isVisible ? 'grid' : 'none';
    if (isVisible) visibleCount += 1;
  });

  if (emptyNotice) emptyNotice.style.display = visibleCount ? 'none' : 'block';
};

search?.addEventListener('input', filterAnnouncements);
filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter || 'all';
    filterButtons.forEach(btn => btn.classList.toggle('active', btn === button));
    filterAnnouncements();
  });
});
filterAnnouncements();

const tiltCards = document.querySelectorAll('.poster-card,.quick-card,.info-card,.payment-card,.clean-gallery-card,.feature-card,.project-card');
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  tiltCards.forEach(card => {
    card.addEventListener('pointermove', e => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      card.style.transform = `translate3d(0,-6px,0) rotateX(${y * -2.5}deg) rotateY(${x * 2.5}deg)`;
    }, { passive: true });
    card.addEventListener('pointerleave', () => card.style.transform = '');
  });
}

// Extra transition polish only: keeps existing content and layout intact.
const motionSafe = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (motionSafe) {
  const transitionTargets = document.querySelectorAll(
    '.section-heading, .feature-card, .info-card, .quick-card, .project-card, .emergency-card, .payment-card, .poster-card, .clean-gallery-card, .contact-card, .future-card, .pill-grid span'
  );

  const motionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const siblings = [...(el.parentElement?.children || [])];
        const index = Math.max(0, siblings.indexOf(el));
        el.style.transitionDelay = `${Math.min(index * 55, 330)}ms`;
        el.classList.add('visible');
        motionObserver.unobserve(el);
      }
    });
  }, { threshold: 0.10, rootMargin: '0px 0px -60px 0px' });

  transitionTargets.forEach((el) => {
    if (!el.classList.contains('reveal') && !el.classList.contains('visible')) {
      el.classList.add('reveal');
    }
    motionObserver.observe(el);
  });

}


// Community Gallery: album switcher + reusable sliders
const activityAlbums = [...document.querySelectorAll('.activity-album')];
const activityPanels = [...document.querySelectorAll('.activity-panel')];
activityAlbums.forEach(album => {
  album.addEventListener('click', () => {
    const target = album.dataset.album;
    activityAlbums.forEach(item => item.classList.toggle('active', item === album));
    activityPanels.forEach(panel => panel.classList.toggle('active', panel.dataset.panel === target));
  });
});

function setupAlbumSlider(slider) {
  const name = slider.dataset.slider;
  const slides = [...slider.querySelectorAll('.album-slide, .basketball-slide')];
  const prev = slider.querySelector('.slider-control.prev');
  const next = slider.querySelector('.slider-control.next');
  const dotsWrap = document.querySelector(`[data-dots="${name}"]`);
  let index = 0;
  let timer;

  if (!slides.length) return;
  if (dotsWrap && !dotsWrap.children.length) {
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'gallery-dot';
      dot.setAttribute('aria-label', `Show ${name} photo ${i + 1}`);
      dot.addEventListener('click', () => { show(i); start(); });
      dotsWrap.appendChild(dot);
    });
  }
  const dots = dotsWrap ? [...dotsWrap.querySelectorAll('.gallery-dot')] : [];

  function show(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  }
  function start() {
    window.clearInterval(timer);
    timer = window.setInterval(() => show(index + 1), 5200);
  }
  prev?.addEventListener('click', () => { show(index - 1); start(); });
  next?.addEventListener('click', () => { show(index + 1); start(); });

  let touchStartX = 0;
  slider.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  slider.addEventListener('touchend', e => {
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 40) {
      show(index + (delta < 0 ? 1 : -1));
      start();
    }
  }, { passive: true });

  show(0);
  start();
}

document.querySelectorAll('.album-slider, .basketball-slider').forEach(setupAlbumSlider);

// Emergency contact album switcher
const emergencyAlbums = [...document.querySelectorAll('.emergency-album')];
const emergencyPanels = [...document.querySelectorAll('.emergency-preview')];
emergencyAlbums.forEach((album) => {
  album.addEventListener('click', () => {
    const target = album.dataset.emergency;
    emergencyAlbums.forEach((item) => item.classList.toggle('active', item === album));
    emergencyPanels.forEach((panel) => panel.classList.toggle('active', panel.dataset.emergencyPanel === target));
  });
});

// Slide transitions for all main boxes/cards. Content and layout are unchanged.
(function addSlideTransitionsToBoxes() {
  const motionOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const boxes = document.querySelectorAll([
    '.dashboard-card',
    '.dashboard-grid a',
    '.stats-grid div',
    '.feature-card',
    '.info-card',
    '.quick-card',
    '.project-card',
    '.emergency-card',
    '.payment-card',
    '.poster-card',
    '.clean-gallery-card',
    '.contact-card',
    '.future-card',
    '.timeline-card',
    '.announcement-row',
    '.filter-btn',
    '.board-card',
    '.refined-committees',
    '.refined-list span',
    '.committee-card',
    '.committee-list span',
    '.activity-album',
    '.emergency-album',
    '.emergency-preview',
    '.forms-card',
    '.document-card',
    '.pill-grid span'
  ].join(','));

  if (!motionOK) {
    boxes.forEach(box => box.classList.add('slide-visible'));
    return;
  }

  const boxObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const siblings = Array.from(el.parentElement?.children || []);
        const index = Math.max(0, siblings.indexOf(el));
        el.style.transitionDelay = `${Math.min(index * 70, 420)}ms`;
        el.classList.add('slide-visible');
        boxObserver.unobserve(el);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -45px 0px' });

  boxes.forEach((box, i) => {
    box.classList.add('slide-box');
    if (i % 2 === 0) box.classList.add('slide-from-left');
    boxObserver.observe(box);
  });
})();


// Correct section landing for navbar, dashboard, and quick-access links.
// The target section starts at the top of the viewport so the fixed navbar sits over the same section, not the previous section.
(function correctedSectionNavigation() {
  const links = document.querySelectorAll('a[href^="#"]');
  const mobileNav = document.getElementById('mobileNav');

  function goTo(hash, push = true) {
    const target = document.querySelector(hash);
    if (!target) return;
    const header = document.getElementById('siteHeader');
    const headerHeight = header ? header.getBoundingClientRect().height : 0;
    const extraGap = window.innerWidth <= 640 ? 10 : 18;
    const top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - extraGap;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    if (push) history.pushState(null, '', hash);
    if (mobileNav) mobileNav.classList.remove('active', 'open');
  }

  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      const hash = link.getAttribute('href');
      if (!hash || hash === '#' || !document.querySelector(hash)) return;
      event.preventDefault();
      goTo(hash, true);
    });
  });

  window.addEventListener('load', () => {
    if (window.location.hash && document.querySelector(window.location.hash)) {
      setTimeout(() => goTo(window.location.hash, false), 80);
    }
  });
})();


(function backToTopControl() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  function toggleButton() {
    btn.classList.toggle('show', window.scrollY > 420);
  }

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', toggleButton, { passive: true });
  toggleButton();
})();
