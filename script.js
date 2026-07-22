const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.primary-nav');

function closeMenu() {
  menuButton?.setAttribute('aria-expanded', 'false');
  menuButton?.classList.remove('is-open');
  navigation?.classList.remove('is-open');
}

menuButton?.addEventListener('click', () => {
  const willOpen = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(willOpen));
  menuButton.classList.toggle('is-open', willOpen);
  navigation?.classList.toggle('is-open', willOpen);
});

navigation?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

document.addEventListener('click', (event) => {
  if (!navigation?.classList.contains('is-open')) return;
  if (!navigation.contains(event.target) && !menuButton?.contains(event.target)) closeMenu();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 1050) closeMenu();
});

const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

// Learning phase tabs.
document.querySelectorAll('[data-tabs]').forEach((tabSet) => {
  const tabs = [...tabSet.querySelectorAll('[role="tab"]')];
  const panels = [...tabSet.querySelectorAll('[role="tabpanel"]')];

  const activate = (tab, updateHash = true) => {
    const key = tab.dataset.tab;
    tabs.forEach((item) => {
      const active = item === tab;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
    });
    panels.forEach((panel) => {
      const active = panel.dataset.panel === key;
      panel.classList.toggle('is-active', active);
      panel.hidden = !active;
    });
    if (updateHash && history.replaceState) history.replaceState(null, '', `#phase-${key}`);
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      tabs[next].focus();
      activate(tabs[next]);
    });
  });

  const initial = location.hash.match(/^#phase-(.+)$/)?.[1];
  const initialTab = tabs.find((tab) => tab.dataset.tab === initial);
  if (initialTab) activate(initialTab, false);
});

// Parent gallery lightbox.
const lightbox = document.querySelector('.gallery-lightbox');
if (lightbox) {
  const lightboxImage = lightbox.querySelector('img');
  const lightboxCaption = lightbox.querySelector('figcaption');
  const closeButton = lightbox.querySelector('.gallery-lightbox__close');
  let lastTrigger = null;

  const closeLightbox = () => {
    lightbox.setAttribute('aria-hidden', 'true');
    lightbox.classList.remove('is-open');
    document.body.classList.remove('lightbox-open');
    lastTrigger?.focus();
  };

  document.querySelectorAll('[data-lightbox]').forEach((button) => {
    button.addEventListener('click', () => {
      lastTrigger = button;
      lightboxImage.src = button.dataset.lightbox;
      lightboxImage.alt = button.querySelector('img')?.alt || button.dataset.caption || 'Gallery photo';
      lightboxCaption.textContent = button.dataset.caption || '';
      lightbox.setAttribute('aria-hidden', 'false');
      lightbox.classList.add('is-open');
      document.body.classList.add('lightbox-open');
      closeButton?.focus();
    });
  });

  closeButton?.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && lightbox.classList.contains('is-open')) closeLightbox();
  });
}

// Staff directory filtering and search.
const staffSearch = document.querySelector('[data-staff-search]');
const staffCards = [...document.querySelectorAll('[data-staff-card]')];
const staffSections = [...document.querySelectorAll('[data-staff-section]')];
const staffFilters = [...document.querySelectorAll('[data-staff-filter]')];
const staffResults = document.querySelector('[data-staff-results]');

if (staffCards.length) {
  let activeFilter = 'all';

  const applyStaffFilter = () => {
    const query = (staffSearch?.value || '').trim().toLowerCase();
    let visibleCount = 0;

    staffCards.forEach((card) => {
      const categoryMatch = activeFilter === 'all' || card.dataset.category === activeFilter;
      const searchMatch = !query || card.dataset.search.includes(query);
      const visible = categoryMatch && searchMatch;
      card.hidden = !visible;
      if (visible) visibleCount += 1;
    });

    staffSections.forEach((section) => {
      section.hidden = !section.querySelector('[data-staff-card]:not([hidden])');
    });

    if (staffResults) {
      const suffix = visibleCount === 1 ? 'staff member' : 'staff members';
      staffResults.textContent = `${visibleCount} ${suffix} shown`;
    }
  };

  staffFilters.forEach((button) => {
    button.addEventListener('click', () => {
      activeFilter = button.dataset.staffFilter;
      staffFilters.forEach((item) => item.classList.toggle('is-active', item === button));
      applyStaffFilter();
    });
  });

  staffSearch?.addEventListener('input', applyStaffFilter);
  applyStaffFilter();
}

// Graceful initials fallback when a staff portrait cannot load.
document.querySelectorAll('.staff-card__photo img').forEach((image) => {
  image.addEventListener('error', () => image.parentElement?.classList.add('has-image-error'));
});
