const defaultProjects = [
  {
    id: 1,
    title: 'FataFati',
    desc: 'Full e-commerce system with cart, admin panel and WhatsApp ordering integration.\n\nHighlights:\n- Real-time cart updates\n- Admin dashboard tracking\n- WhatsApp checkout flow',
    tag: 'E-COMMERCE',
    img: 'assets/FataFati.webp',
    url: 'https://stayfatafati.vercel.app/'
  },
  {
    id: 2,
    title: 'EatHealthy',
    desc: 'Healthy food delivery platform with a focus on fresh, organic ingredients.\n\nHighlights:\n- Subscription models\n- Nutritional filtering\n- Optimized mobile experience',
    tag: 'GROCERY',
    img: 'assets/EatHealthy.webp',
    url: 'https://eat-healthybd.vercel.app'
  },
  {
    id: 3,
    title: 'Orca Automations',
    desc: 'Business website focused on industrial automation solutions and services.\n\nHighlights:\n- Services overview\n- Company and solution showcase\n- Lead-focused contact pathways',
    tag: 'BUSINESS',
    img: 'assets/Orca%20Automations.webp',
    url: 'https://orcaautomations.com/'
  }
];

const petalColors = ['#C0392B', '#E8503A', '#E8825A', '#F2C4A0', '#FFFFFF'];
const PETAL_POOL_SIZE = 18;
const PETAL_SPAWN_INTERVAL_MS = 650;
const TREE_LEAF_REVEAL_START_SCALE = 0.82;
const TREE_LEAF_REVEAL_STAGGER = 0.06;
const TREE_LEAF_DRIFT_X = 1.2;
const TREE_LEAF_DRIFT_Y = -1.4;

let projects = [...defaultProjects];
let modal = null;
let projectParallaxTweens = [];
let treeAmbientTimeline = null;
let treeAmbientIsSlowed = false;
let treeLastScrollMovementTs = 0;
let cursorRotateTo = null;

const scrollSubscribers = [];
const scrollState = {
  y: window.scrollY || 0,
  previousY: window.scrollY || 0,
  progress: 0,
  maxScroll: 1,
  viewportHeight: window.innerHeight,
  documentHeight: document.documentElement.scrollHeight,
  delta: 0,
  direction: 1,
  changed: false,
  timestamp: 0
};

const petalPool = [];
let petalSpawnIntervalId = null;
let petalPoolCursor = 0;

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function subscribeToScroll(callback) {
  scrollSubscribers.push(callback);
}

function startScrollLoop() {
  // Single requestAnimationFrame loop dispatches all scroll-driven UI work.
  const tick = (timestamp) => {
    const nextY = window.scrollY || document.documentElement.scrollTop || 0;
    const nextViewportHeight = window.innerHeight;
    const nextDocumentHeight = document.documentElement.scrollHeight;
    const maxScroll = Math.max(nextDocumentHeight - nextViewportHeight, 1);
    const delta = nextY - scrollState.y;

    scrollState.previousY = scrollState.y;
    scrollState.y = nextY;
    scrollState.delta = delta;
    if (delta !== 0) {
      scrollState.direction = delta > 0 ? 1 : -1;
    }
    scrollState.maxScroll = maxScroll;
    scrollState.progress = Math.min(100, Math.max(0, (nextY / maxScroll) * 100));
    scrollState.viewportHeight = nextViewportHeight;
    scrollState.documentHeight = nextDocumentHeight;
    scrollState.changed = delta !== 0;
    scrollState.timestamp = timestamp;

    scrollSubscribers.forEach((callback) => callback(scrollState));
    window.requestAnimationFrame(tick);
  };

  window.requestAnimationFrame(tick);
}

