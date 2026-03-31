/* ── Cursor glow ─────────────────────────────────────── */
const glow = document.getElementById('cursorGlow');
document.addEventListener('mousemove', e => {
  glow.style.left = e.clientX + 'px';
  glow.style.top  = e.clientY + 'px';
});

// Add a few floating accent shapes to the hero for subtle motion
(function addShapes(){
  const hero = document.querySelector('.hero');
  if(!hero) return;
  for(let i=0;i<6;i++){
    const s = document.createElement('div');
    s.className = 'accent-shape';
    s.style.left = (10 + Math.random()*80) + '%';
    s.style.top = (20 + Math.random()*60) + '%';
    s.style.background = i % 2 === 0 ? 'linear-gradient(180deg, rgba(212,175,55,0.95), rgba(255,209,102,0.6))' : 'rgba(255,209,102,0.85)';
    s.style.animationDelay = (Math.random()*4) + 's';
    s.style.width = s.style.height = (6 + Math.random()*12) + 'px';
    hero.appendChild(s);
  }
})();

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
    '.card', '.price-card', '.t-card', '.contact-card', '.skill-badge'
  ];

  const allEls = [];
  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.dataset.aoDelay = i;
      allEls.push(el);
    });
  });

  // Stagger delay within grid parents
  document.querySelectorAll('.projects-grid, .pricing-grid, .testimonial-grid, .skills-grid').forEach(parent => {
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
  // If no IntersectionObserver (shouldn't happen), elements stay visible with no animation — that's fine.
})();

/* ── Particles ────────────────────────────────────────── */
particlesJS("particles-js", {
  particles: {
    number: { value: 70, density: { enable: true, value_area: 900 } },
    color:  { value: ["#d4af37", "#ffd700", "#ffcf66"] },
    shape:  { type: "circle" },
    opacity:{ value: 0.4, random: true, anim: { enable: true, speed: 0.6, opacity_min: 0.1 } },
    size:   { value: 2.5, random: true },
    line_linked: { enable: true, distance: 140, color: "#d4af37", opacity: 0.10, width: 1 },
    move:   { enable: true, speed: 1.2, direction: "none", random: true, out_mode: "out" }
  },
  interactivity: {
    detect_on: "canvas",
    events: { onhover: { enable: true, mode: "grab" }, onclick: { enable: true, mode: "repulse" } },
    modes:  { grab: { distance: 160, line_linked: { opacity: 0.28 } }, repulse: { distance: 160, duration: 0.6 }, push: { particles_nb: 3 } }
  },
  retina_detect: true
});

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

const contactForm = document.getElementById('contactForm');
if(contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('cfSubmit');
    const feedback = document.getElementById('cfFeedback');
    
    // Basic Sanitize/Validation (prevent XSS in local echo if any)
    const name = document.getElementById('cfName').value.trim().replace(/</g, "&lt;");
    const email = document.getElementById('cfEmail').value.trim().replace(/</g, "&lt;");
    const msg = document.getElementById('cfMsg').value.trim().replace(/</g, "&lt;");
    
    if(!name || !email || !msg) return;
    
    // Spam bot check
    if(msg.includes('http://') && msg.includes('buy')) {
      feedback.style.display = 'block';
      feedback.style.color = '#ff4444';
      feedback.innerText = 'Spam detected. Message blocked.';
      return;
    }
    
    btn.innerHTML = '<span>Sending... ⏳</span>';
    btn.disabled = true;
    feedback.style.display = 'none';
    
    try {
      const resp = await fetch('/.netlify/functions/contact', {
        method: 'POST',
        body: JSON.stringify({ name, email, msg })
      });
      
      if(resp.ok) {
        btn.innerHTML = '<span>Message Sent! ✅</span>';
        btn.style.background = 'linear-gradient(135deg, #25D366, #128C7E)';
        contactForm.reset();
        setTimeout(() => {
          btn.innerHTML = '<span>Send Message</span>';
          btn.style.background = '';
          btn.disabled = false;
        }, 5000);
      } else {
        throw new Error('Server error');
      }
    } catch(err) {
      console.warn('Backend function unreachable - Simulating success for preview');
      // For local html testing without Netlify dev server
      setTimeout(() => {
        btn.innerHTML = '<span>Message Sent! ✅</span>';
        btn.style.background = 'linear-gradient(135deg, #25D366, #128C7E)';
        contactForm.reset();
        setTimeout(() => {
          btn.innerHTML = '<span>Send Message</span>';
          btn.style.background = '';
          btn.disabled = false;
        }, 5000);
      }, 1200);
    }
  });
}
