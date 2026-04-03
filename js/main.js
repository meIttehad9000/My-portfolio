/* ── Premium Velocity Cursor ─────────────────────────────── */
const glow = document.getElementById('cursorGlow');
if (glow) {
  // Use GSAP's quickTo for high-performance physics tracking
  const xTo = gsap.quickTo(glow, "left", { duration: 0.1, ease: "power3" });
  const yTo = gsap.quickTo(glow, "top", { duration: 0.1, ease: "power3" });
  const rotateTo = gsap.quickTo(glow, "rotation", { duration: 0.4, ease: "power3.out" });

  let lastX = 0;
  
  // Set initial fixed translation offset because we removed it from CSS
  gsap.set(glow, { xPercent: -15, yPercent: -15 });

  document.addEventListener('mousemove', e => {
    xTo(e.clientX);
    yTo(e.clientY);

    // Calculate horizontal velocity to sway the branch
    const deltaX = e.clientX - lastX;
    lastX = e.clientX;

    // Clamp rotation angle to prevent violent spinning
    const speed = Math.max(-45, Math.min(45, deltaX * 0.8));
    rotateTo(speed);
  });

  // Softly return the branch to resting position when mouse stops
  setInterval(() => { rotateTo(0); }, 150);
  window.addEventListener('scroll', () => { rotateTo(0); });
}

/* ── Header shrink on scroll ─────────────────────────── */
window.addEventListener('scroll', () => {
  document.getElementById('site-header').classList.toggle('scrolled', window.scrollY > 60);
});

/* ── Typed.js ────────────────────────────────────────── */
new Typed('.typing', {
  strings: ["Design Websites", "Build E-commerce", "Grow Businesses", "Make You Money 💰"],
  typeSpeed: 55,
  backSpeed: 35,
  backDelay: 1400,
  loop: true
});

/* ── GSAP + ScrollTrigger ────────────────────────────── */
gsap.registerPlugin(ScrollTrigger);

/* ── Intro Animation ─────────────────────────────────── */
const introTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
introTl
  .to('.intro-text', { y: 0, opacity: 1, duration: 0.8, delay: 0.2 })
  .to('.intro-text', { y: -20, opacity: 0, duration: 0.6, delay: 0.8 })
  .to('.intro-overlay', { opacity: 0, duration: 0.6, onComplete: () => {
    const overlay = document.getElementById('introOverlay');
    if (overlay) overlay.style.display = 'none';
  } }, '-=0.3');

// Hero entrance
const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 2.2 });
heroTl
  .from('.hero-badge',   { y: 30, opacity: 0, duration: 0.7 })
  .from('.hero h1',      { y: 50, opacity: 0, duration: 0.9 }, '-=0.3')
  .from('.typed-wrapper',{ y: 30, opacity: 0, duration: 0.7 }, '-=0.5')
  .from('.hero-desc',    { y: 30, opacity: 0, duration: 0.7 }, '-=0.4')
  .from('.hero-btns',    { y: 30, opacity: 0, duration: 0.7 }, '-=0.4')
  .from('.stats-strip .stat', {
    y: 30, opacity: 0, duration: 0.5, stagger: 0.1, ease: 'back.out(1.7)'
  }, '-=0.2');

/* ── Scroll-reveal via IntersectionObserver ──────────────── */
/* Cards are always visible (no opacity:0). JS adds .ao-animate   */
/* for a subtle slide-up entrance effect only.                     */
(function() {
  const selectors = [
    '.card', '.price-card', '.t-card', '.contact-card', '.skill-badge', '.flashcard'
  ];

  const allEls = [];
  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.dataset.aoDelay = i;
      allEls.push(el);
    });
  });

  // Stagger delay within grid parents and flashcards deck
  document.querySelectorAll('.projects-grid, .pricing-grid, .testimonial-grid, .skills-grid, .flashcards-deck').forEach(parent => {
    Array.from(parent.children).forEach((child, i) => {
      child.dataset.aoDelay = i;
    });
  });

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = (entry.target.dataset.aoDelay || 0) * 0.12;
          entry.target.style.animationDelay = delay + 's';
          entry.target.classList.add('ao-animate');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05 });
    allEls.forEach(el => io.observe(el));
  }
})();

window.addEventListener('scroll', () => {
  const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const scrolled = (winScroll / height) * 100;
  const bar = document.getElementById('scrollProgress');
  if(bar) bar.style.width = scrolled + '%';
});