function initializeScrollDrivenUi() {
  const header = document.getElementById('site-header');
  const progressBar = document.getElementById('scrollProgress');
  const fab = document.querySelector('.whatsapp-fab');

  if (fab) {
    fab.style.transition = 'opacity 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease';
  }

  let headerIsScrolled = false;
  let lastProgress = -1;
  let fabHidden = false;

  subscribeToScroll((state) => {
    if (header) {
      const shouldBeScrolled = state.y > 60;
      if (shouldBeScrolled !== headerIsScrolled) {
        header.classList.toggle('scrolled', shouldBeScrolled);
        headerIsScrolled = shouldBeScrolled;
      }
    }

    if (progressBar) {
      const roundedProgress = Number(state.progress.toFixed(2));
      if (roundedProgress !== lastProgress) {
        progressBar.style.width = `${roundedProgress}%`;
        lastProgress = roundedProgress;
      }
    }

    if (fab) {
      const distanceFromBottom = state.documentHeight - (state.viewportHeight + state.y);
      const shouldHideFab = distanceFromBottom < 400;
      if (shouldHideFab !== fabHidden) {
        fab.style.opacity = shouldHideFab ? '0' : '1';
        fab.style.pointerEvents = shouldHideFab ? 'none' : 'all';
        fabHidden = shouldHideFab;
      }
    }

    if (cursorRotateTo && state.changed) {
      cursorRotateTo(0);
    }

    if (!treeAmbientTimeline) {
      return;
    }

    if (Math.abs(state.delta) > 0.4) {
      treeLastScrollMovementTs = state.timestamp;
      if (!treeAmbientIsSlowed) {
        treeAmbientIsSlowed = true;
        gsap.to(treeAmbientTimeline, { timeScale: 0.15, duration: 0.5, overwrite: 'auto' });
      }
    } else if (treeAmbientIsSlowed && state.timestamp - treeLastScrollMovementTs > 220) {
      treeAmbientIsSlowed = false;
      gsap.to(treeAmbientTimeline, { timeScale: 1, duration: 1.5, overwrite: 'auto' });
    }
  });
}

function initializeCursorEffects() {
  const supportsFinePointer = window.matchMedia('(pointer: fine)').matches;
  const glow = document.getElementById('cursorGlow');

  if (!supportsFinePointer || !glow || !window.gsap) {
    return;
  }

  const xTo = gsap.quickTo(glow, 'left', { duration: 0.1, ease: 'power3' });
  const yTo = gsap.quickTo(glow, 'top', { duration: 0.1, ease: 'power3' });
  cursorRotateTo = gsap.quickTo(glow, 'rotation', { duration: 0.4, ease: 'power3.out' });

  let lastX = 0;
  gsap.set(glow, { xPercent: -15, yPercent: -15 });

  document.addEventListener('mousemove', (event) => {
    xTo(event.clientX);
    yTo(event.clientY);

    const deltaX = event.clientX - lastX;
    lastX = event.clientX;
    const speed = Math.max(-45, Math.min(45, deltaX * 0.8));
    cursorRotateTo(speed);
  });

  setInterval(() => {
    if (cursorRotateTo) {
      cursorRotateTo(0);
    }
  }, 150);
}

function initializeTypedEffect() {
  if (!window.Typed) {
    return;
  }

  new Typed('.typing', {
    strings: ['Design Websites', 'Build E-commerce', 'Grow Businesses', 'Make You Money'],
    typeSpeed: 55,
    backSpeed: 35,
    backDelay: 1400,
    loop: true
  });
}

function initializeIntroAndHeroAnimations() {
  if (!window.gsap) {
    return;
  }

  const introTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  introTl
    .to('.intro-text', { y: 0, opacity: 1, duration: 0.8, delay: 0.2 })
    .to('.intro-text', { y: -20, opacity: 0, duration: 0.6, delay: 0.8 })
    .to('.intro-overlay', {
      opacity: 0,
      duration: 0.6,
      onComplete: () => {
        const overlay = document.getElementById('introOverlay');
        if (overlay) {
          overlay.style.display = 'none';
        }
      }
    }, '-=0.3');

  const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 2.2 });
  heroTl
    .from('.hero-badge', { y: 30, opacity: 0, duration: 0.7 })
    .from('.hero h1', { y: 50, opacity: 0, duration: 0.9 }, '-=0.3')
    .from('.typed-wrapper', { y: 30, opacity: 0, duration: 0.7 }, '-=0.5')
    .from('.hero-desc', { y: 30, opacity: 0, duration: 0.7 }, '-=0.4')
    .from('.hero-btns', { y: 30, opacity: 0, duration: 0.7 }, '-=0.4')
    .from('.stats-strip .stat', {
      y: 30,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: 'back.out(1.7)'
    }, '-=0.2');
}

