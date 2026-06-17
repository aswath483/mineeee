/* ── LENIS SMOOTH SCROLL ── */
const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

/* ── REGISTER PLUGINS ── */
gsap.registerPlugin(ScrollTrigger);
// SplitText is a Club GSAP plugin — graceful fallback below if unavailable
const hasSplit = typeof SplitText !== 'undefined';

/* ── THREE.JS STARFIELD (HERO) ── */
(function initStars() {
  const canvas = document.getElementById('star-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 1000);
  camera.position.z = 1;

  // Star geometry
  const COUNT = 2000;
  const positions = new Float32Array(COUNT * 3);
  const sizes     = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 5 - 1;
    sizes[i] = Math.random() * 2 + 0.5;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime:  { value: 0 },
      uColor: { value: new THREE.Color('#e8d5a3') },
    },
    vertexShader: `
      attribute float size;
      uniform float uTime;
      varying float vAlpha;
      void main() {
        vec3 pos = position;
        pos.z += sin(uTime * 0.3 + position.x * 2.0) * 0.02;
        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = size * (250.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
        vAlpha = 0.4 + 0.6 * abs(sin(uTime * 0.5 + position.y * 3.0));
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying float vAlpha;
      void main() {
        float d = distance(gl_PointCoord, vec2(0.5));
        if (d > 0.5) discard;
        float alpha = smoothstep(0.5, 0.0, d) * vAlpha;
        gl_FragColor = vec4(uColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const stars = new THREE.Points(geo, mat);
  scene.add(stars);

  function resize() {
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', e => {
    mouseX = (e.clientX / innerWidth  - 0.5) * 0.3;
    mouseY = (e.clientY / innerHeight - 0.5) * 0.3;
  });

  const clock = new THREE.Clock();
  (function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    mat.uniforms.uTime.value = t;
    stars.rotation.y = t * 0.02 + mouseX;
    stars.rotation.x = mouseY * 0.5;
    renderer.render(scene, camera);
  })();
})();

/* ── THREE.JS PARTICLES (MESSAGE) ── */
(function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 100);
  camera.position.z = 3;

  const COUNT = 300;
  const positions = new Float32Array(COUNT * 3);
  const speeds    = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 8;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
    speeds[i] = Math.random() * 0.5 + 0.2;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));

  const mat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: `
      attribute float speed;
      uniform float uTime;
      varying float vAlpha;
      void main() {
        vec3 pos = position;
        pos.y = mod(pos.y + uTime * speed * 0.15, 8.0) - 4.0;
        pos.x += sin(uTime * speed * 0.3 + position.z) * 0.1;
        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = 2.0 * (200.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
        vAlpha = 0.3 + 0.4 * abs(sin(uTime * speed + position.x));
      }
    `,
    fragmentShader: `
      varying float vAlpha;
      void main() {
        float d = distance(gl_PointCoord, vec2(0.5));
        if (d > 0.5) discard;
        gl_FragColor = vec4(0.906, 0.769, 0.722, smoothstep(0.5, 0.0, d) * vAlpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  scene.add(new THREE.Points(geo, mat));

  function resize() {
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  const clock = new THREE.Clock();
  (function animate() {
    requestAnimationFrame(animate);
    mat.uniforms.uTime.value = clock.getElapsedTime();
    renderer.render(scene, camera);
  })();
})();

/* ── HERO INTRO ANIMATION ── */
function splitAndAnimate(el, type = 'chars') {
  if (!el) return [];
  if (hasSplit) {
    const split = new SplitText(el, { type: 'chars,words' });
    return type === 'chars' ? split.chars : split.words;
  }
  // fallback — wrap each word in a span
  const words = el.textContent.trim().split(' ');
  el.innerHTML = words.map(w => `<span class="word" style="display:inline-block;overflow:hidden"><span class="word-inner" style="display:inline-block">${w}</span></span>`).join(' ');
  return Array.from(el.querySelectorAll('.word-inner'));
}

window.addEventListener('load', () => {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  // pre-title
  const preEl = document.querySelector('.pre-title');
  const preChars = splitAndAnimate(preEl, 'chars');
  tl.to(preEl, { opacity: 1, duration: 0.01 })
    .from(preChars.length ? preChars : preEl, {
      opacity: 0, y: 10, stagger: 0.03, duration: 0.8
    }, 0.5);

  // hero title
  const titleEl = document.querySelector('.hero-title');
  const titleChars = splitAndAnimate(titleEl, 'chars');
  tl.to(titleEl, { opacity: 1, duration: 0.01 }, 1.2)
    .from(titleChars.length ? titleChars : titleEl, {
      opacity: 0, y: 60, rotateX: -40, stagger: 0.04, duration: 1, ease: 'power4.out'
    }, 1.2);

  // name
  const nameEl = document.querySelector('.hero-name');
  tl.to(nameEl, { opacity: 1, duration: 1.2, ease: 'power2.out' }, 2.2);

  // date
  const dateEl = document.querySelector('.hero-date');
  tl.to(dateEl, { opacity: 1, duration: 1, ease: 'power2.out' }, 2.8);

  // scroll cue
  tl.to('.scroll-cue', { opacity: 1, y: 0, duration: 1 }, 3.4);
});

/* ── CHAPTER SCROLL REVEALS ── */
document.querySelectorAll('.chapter').forEach(chapter => {
  const dir = chapter.dataset.dir;
  const media = chapter.querySelector('.chapter-media');
  const copy  = chapter.querySelector('.chapter-copy');
  const title = chapter.querySelector('.chapter-title');
  const titleEls = splitAndAnimate(title, 'chars');

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: chapter,
      start: 'top 75%',
      end: 'top 30%',
      toggleActions: 'play none none reverse',
    }
  });

  tl.to(chapter, { opacity: 1, duration: 0.1 })
    .from(media, {
      x: dir === 'left' ? -60 : 60,
      opacity: 0, duration: 1.2, ease: 'power3.out'
    }, 0)
    .from(copy.querySelector('.chapter-num'),  { opacity: 0, y: 20, duration: 0.6 }, 0.3)
    .to(title, { opacity: 1, duration: 0.01 }, 0.5)
    .from(titleEls.length ? titleEls : title, {
      opacity: 0, y: 30, stagger: 0.04, duration: 0.8, ease: 'power3.out'
    }, 0.5)
    .from(copy.querySelector('.chapter-date'), { opacity: 0, y: 20, duration: 0.6 }, 0.8)
    .from(copy.querySelector('.chapter-body'), { opacity: 0, y: 20, duration: 0.8 }, 1.0);
});

/* ── MESSAGE SECTION REVEAL ── */
(function messageReveal() {
  const section = document.getElementById('message');
  const heart   = section.querySelector('.heart');
  const titleEl = section.querySelector('.message-title');
  const titleEls = splitAndAnimate(titleEl, 'chars');

  const tl = gsap.timeline({
    scrollTrigger: { trigger: section, start: 'top 60%' }
  });

  tl.to(heart, { opacity: 1, duration: 0.8, ease: 'power2.out' })
    .to(heart, {
      keyframes: [
        { scale: 1.15, duration: 0.3 },
        { scale: 1,    duration: 0.3 },
        { scale: 1.08, duration: 0.25 },
        { scale: 1,    duration: 0.25 },
      ]
    }, 0.8)
    .to(titleEl, { opacity: 1, duration: 0.01 }, 1.2)
    .from(titleEls.length ? titleEls : titleEl, {
      opacity: 0, y: 40, stagger: 0.05, duration: 0.9, ease: 'power3.out'
    }, 1.2)
    .to('.message-body',  { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }, 2.0)
    .to('.message-sign',  { opacity: 1, y: 0, duration: 0.8 }, 2.6);

  // continuous heart pulse
  gsap.to(heart, {
    scale: 1.06, duration: 1.1, ease: 'sine.inOut',
    repeat: -1, yoyo: true, delay: 3
  });
})();

/* ── AUDIO TOGGLE ── */
const audio = document.getElementById('bg-music');
const audioBtn = document.getElementById('audio-btn');
let playing = false;

audioBtn.addEventListener('click', () => {
  if (!audio.src && !audio.querySelector('source')) return; // no src yet
  if (playing) {
    audio.pause();
    audioBtn.style.color = 'var(--muted)';
  } else {
    audio.play().catch(() => {});
    audioBtn.style.color = 'var(--gold)';
  }
  playing = !playing;
});