// Default Projects
const defaultProjects = [
  { id: 1, title: 'FataFati Streetwear', desc: 'Full e-commerce system with cart, admin panel & WhatsApp ordering integration.\n\nHighlights: \n- Real-time cart updates\n- Admin dashboard tracking\n- WhatsApp checkout flow', tag: 'E-COMMERCE', img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80', url: 'https://stayfatafati.netlify.app' },
  { id: 2, title: 'Eat Healthy BD', desc: 'Healthy food delivery platform with a focus on fresh, organic ingredients.\n\nHighlights:\n- Subscription models\n- Nutritional filtering\n- Optimized mobile experience', tag: 'GROCERY', img: 'https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=800&q=80', url: 'https://eathealthybd.netlify.app' },
  { id: 3, title: 'Rajib Electronics', desc: 'Modern gadget store with premium UI, product showcasing and smooth animations.\n\nHighlights:\n- GSAP Animations\n- Premium Red/Gold thematic design\n- Blazing fast load times', tag: 'BUSINESS', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80', url: 'https://rajib-electronics.netlify.app' }
];

let projects = JSON.parse(localStorage.getItem('portfolioProjects')) || defaultProjects;
if(!localStorage.getItem('portfolioProjects')) {
  localStorage.setItem('portfolioProjects', JSON.stringify(projects));
}

function renderProjects(filter = 'all') {
  const grid = document.getElementById('projectsGrid');
  if(!grid) return;
  
  projects = JSON.parse(localStorage.getItem('portfolioProjects')) || defaultProjects;
  grid.innerHTML = '';
  
  const filtered = filter === 'all' ? projects : projects.filter(p => p.tag.toLowerCase() === filter.toLowerCase());
  
  filtered.forEach((p, i) => {
    grid.innerHTML += `
      <div class="card ao-animate" style="animation-delay: ${i*0.1}s" onclick="openModal(${p.id})">
        <div class="card-img-wrap">
          <img loading="lazy" src="${p.img}" alt="${p.title}">
          <div class="card-tag">${p.tag}</div>
        </div>
        <div class="card-body">
          <h3>${p.title}</h3>
          <p>${p.desc.substring(0, 70)}...</p>
          <div class="card-arrow">View Case Study &rarr;</div>
        </div>
      </div>
    `;
  });
  
  grid.innerHTML += `
    <div class="card ao-animate" style="animation-delay: ${filtered.length*0.1}s; cursor:default;">
      <div class="card-img-wrap" style="display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#1a1a3a,#0d0d2a);">
        <div style="text-align:center;color:var(--muted);padding:20px;">
          <div style="font-size:2.5rem;margin-bottom:12px;">🚀</div>
          <div style="font-size:0.9rem;font-weight:600;color:var(--accent2);">Your Project Here</div>
        </div>
      </div>
      <div class="card-body">
        <h3>Next Client Project</h3>
        <p>Ready to build something amazing? Let's create your dream website together.</p>
        <div class="card-arrow" onclick="location='#contact'" style="cursor:pointer;">Get Started &rarr;</div>
      </div>
    </div>
  `;
}

// Modal Logic
const modal = document.getElementById('projectModal');
const closeBtn = document.querySelector('.close-modal');

window.openModal = function(id) {
  const p = projects.find(x => x.id === id);
  if(!p) return;
  document.getElementById('modalImg').src = p.img;
  document.getElementById('modalTag').innerText = p.tag;
  document.getElementById('modalTitle').innerText = p.title;
  document.getElementById('modalDesc').innerText = p.desc;
  document.getElementById('modalLink').href = p.url || '#';
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
};

if(closeBtn) {
  closeBtn.onclick = function() {
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
  };
}
window.addEventListener('click', function(e) {
  if (e.target == modal) {
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
  }
});

// Filters
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    renderProjects(e.target.dataset.filter);
  });
});

// Initial render
document.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('projectsGrid')) {
        renderProjects();
    }
});