function initializeRevealObserver() {
  const selectors = ['.card', '.price-card', '.t-card', '.contact-card', '.skill-badge', '.flashcard', '.faq-item'];
  const allElements = [];

  selectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      // Don't override if already set (e.g. by grid logic)
      if (!element.dataset.aoDelay) {
        element.dataset.aoDelay = String(index);
      }
      allElements.push(element);
    });
  });

  document.querySelectorAll('.projects-grid, .pricing-grid, .testimonial-grid, .skills-grid, .flashcards-deck, .faq-container').forEach((parent) => {
    Array.from(parent.children).forEach((child, index) => {
      child.dataset.aoDelay = String(index);
    });
  });

  if (!('IntersectionObserver' in window)) {
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const delay = Number(entry.target.dataset.aoDelay || 0) * 0.12;
        entry.target.style.animationDelay = `${delay}s`;
        entry.target.classList.add('ao-animate');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05 });

  allElements.forEach((element) => observer.observe(element));
}

function buildProjectCardMarkup(project, index) {
  const shortDescription = `${project.desc.substring(0, 70)}...`;
  return `
      <div class="card ao-animate" style="animation-delay: ${index * 0.1}s" onclick="openModal(${project.id})">
        <div class="card-img-wrap">
          <img loading="lazy" src="${project.img}" alt="${project.title}">
          <div class="card-tag">${project.tag}</div>
        </div>
        <div class="card-body">
          <h3>${project.title}</h3>
          <p>${shortDescription}</p>
          <div class="card-arrow">View Case Study &rarr;</div>
        </div>
      </div>
    `;
}

function renderProjects(filter = 'all') {
  const grid = document.getElementById('projectsGrid');
  if (!grid) {
    return;
  }

  const filteredProjects = filter === 'all'
    ? projects
    : projects.filter((project) => project.tag.toLowerCase() === filter.toLowerCase());

  const cardsMarkup = filteredProjects.map((project, index) => buildProjectCardMarkup(project, index)).join('');
  const placeholderMarkup = `
    <div class="card ao-animate" style="animation-delay: ${filteredProjects.length * 0.1}s; cursor:default;">
      <div class="card-img-wrap" style="display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#1a1a3a,#0d0d2a);">
        <div style="text-align:center;color:var(--muted);padding:20px;">
          <div style="font-size:2.5rem;margin-bottom:12px;">&#128640;</div>
          <div style="font-size:0.9rem;font-weight:600;color:var(--accent2);">Your Project Here</div>
        </div>
      </div>
      <div class="card-body">
        <h3>Next Client Project</h3>
        <p>Ready to build something amazing? Let&apos;s create your dream website together.</p>
        <div class="card-arrow" onclick="document.getElementById('contact').scrollIntoView({behavior:'smooth'})" style="cursor:pointer;">Get Started &rarr;</div>
      </div>
    </div>
  `;

  // Single write avoids repeated layout and style recalculation in loops.
  grid.innerHTML = cardsMarkup + placeholderMarkup;
  refreshProjectParallax();
}

function openProjectModal(id) {
  const project = projects.find((item) => item.id === id);
  if (!project || !modal) {
    return;
  }

  const modalImg = document.getElementById('modalImg');
  const modalTag = document.getElementById('modalTag');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalLink = document.getElementById('modalLink');

  if (!modalImg || !modalTag || !modalTitle || !modalDesc || !modalLink) {
    return;
  }

  modalImg.src = project.img;
  modalTag.innerText = project.tag;
  modalTitle.innerText = project.title;
  modalDesc.innerText = project.desc;
  modalLink.href = project.url || '#';
  
  // Update Preview Link
  const modalPreview = document.getElementById('modalPreview');
  if (modalPreview) {
    modalPreview.src = project.url || 'about:blank';
  }

  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
  
  // Animate modal content
  gsap.fromTo('.modal-content', { scale: 0.9, opacity: 0, y: 30 }, { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'power4.out', delay: 0.1 });
}

