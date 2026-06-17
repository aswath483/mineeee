// ── STARS ──
(function createStars() {
  const container = document.getElementById('stars');
  for (let i = 0; i < 160; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    s.style.cssText = `
      left: ${Math.random() * 100}%;
      top:  ${Math.random() * 100}%;
      --dur: ${2 + Math.random() * 4}s;
      --op:  ${0.2 + Math.random() * 0.8};
      width:  ${Math.random() < 0.8 ? 1 : 3}px;
      height: ${Math.random() < 0.8 ? 1 : 3}px;
      animation-delay: ${Math.random() * 5}s;
    `;
    container.appendChild(s);
  }
})();

// ── SCROLL REVEAL ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.2 });

document.querySelectorAll('.chapter, .message-content')
  .forEach(el => observer.observe(el));

// ── PARTICLES ──
(function createParticles() {
  const container = document.getElementById('particles');
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      --dur: ${5 + Math.random() * 8}s;
      animation-delay: ${Math.random() * 10}s;
      background: ${Math.random() > 0.5 ? '#d4637a' : '#c9a96e'};
    `;
    container.appendChild(p);
  }
})();

// ── AUDIO TOGGLE ──
const audio = document.getElementById('bg-music');
const audioBtn = document.getElementById('audio-control');
const audioIcon = document.getElementById('audio-icon');
let playing = false;

audioBtn.addEventListener('click', () => {
  if (!audio.src) return; // no song added yet
  if (playing) {
    audio.pause();
    audioIcon.textContent = '♪';
  } else {
    audio.play().catch(() => {});
    audioIcon.textContent = '■';
  }
  playing = !playing;
});

// Auto-play on first user interaction with the page
document.addEventListener('click', function tryAutoplay() {
  if (!playing && audio.src) {
    audio.play().catch(() => {});
    playing = true;
    audioIcon.textContent = '■';
  }
  document.removeEventListener('click', tryAutoplay);
}, { once: true });