// --- Process Scroll Animations ---
document.addEventListener('DOMContentLoaded', () => {
    // Reveal Process timeline steps
    const processSteps = gsap.utils.toArray('.process-step');
    if (processSteps.length > 0) {
        processSteps.forEach((step, i) => {
            gsap.fromTo(step, 
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

    // --- Premium Project Card Image Parallax ---
    const projectCards = gsap.utils.toArray('.card');
    projectCards.forEach(card => {
        const img = card.querySelector('img');
        if (img) {
            gsap.fromTo(img, 
                { yPercent: -15, scale: 1.15 }, 
                {
                    yPercent: 15,
                    ease: "none",
                    scrollTrigger: {
                        trigger: card,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: true
                    }
                }
            );
        }
    });

    // --- Abstract Tree Growth (Scroll) ---
    const treePaths = gsap.utils.toArray('.tree-trunk, .tree-branch');
    const leafWrappers = gsap.utils.toArray('.leaf-wrapper');
    
    if (treePaths.length > 0 || leafWrappers.length > 0) {
        // Setup hidden initial states for drawing
        gsap.set(treePaths, { strokeDasharray: 1000, strokeDashoffset: 1000 });
        gsap.set(leafWrappers, { scale: 0, opacity: 0, transformOrigin: "center center" });
        
        // Coordinated scroll timeline
        const growTl = gsap.timeline({
            scrollTrigger: {
                trigger: '#processTimeline',
                start: 'top 80%',
                end: 'bottom 40%',
                scrub: 1
            }
        });

        // 1. Grow trunk and branches sequentially
        growTl.to(treePaths, {
            strokeDashoffset: 0,
            stagger: 0.15,
            ease: "power2.out",
            duration: 2
        }, 0);

        // 2. Pop leaves sequentially shortly after branch growth starts
        growTl.to(leafWrappers, {
            scale: 1,
            opacity: 1,
            stagger: 0.1,
            ease: "back.out(1.5)",
            duration: 1
        }, 0.5);
    }

    // --- Abstract Tree Animation Loop ---
    const treeLeaves = gsap.utils.toArray('.tree-leaf');
    if (treeLeaves.length > 0) {
        // Master ambient timeline for continuous soft loop
        const treeTl = gsap.timeline({ repeat: -1, yoyo: true });
        
        // Softly pulse the leaves (opacity and slight scale)
        treeTl.to(treeLeaves, {
            scale: 1.3,
            opacity: 0.4,
            duration: 3,
            ease: "sine.inOut",
            stagger: {
                each: 0.4,
                yoyo: true,
                repeat: -1
            },
            transformOrigin: "center center"
        });

        // Scroll velocity deceleration logic
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            // Immediately slow down ambient loop to a crawl
            gsap.to(treeTl, { timeScale: 0.15, duration: 0.5, overwrite: "auto" });
            
            clearTimeout(scrollTimeout);
            // Resume normal ambient pace after scrolling stops
            scrollTimeout = setTimeout(() => {
                gsap.to(treeTl, { timeScale: 1, duration: 1.5, overwrite: "auto" });
            }, 200);
        }, { passive: true });
    }

    // Hide floating WhatsApp button when reaching the bottom (Contact section)
    const fab = document.querySelector('.whatsapp-fab');
    if (fab) {
        // Add a clean transition for the FAB opacity
        fab.style.transition = 'opacity 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease';
        
        window.addEventListener('scroll', () => {
            const scrollPosition = window.innerHeight + window.scrollY;
            const bodyHeight = document.documentElement.scrollHeight;
            
            // If within 400px of the bottom
            if (bodyHeight - scrollPosition < 400) {
                fab.style.opacity = '0';
                fab.style.pointerEvents = 'none';
            } else {
                fab.style.opacity = '1';
                fab.style.pointerEvents = 'all';
            }
        });
    }
});

/* ── Falling Petals (Matcha Theme) ────────────────────────── */
function createLeaf() {
    const container = document.getElementById('leaves-container');
    if (!container) return;
    
    const leaf = document.createElement('div');
    leaf.classList.add('falling-leaf');
    
    // Randomize leaf properties
    const size = Math.random() * 12 + 8; // 8px to 20px
    leaf.style.width = `${size}px`;
    leaf.style.height = `${size}px`;
    leaf.style.left = `${Math.random() * 100}vw`; // Random horizontal start
    
    const duration = Math.random() * 6 + 6; // 6s to 12s falling down
    const swayDuration = Math.random() * 2 + 2; 
    
    leaf.style.animationDuration = `${duration}s, ${swayDuration}s`;
    leaf.style.animationDelay = `0s, -${Math.random() * 2}s`;
    
    const op = Math.random() * 0.3 + 0.1;
    leaf.style.opacity = op;

    container.appendChild(leaf);
    
    // Remove leaf after it falls off screen
    setTimeout(() => {
        if(leaf.parentNode) leaf.remove();
    }, duration * 1000);
}

document.addEventListener('DOMContentLoaded', () => {
    // Generate a leaf periodically
    setInterval(createLeaf, 500);

    // Initial burst to populate screen
    for(let i=0; i<20; i++) {
        setTimeout(() => {
            const leaf = document.createElement('div');
            leaf.classList.add('falling-leaf');
            leaf.style.width = `${Math.random() * 12 + 8}px`;
            leaf.style.height = leaf.style.width;
            leaf.style.left = `${Math.random() * 100}vw`;
            leaf.style.top = `${Math.random() * 100}vh`; // spawn on screen
            
            const duration = Math.random() * 6 + 6;
            leaf.style.animationDuration = `${duration}s, ${Math.random() * 2 + 2}s`;
            leaf.style.opacity = Math.random() * 0.3 + 0.1;
            
            document.getElementById('leaves-container')?.appendChild(leaf);
            setTimeout(() => { if(leaf.parentNode) leaf.remove(); }, duration * 1000);
        }, Math.random() * 1500);
    }
});