function closeProjectModal() {
  if (!modal) {
    return;
  }
  modal.classList.remove('show');
  document.body.style.overflow = 'auto';
}

function initializeProjectModal() {
  modal = document.getElementById('projectModal');
  const closeButton = document.querySelector('.close-modal');

  if (closeButton) {
    closeButton.addEventListener('click', closeProjectModal);
  }

  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeProjectModal();
    }
  });

  window.openModal = openProjectModal;
}

function initializeProjectFilters() {
  document.querySelectorAll('.filter-btn').forEach((button) => {
    button.addEventListener('click', (event) => {
      const target = event.currentTarget;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      document.querySelectorAll('.filter-btn').forEach((filterButton) => {
        filterButton.classList.remove('active');
      });

      target.classList.add('active');
      const nextFilter = target.dataset.filter || 'all';
      renderProjects(nextFilter);
    });
  });
}

function refreshProjectParallax() {
  if (!window.gsap || !window.ScrollTrigger) {
    return;
  }

  projectParallaxTweens.forEach((tween) => {
    if (tween.scrollTrigger) {
      tween.scrollTrigger.kill();
    }
    tween.kill();
  });
  projectParallaxTweens = [];

  const cards = gsap.utils.toArray('.card');
  cards.forEach((card) => {
    const image = card.querySelector('img');
    if (!image) {
      return;
    }

    const tween = gsap.fromTo(
      image,
      { yPercent: -15, scale: 1.15 },
      {
        yPercent: 15,
        ease: 'none',
        scrollTrigger: {
          trigger: card,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      }
    );

    projectParallaxTweens.push(tween);
  });
}

function initializeProcessAnimations() {
  if (!window.gsap || !window.ScrollTrigger) {
    return;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const processSteps = gsap.utils.toArray('.process-step');
  if (prefersReducedMotion) {
    gsap.set(processSteps, { y: 0, opacity: 1 });
  } else {
    processSteps.forEach((step) => {
      gsap.fromTo(
        step,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: step,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });
  }

  const treePaths = gsap.utils.toArray('.tree-trunk, .tree-branch');
  const leafWrappers = gsap.utils.toArray('.leaf-wrapper');

  if (treePaths.length > 0 || leafWrappers.length > 0) {
    if (prefersReducedMotion) {
      gsap.set(treePaths, { clearProps: 'strokeDasharray,strokeDashoffset' });
      gsap.set(leafWrappers, { scale: 1, opacity: 1, transformOrigin: 'center center' });
    } else {
      gsap.set(treePaths, { strokeDasharray: 1000, strokeDashoffset: 1000 });
      gsap.set(leafWrappers, {
        scale: TREE_LEAF_REVEAL_START_SCALE,
        opacity: 0,
        transformOrigin: 'center center'
      });

      const growTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: '#processTree',
          start: 'top 85%',
          end: 'bottom 45%',
          scrub: 1.5,
          invalidateOnRefresh: true
        }
      });

      growTimeline.to(treePaths, {
        strokeDashoffset: 0,
        stagger: 0.15,
        ease: 'power2.out',
        duration: 2
      }, 0);

      growTimeline.to(leafWrappers, {
        scale: 1,
        opacity: 1,
        stagger: TREE_LEAF_REVEAL_STAGGER,
        ease: 'power2.out',
        duration: 0.85
      }, 0.45);
    }
  }

  const driftLeaves = gsap.utils.toArray('.tree-leaf-drift');
  if (!prefersReducedMotion && driftLeaves.length > 0) {
    treeAmbientTimeline = gsap.timeline({ repeat: -1, yoyo: true });
    treeAmbientTimeline.to(driftLeaves, {
      x: TREE_LEAF_DRIFT_X,
      y: TREE_LEAF_DRIFT_Y,
      opacity: 0.72,
      duration: 2.8,
      ease: 'sine.inOut',
      stagger: {
        each: 0.35
      },
      transformOrigin: 'center center'
    });
  } else {
    treeAmbientTimeline = null;
  }
}

function createPetalPool() {
  const container = document.getElementById('leaves-container');
  if (!container) {
    return;
  }

  for (let index = 0; index < PETAL_POOL_SIZE; index += 1) {
    const element = document.createElement('div');
    element.className = 'falling-leaf';
    element.setAttribute('aria-hidden', 'true');
    element.style.opacity = '0';
    container.appendChild(element);

    petalPool.push({
      element,
      active: false,
      animation: null
    });
  }
}

function getNextAvailablePetal() {
  for (let attempts = 0; attempts < petalPool.length; attempts += 1) {
    const index = (petalPoolCursor + attempts) % petalPool.length;
    const candidate = petalPool[index];
    if (!candidate.active) {
      petalPoolCursor = (index + 1) % petalPool.length;
      return candidate;
    }
  }
  return null;
}

function releasePetal(petal) {
  if (petal.animation) {
    petal.animation.cancel();
  }
  petal.animation = null;
  petal.active = false;
  petal.element.style.opacity = '0';
  petal.element.style.transform = 'translate3d(-200px, -200px, 0)';
}

function animatePetal(petal, spawnWithinViewport) {
  const viewportWidth = Math.max(window.innerWidth, 320);
  const viewportHeight = Math.max(window.innerHeight, 500);

  const size = randomBetween(6, 16);
  const startX = spawnWithinViewport ? randomBetween(viewportWidth * 0.2, viewportWidth * 0.8) : randomBetween(0, viewportWidth);
  const startY = spawnWithinViewport ? randomBetween(viewportHeight * 0.3, viewportHeight * 0.7) : -40;
  const endY = spawnWithinViewport ? startY + randomBetween(100, 300) : viewportHeight + 80;
  const drift = spawnWithinViewport ? randomBetween(-150, 150) : randomBetween(-90, 90);
  const swayOffset = randomBetween(-26, 26);
  const midpointX = startX + drift * 0.55 + swayOffset;
  const midpointY = startY + (endY - startY) * 0.5;
  const endX = startX + drift;
  const duration = spawnWithinViewport ? randomBetween(2000, 4000) : randomBetween(7000, 11000);
  const rotation = randomBetween(120, 360);

  petal.element.style.width = `${size}px`;
  petal.element.style.height = `${size}px`;
  petal.element.style.background = petalColors[Math.floor(Math.random() * petalColors.length)];
  petal.element.style.opacity = String(randomBetween(0.55, 0.9));
  petal.element.style.transform = `translate3d(${startX}px, ${startY}px, 0) scale(0) rotate(0deg)`;

  petal.active = true;
  petal.animation = petal.element.animate([
    { transform: `translate3d(${startX}px, ${startY}px, 0) scale(0) rotate(0deg)`, opacity: 0 },
    { transform: `translate3d(${midpointX}px, ${midpointY}px, 0) scale(1.2) rotate(${rotation * 0.5}deg)`, opacity: 0.8, offset: 0.2 },
    { transform: `translate3d(${endX}px, ${endY}px, 0) scale(1) rotate(${rotation}deg)`, opacity: 0 }
  ], {
    duration,
    easing: 'linear',
    fill: 'forwards'
  });

  petal.animation.onfinish = () => {
    releasePetal(petal);
  };
}

function spawnPetal(spawnWithinViewport = false) {
  const petal = getNextAvailablePetal();
  if (!petal) {
    return;
  }
  animatePetal(petal, spawnWithinViewport);
}

function startPetalSpawner() {
  if (petalSpawnIntervalId !== null) {
    return;
  }

  petalSpawnIntervalId = window.setInterval(() => {
    spawnPetal(false);
  }, PETAL_SPAWN_INTERVAL_MS);
}

function stopPetalSpawner() {
  if (petalSpawnIntervalId === null) {
    return;
  }
  window.clearInterval(petalSpawnIntervalId);
  petalSpawnIntervalId = null;
}

function pausePetalAnimations() {
  petalPool.forEach((petal) => {
    if (petal.active && petal.animation) {
      petal.animation.pause();
    }
  });
}

function resumePetalAnimations() {
  petalPool.forEach((petal) => {
    if (petal.active && petal.animation && petal.animation.playState === 'paused') {
      petal.animation.play();
    }
  });
}

function initializePetals() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  createPetalPool();
  if (petalPool.length === 0) {
    return;
  }

  // Object pooling keeps DOM node count fixed and prevents create/remove churn.
  for (let index = 0; index < 9; index += 1) {
    spawnPetal(true);
  }

  startPetalSpawner();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopPetalSpawner();
      pausePetalAnimations();
    } else {
      resumePetalAnimations();
      startPetalSpawner();
    }
  });
}

function initializeContactForm() {
  const form = document.getElementById('contactForm');
  const nameInput = document.getElementById('contactName');
  const emailInput = document.getElementById('contactEmail');
  const messageInput = document.getElementById('contactMessage');
  const status = document.getElementById('contactFormStatus');
  const whatsappFallback = document.getElementById('contactWhatsAppFallback');

  if (!(form instanceof HTMLFormElement) || !(nameInput instanceof HTMLInputElement) ||
      !(emailInput instanceof HTMLInputElement) || !(messageInput instanceof HTMLTextAreaElement) ||
      !(status instanceof HTMLElement) || !(whatsappFallback instanceof HTMLButtonElement)) {
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const setStatus = (message, isError) => {
    status.textContent = message;
    status.classList.toggle('error', Boolean(isError));
  };

  const setFieldErrorState = (field, hasError) => {
    field.classList.toggle('is-invalid', hasError);
    field.setAttribute('aria-invalid', hasError ? 'true' : 'false');
  };

  const getPayload = () => {
    return {
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      message: messageInput.value.trim()
    };
  };

  const validate = () => {
    const payload = getPayload();
    const nameValid = payload.name.length >= 2;
    const emailValid = emailPattern.test(payload.email);
    const messageValid = payload.message.length >= 10;

    setFieldErrorState(nameInput, !nameValid);
    setFieldErrorState(emailInput, !emailValid);
    setFieldErrorState(messageInput, !messageValid);

    return nameValid && emailValid && messageValid;
  };

  const openWhatsAppWithPayload = () => {
    const payload = getPayload();
    const text = `Hi Ittehad!%0A%0AName: ${encodeURIComponent(payload.name || 'N/A')}%0AEmail: ${encodeURIComponent(payload.email || 'N/A')}%0AProject details: ${encodeURIComponent(payload.message || 'I want to discuss a project.')}`;
    window.open(`https://wa.me/8801838917670?text=${text}`, '_blank', 'noopener');
  };

  [nameInput, emailInput, messageInput].forEach((field) => {
    field.addEventListener('input', () => {
      let isValid = true;
      if (field === nameInput) isValid = nameInput.value.trim().length >= 2;
      if (field === emailInput) isValid = emailPattern.test(emailInput.value.trim());
      if (field === messageInput) isValid = messageInput.value.trim().length >= 10;
      
      setFieldErrorState(field, !isValid);
      
      if (status.textContent) {
        setStatus('', false);
      }
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!validate()) {
      setStatus('Please enter a valid name, email, and message (at least 10 characters).', true);
      return;
    }

    const payload = getPayload();
    const subject = encodeURIComponent(`New project inquiry from ${payload.name}`);
    const body = encodeURIComponent(
      `Name: ${payload.name}\n` +
      `Email: ${payload.email}\n\n` +
      `${payload.message}`
    );

    window.location.href = `mailto:ahnafittehad24@gmail.com?subject=${subject}&body=${body}`;
    setStatus('Your email app should open now. If it does not, use the WhatsApp fallback button.', false);

    // Success Celebration: Burst of Petals
    const celebrationCount = 25;
    for (let i = 0; i < celebrationCount; i++) {
      setTimeout(() => {
        spawnPetal(true); // pass true to spawn from middle/bottom
      }, i * 60);
    }
  });

  whatsappFallback.addEventListener('click', () => {
    openWhatsAppWithPayload();
  });
}

/*
 * WAX SEAL ANIMATION LOGIC
 * Why this exists: To provide a tactile, realistic physical micro-interaction 
 * where the user "breaks the seal" to open the contact form. 
 * How it's controlled: This animation is 100% scroll-driven via GSAP ScrollTrigger.
 * It is tied to the exact same scroll timeline as the envelope opening, ensuring
 * the wax visibly cracks and splits before the flap fully clears it. No autoplay is used;
 * the user's scroll position dictates the exact frame of the seal breaking.
 */
function initializeEnvelopeAnimation() {
  const envelopeWrapper = document.querySelector('.envelope-wrapper');
  if (!envelopeWrapper) return;

  const setEnvelopeOpenState = () => {
    const flap = document.querySelector('.flap');
    const pocket = document.querySelector('.envelope-pocket');
    const waxSeal = document.querySelector('.wax-seal');

    if (window.gsap) {
      gsap.set('.flap', { rotationX: 180 });
      gsap.set('.envelope-pocket', { rotationX: -180 });
      gsap.set('.wax-seal', { opacity: 0 });
      return;
    }

    if (flap instanceof HTMLElement) {
      flap.style.transform = 'rotateX(180deg)';
    }
    if (pocket instanceof HTMLElement) {
      pocket.style.transform = 'rotateX(-180deg)';
    }
    if (waxSeal instanceof HTMLElement) {
      waxSeal.style.opacity = '0';
    }
  };

  if (!window.gsap || !window.ScrollTrigger) {
    setEnvelopeOpenState();
    return;
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setEnvelopeOpenState();
    return;
  }

  const contactSection = document.getElementById('contact');

  let tl;
  try {
    tl = gsap.timeline({
      scrollTrigger: {
        trigger: contactSection || envelopeWrapper,
        start: 'top 85%',
        // End at upper viewport quarter so animation range stays inside contact section travel.
        end: 'top 40%',
        scrub: 1.5,
        pin: false,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        markers: false
      }
    });
  } catch (error) {
    setEnvelopeOpenState();
    return;
  }

  // Flaps open entirely
  tl.to('.flap', { rotationX: 180, duration: 1, ease: 'none' }, 0);
  tl.to('.envelope-pocket', { rotationX: -180, duration: 1, ease: 'none' }, 0);

  // Phase 1: Pressure buildup before breaking
  tl.addLabel('sealCompress', 0)
    .to('.wax-seal', { scale: 0.92, rotate: 2, duration: 0.15 }, 'sealCompress')

  // Phase 2: Crack appears
  tl.addLabel('sealCrack', 0.15)
    .to('.wax-seal', { '--crack-opacity': 1, duration: 0.15 }, 'sealCrack')

  // Phase 3: Seal splits apart
  tl.addLabel('sealBreak', 0.3)
    .to('.wax-left', { x: -12, y: 8, rotation: -12, duration: 0.15 }, 'sealBreak')
    .to('.wax-right', { x: 14, y: 10, rotation: 15, duration: 0.15 }, 'sealBreak')
    .to('.wax-seal', { opacity: 0.6, duration: 0.15 }, 'sealBreak')

  // Phase 4: Removal before flap clears
  tl.addLabel('sealDisappear', 0.45)
    .to('.wax-seal', { opacity: 0, duration: 0.1 }, 'sealDisappear');
}

function initializeFaq() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    trigger.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Close all other items
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          const content = otherItem.querySelector('.faq-content');
          if (content) content.style.maxHeight = null;
        }
      });

      // Toggle current item
      item.classList.toggle('active');
      const content = item.querySelector('.faq-content');
      if (content) {
        if (!isActive) {
          content.style.maxHeight = content.scrollHeight + 'px';
        } else {
          content.style.maxHeight = null;
        }
      }
    });
  });
}

function initializeTheme() {
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('theme') || 'light';
  
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Animate toggle
    gsap.fromTo(themeToggle, { scale: 0.8, rotation: -45 }, { scale: 1, rotation: 0, duration: 0.4, ease: 'back.out(1.7)' });
  });
}

function bootstrap() {
  projects = [...defaultProjects];

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  initializeProjectModal();
  initializeProjectFilters();
  renderProjects();
  initializeRevealObserver();
  initializeContactForm();
  initializePetals();
  initializeFaq();
  initializeTheme();

  initializeScrollDrivenUi();

  initializeCursorEffects();
  initializeTypedEffect();
  initializeIntroAndHeroAnimations();
  initializeProcessAnimations();
  initializeEnvelopeAnimation();

  startScrollLoop();
}

document.addEventListener('DOMContentLoaded', bootstrap);
