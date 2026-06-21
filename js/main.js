// ── INTRO: CANDLES → SHOOTING STAR → LANTERNS → NAME REVEAL ──
(function initIntro() {
  const overlay = document.getElementById('intro-overlay');
  let current   = 'candle-phase';

  // ── Phase transition (scale + fade) ──
  function goTo(nextId, delay) {
    setTimeout(() => {
      const from = document.getElementById(current);
      const to   = document.getElementById(nextId);
      from.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      from.style.opacity    = '0';
      from.style.transform  = 'scale(0.94)';
      setTimeout(() => {
        from.style.display = 'none';
        current = nextId;
        to.style.display   = 'flex';
        to.style.opacity   = '0';
        to.style.transform = 'scale(1.04)';
        requestAnimationFrame(() => {
          to.style.transition = 'opacity 0.65s ease, transform 0.65s ease';
          to.style.opacity    = '1';
          to.style.transform  = 'scale(1)';
        });
      }, 520);
    }, delay);
  }

  // ── Populate starfield ──
  function seedStars(id) {
    const el = document.getElementById(id);
    if (!el || el.childElementCount) return;
    for (let i = 0; i < 150; i++) {
      const s  = document.createElement('div');
      s.className = 'phase-star';
      const sz = Math.random() < 0.8 ? 1 : 2;
      s.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;
        width:${sz}px;height:${sz}px;
        --dur:${2+Math.random()*4}s;--op:${0.1+Math.random()*0.55};
        animation-delay:${Math.random()*5}s;`;
      el.appendChild(s);
    }
  }

  // ── Gold spark burst ──
  function sparks(x, y, n, colors) {
    for (let i = 0; i < n; i++) {
      const el  = document.createElement('div');
      el.className = 'spark';
      const ang = (Math.PI*2*i/n) + (Math.random()-0.5)*0.6;
      const d   = 28 + Math.random()*60;
      el.style.cssText = `left:${x}px;top:${y}px;
        --tx:${Math.cos(ang)*d}px;--ty:${Math.sin(ang)*d}px;
        --sz:${2+Math.random()*3.5}px;
        --c:${colors[i%colors.length]};
        animation-delay:${Math.random()*0.1}s;`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 950);
    }
  }

  // ═══════════════════════════════════════
  // PHASE 1 — CANDLES
  // ═══════════════════════════════════════
  let blown = 0;

  function spawnBreath(candle) {
    const r = candle.getBoundingClientRect();
    const tx = r.left + r.width / 2;
    const ty = r.top + r.height * 0.15;
    // 4 breath puffs staggered, rising toward the flame
    for (let i = 0; i < 4; i++) {
      const puff = document.createElement('div');
      puff.className = 'breath-puff';
      const ox = (Math.random() - 0.5) * 24;
      puff.style.cssText = `
        left:${tx + ox}px; top:${r.bottom - 20}px;
        --tx:${ox * 0.3}px; --ty:${ty - r.bottom + 20}px;
        animation-delay:${i * 0.06}s;
      `;
      document.body.appendChild(puff);
      setTimeout(() => puff.remove(), 650);
    }
  }

  function spawnEmber(candle) {
    const ember = document.createElement('div');
    ember.className = 'candle-ember';
    candle.querySelector('.flame-wrap').appendChild(ember);
    setTimeout(() => ember.remove(), 3800);
  }

  function spawnSmoke(candle, count) {
    const wrap  = candle.querySelector('.flame-wrap');
    const trail = document.createElement('div');
    trail.className = 'smoke-trail';
    trail.style.display = 'block';
    for (let i = 0; i < count; i++) {
      const d  = document.createElement('div');
      d.className = 'smoke-dot';
      const sz  = 6 + Math.random() * 12;
      const sx  = (Math.random() - 0.5) * 22;
      const sx2 = (Math.random() - 0.5) * 30;
      d.style.cssText = `
        width:${sz}px;height:${sz}px;
        left:${(Math.random()-0.5)*14}px;bottom:${i*8}px;
        --sd:${1.1+Math.random()*0.9}s;
        --sx:${sx}px;--sx2:${sx2}px;
        animation-delay:${i*0.05}s;
      `;
      trail.appendChild(d);
    }
    wrap.appendChild(trail);
  }

  document.querySelectorAll('.candle').forEach(c => {
    c.addEventListener('click', () => {
      if (c.dataset.blown) return;
      c.dataset.blown = '1';

      // 1 — Immediate: whoosh + breath puffs + pre-blow flicker
      playBlowWhoosh();
      spawnBreath(c);
      const flame = c.querySelector('.flame');
      flame.classList.add('pre-blow');

      // 2 — After pre-blow: extinguish
      setTimeout(() => {
        flame.classList.remove('pre-blow');
        c.classList.add('blown');
        document.getElementById('flames-left').textContent = 2 - blown;
        blown++;
        const isLast = blown === 3;

        // Layered sounds
        playBlow(isLast);

        // Visuals
        blowEffects(c, isLast);
        spawnEmber(c);
        spawnSmoke(c, isLast ? 14 : 9);

        // Sparks — more, richer colors
        const r = c.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + 4;
        sparks(cx, cy, isLast ? 28 : 18,
          ['#ffcc44','#ff9922','#ffee88','#ffffff','#ff6600']);

        if (isLast) {
          // Extra burst from cake centre on final blow
          const cake = document.querySelector('.cake-wrapper').getBoundingClientRect();
          setTimeout(() => {
            sparks(cake.left + cake.width/2, cake.top + 20, 22,
              ['#d4637a','#ff8fa8','#c9a96e','#ffffff','#ffcc44']);
          }, 250);
        }

        if (blown === 3) {
          setTimeout(() => { seedStars('sp-stars'); goTo('star-phase', 0); }, 1100);
          setTimeout(initStarPhase, 1100 + 700);
        }
      }, 200);
    });
  });

  // ═══════════════════════════════════════
  // PHASE 2 — SHOOTING STAR
  // ═══════════════════════════════════════
  let starActive = false, starStart = 0, starDur = 5000, starTimer;
  let wishMade   = false;

  function initStarPhase() {
    wishMade   = false;
    starActive = false;
    const spText = document.getElementById('sp-text');
    const spSub  = document.getElementById('sp-sub');
    const msg    = 'make a wish...';
    let i = 0;
    const ti = setInterval(() => {
      spText.textContent = msg.slice(0, ++i);
      if (i === msg.length) {
        clearInterval(ti);
        setTimeout(() => {
          spSub.classList.add('show');
          spSub.textContent = 'tap once you\'ve made your wish ✦';
        }, 600);
      }
    }, 85);
  }

  function launchStar() {
    const el = document.getElementById('shooting-star-el');
    el.style.top = (8 + Math.random()*22) + '%';
    starDur = 4600 + Math.random()*1000;
    el.style.setProperty('--star-dur', starDur + 'ms');
    el.classList.remove('shoot');
    void el.offsetWidth;
    el.classList.add('shoot');
    starActive = true;
    starStart  = Date.now();
    clearTimeout(starTimer);
    starTimer = setTimeout(() => {
      if (!starActive) return;
      starActive = false;
      const spSub = document.getElementById('sp-sub');
      spSub.textContent = 'it escaped... try again ✦';
      setTimeout(() => {
        spSub.textContent = 'catch the star ✦';
        launchStar();
      }, 1100);
    }, starDur + 350);
  }

  document.getElementById('sp-screen').addEventListener('click', e => {
    const spSub = document.getElementById('sp-sub');

    // Step 1 — wish confirmation tap
    if (!wishMade) {
      if (!spSub.classList.contains('show')) return; // typewriter still running
      wishMade = true;
      spSub.textContent = 'now catch the star ✦';
      setTimeout(launchStar, 900);
      return;
    }

    // Step 2 — catch the star
    if (!starActive) return;
    const prog = (Date.now() - starStart) / starDur;
    if (prog >= 0.07 && prog <= 0.93) {
      starActive = false;
      clearTimeout(starTimer);
      document.getElementById('shooting-star-el').classList.remove('shoot');
      playCatch();
      sparks(e.clientX, e.clientY, 22, ['#ffffff','#ffe8a0','#c0d8ff','#ffd4ea']);
      spawnWishBurst(e.clientX, e.clientY);
      spSub.classList.remove('show');
      setTimeout(() => document.getElementById('sp-caught').classList.add('show'), 280);
      setTimeout(() => { seedStars('hp-stars'); goTo('heart-phase', 0); }, 1750);
      setTimeout(initHeartPhase, 1750 + 680);
    } else {
      spSub.textContent = 'just missed — try again ✦';
      setTimeout(() => { spSub.textContent = 'catch the star ✦'; }, 900);
    }
  });

  function spawnWishBurst(x, y) {
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.className = 'wish-particle';
      const ang = (Math.PI*2*i/30) + Math.random()*0.25;
      const d   = 35 + Math.random()*95;
      p.style.cssText = `left:${x}px;top:${y}px;
        --tx:${Math.cos(ang)*d}px;--ty:${Math.sin(ang)*d}px;
        --sz:${1.5+Math.random()*4}px;
        animation-delay:${Math.random()*0.14}s;`;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 1300);
    }
  }

  // ═══════════════════════════════════════
  // PHASE 3 — CONSTELLATION HEART
  // ═══════════════════════════════════════

  // 10 clickable dots that form a recognisable heart + 1 phantom close point
  const HEART_ORDER = [
    {x:0.50, y:0.90}, // 1  bottom tip
    {x:0.82, y:0.64}, // 2  lower right
    {x:0.96, y:0.40}, // 3  right outer
    {x:0.88, y:0.16}, // 4  right upper
    {x:0.65, y:0.03}, // 5  right lobe peak
    {x:0.50, y:0.26}, // 6  centre dip  ← the V
    {x:0.35, y:0.03}, // 7  left lobe peak
    {x:0.12, y:0.16}, // 8  left upper
    {x:0.04, y:0.40}, // 9  left outer
    {x:0.18, y:0.64}, // 10 lower left
    {x:0.50, y:0.90}, // close — same as 1, not rendered
  ];

  let heartNext  = 0;
  let heartLines = [];

  // Safe-area margins so no dot hides under browser chrome
  const H_PAD = { top: 0.18, bot: 0.12, left: 0.08, right: 0.08 };

  function heartPx(pt) {
    const W = window.innerWidth, H = window.innerHeight;
    return {
      px: (H_PAD.left + pt.x * (1 - H_PAD.left - H_PAD.right)) * W,
      py: (H_PAD.top  + pt.y * (1 - H_PAD.top  - H_PAD.bot))  * H,
    };
  }

  function initHeartPhase() {
    heartNext  = 0;
    heartLines = [];
    const svg  = document.getElementById('heart-svg');
    const dots = document.getElementById('heart-dots');
    svg.innerHTML  = '';
    dots.innerHTML = '';

    const W = window.innerWidth, H = window.innerHeight;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

    HEART_ORDER.forEach((pt, i) => {
      if (i === 10) return; // skip phantom close point
      const { px, py } = heartPx(pt);
      const d = document.createElement('div');
      d.className   = 'h-dot' + (i === 0 ? ' next' : '');
      d.dataset.idx = i;
      d.style.left  = px + 'px';
      d.style.top   = py + 'px';
      d.innerHTML   = `<span class="h-num">${i + 1}</span>`;
      d.addEventListener('click', onDotClick);
      dots.appendChild(d);
    });

    document.getElementById('hp-hint').textContent = 'connect the stars in order';
    document.getElementById('next-star').textContent = '1';
  }

  function onDotClick(e) {
    const idx = Number(this.dataset.idx);
    if (idx !== heartNext) {
      this.classList.add('wrong');
      setTimeout(() => this.classList.remove('wrong'), 380);
      return;
    }

    this.classList.remove('next');
    this.classList.add('connected');
    playHeartNote(heartNext);

    const from = heartPx(HEART_ORDER[heartNext]);
    const toHp = HEART_ORDER[heartNext + 1];
    if (toHp) { const to = heartPx(toHp); drawHeartLine(from.px, from.py, to.px, to.py); }

    heartNext++;
    document.getElementById('next-star').textContent = heartNext + 1;

    // Mark next dot as pulsing
    const nextDot = document.querySelector(`.h-dot[data-idx="${heartNext}"]`);
    if (nextDot) nextDot.classList.add('next');

    if (heartNext >= 10) heartComplete();
  }

  function drawHeartLine(x1, y1, x2, y2) {
    const svg  = document.getElementById('heart-svg');
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1); line.setAttribute('y1', y1);
    line.setAttribute('x2', x2); line.setAttribute('y2', y2);
    line.setAttribute('stroke', '#d4637a');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('stroke-linecap', 'round');
    line.setAttribute('opacity', '0.88');
    const len = Math.hypot(x2 - x1, y2 - y1);
    line.setAttribute('stroke-dasharray', len);
    line.setAttribute('stroke-dashoffset', len);
    svg.appendChild(line);
    heartLines.push(line);
    // rAF draw animation
    let t0 = null;
    const dur = 420;
    function step(now) {
      if (!t0) t0 = now;
      const p = Math.min((now - t0) / dur, 1);
      const e = p < 0.5 ? 2*p*p : -1 + (4 - 2*p)*p;
      line.setAttribute('stroke-dashoffset', len * (1 - e));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function heartComplete() {
    // Hide the tap counter
    document.getElementById('hp-counter').classList.add('hidden');

    // Glow all drawn lines
    heartLines.forEach(l => {
      l.setAttribute('stroke', '#e8758a');
      l.setAttribute('stroke-width', '2.2');
      l.style.transition = 'all 0.7s ease';
    });

    // Gentle spark at heart center
    const ctr = heartPx({x: 0.50, y: 0.52});
    sparks(ctr.px, ctr.py, 22, ['#d4637a','#ff8fa8','#c9a96e','#ffffff','#ffd4ea']);

    playBloom();

    // 3 heartbeats — lub-dub pattern, staggered 1.5s apart
    const beats = [300, 550, 1800, 2050, 3300, 3550];
    beats.forEach((delay, j) => {
      setTimeout(() => {
        const r  = document.createElement('div');
        r.className = 'hb-ripple';
        const sz = j % 2 === 0 ? '64px' : '42px'; // lub bigger, dub smaller
        r.style.cssText = `left:${ctr.px}px;top:${ctr.py}px;width:${sz};height:${sz};`;
        document.body.appendChild(r);
        setTimeout(() => r.remove(), 2600);
      }, delay);
    });

    // Hint becomes a pulsing ♥
    const hint = document.getElementById('hp-hint');
    setTimeout(() => {
      hint.textContent = '♥';
      hint.style.fontSize    = '2.2rem';
      hint.style.letterSpacing = '0';
      hint.style.color       = '#d4637a';
      hint.style.opacity     = '1';
    }, 500);

    // Message fades in after the last heartbeat settles
    setTimeout(() => {
      document.getElementById('heart-msg').classList.add('show');
    }, 4200);

    // Transition to piano phase after message has time to read
    setTimeout(() => { seedStars('pp2-stars'); goTo('piano-phase', 0); }, 7800);
    setTimeout(initPianoPhase, 7800 + 720);
  }

  // ═══════════════════════════════════════
  // PHASE 4 — PIANO
  // ═══════════════════════════════════════
  const PIANO_KEYS = [
    { note: 'C',  freq: 261.63, dark: false },
    { note: 'D',  freq: 293.66, dark: false },
    { note: 'E',  freq: 329.63, dark: false },
    { note: 'F',  freq: 349.23, dark: false },
    { note: 'G',  freq: 392.00, dark: false },
    { note: 'A',  freq: 440.00, dark: false },
    { note: 'Bb', freq: 466.16, dark: true  },
    { note: 'C⁵', freq: 523.25, dark: false },
  ];

  // Happy Birthday to You — full song (key index, lyric word)
  const HB_SONG = [
    [0,'Hap-'],[0,'py'],[1,'Birth-'],[0,'day'],[3,'to'],[2,'you'],
    [0,'Hap-'],[0,'py'],[1,'Birth-'],[0,'day'],[4,'to'],[3,'you'],
    [0,'Hap-'],[0,'py'],[7,'Birth-'],[5,'day'],[3,'dear'],[2,'Su-'],[1,'re-kaa'],
    [6,'Hap-'],[6,'py'],[5,'Birth-'],[3,'day'],[4,'to'],[3,'you'],
  ];

  let pianoStep = 0;

  function initPianoPhase() {
    pianoStep = 0;
    const keysEl = document.getElementById('piano-keys');
    keysEl.innerHTML = '';
    PIANO_KEYS.forEach((k, i) => {
      const btn = document.createElement('div');
      btn.className = 'pkey' + (k.dark ? ' dark' : '');
      btn.dataset.idx = i;

      const badge = document.createElement('span');
      badge.className = 'pkey-badge';
      btn.appendChild(badge);

      const label = document.createElement('span');
      label.className = 'pkey-label';
      label.textContent = k.note;
      btn.appendChild(label);

      btn.addEventListener('click', onPianoKey);
      keysEl.appendChild(btn);
    });

    document.getElementById('piano-lyric').innerHTML = '&nbsp;';
    document.getElementById('piano-progress').innerHTML = '&nbsp;';

    // Typewriter intro
    const introEl = document.getElementById('piano-intro');
    introEl.textContent = '';
    const msg = "now it's your turn, Surekaa — play Happy Birthday ♪";
    let ci = 0;
    const ti = setInterval(() => {
      introEl.textContent = msg.slice(0, ++ci);
      if (ci === msg.length) { clearInterval(ti); setTimeout(highlightKey, 700); }
    }, 38);
  }

  // How many consecutive times does the current key repeat from `step`?
  function countConsecutive(step) {
    if (step >= HB_SONG.length) return 0;
    const ki = HB_SONG[step][0];
    let n = 0;
    while (step < HB_SONG.length && HB_SONG[step][0] === ki) { n++; step++; }
    return n;
  }

  function updateSubHint(step) {
    const n = countConsecutive(step);
    const sub = document.querySelector('.piano-sub');
    if (n > 1) sub.textContent = 'tap ' + n + '× ♪';
    else        sub.textContent = 'follow the glow ♪';
  }

  function setBadge(keyEl, step) {
    const n = countConsecutive(step);
    keyEl.querySelector('.pkey-badge').textContent = n > 1 ? '×' + n : '';
  }

  function highlightKey() {
    if (pianoStep >= HB_SONG.length) return;
    const ki = HB_SONG[pianoStep][0];
    document.querySelectorAll('.pkey').forEach(k => {
      k.classList.remove('next');
      k.querySelector('.pkey-badge').textContent = '';
    });
    const target = document.querySelector(`.pkey[data-idx="${ki}"]`);
    void target.offsetWidth;
    target.classList.add('next');
    setBadge(target, pianoStep);
    updateSubHint(pianoStep);
  }

  function onPianoKey() {
    const idx  = Number(this.dataset.idx);
    const self = this;
    playPianoNote(PIANO_KEYS[idx].freq);

    self.classList.remove('next');
    self.classList.add('hit');

    if (idx === HB_SONG[pianoStep][0]) {
      document.getElementById('piano-lyric').textContent = HB_SONG[pianoStep][1];
      pianoStep++;
      document.getElementById('piano-progress').textContent =
        '♪ ' + pianoStep + ' / ' + HB_SONG.length;

      if (pianoStep >= HB_SONG.length) {
        setTimeout(() => { self.classList.remove('hit'); pianoComplete(); }, 420);
      } else if (HB_SONG[pianoStep][0] === idx) {
        // Same key needed again — flash then re-glow with updated count badge
        setTimeout(() => {
          self.classList.remove('hit');
          void self.offsetWidth;
          self.classList.add('next');
          setBadge(self, pianoStep);
          updateSubHint(pianoStep);
        }, 220);
      } else {
        // Different key — remove flash then highlight new key
        setTimeout(() => { self.classList.remove('hit'); highlightKey(); }, 220);
      }
    } else {
      // Wrong key — just remove flash, keep correct key glowing
      setTimeout(() => self.classList.remove('hit'), 150);
    }
  }

  function pianoComplete() {
    document.querySelectorAll('.pkey').forEach(k => {
      k.classList.remove('next');
      k.querySelector('.pkey-badge').textContent = '';
    });
    document.getElementById('piano-intro').textContent = 'beautiful, Surekaa ♥';
    document.getElementById('piano-lyric').innerHTML   = '&nbsp;';
    document.getElementById('piano-progress').innerHTML = '&nbsp;';
    document.querySelector('.piano-sub').textContent   = '';
    playBloom();
    sparks(window.innerWidth/2, window.innerHeight * 0.55, 30,
      ['#d4637a','#ff8fa8','#c9a96e','#ffffff','#ffd4ea']);
    setTimeout(() => document.getElementById('piano-actions').classList.add('show'), 1100);
  }

  document.getElementById('piano-replay').addEventListener('click', () => {
    document.getElementById('piano-actions').classList.remove('show');
    initPianoPhase();
  });

  document.getElementById('piano-forward').addEventListener('click', () => {
    document.getElementById('piano-actions').classList.remove('show');
    seedStars('np-stars');
    goTo('name-phase', 0);
    setTimeout(initNameReveal, 720);
  });

  // ═══════════════════════════════════════
  // PHASE 5 — NAME REVEAL
  // ═══════════════════════════════════════
  function initNameReveal() {
    document.querySelectorAll('.nl').forEach((letter, i) => {
      setTimeout(() => {
        letter.classList.add('lit');
        playLetterChime(i);
        if (i === 6) {
          setTimeout(() => document.getElementById('np-tagline').classList.add('show'), 620);
          setTimeout(() => document.getElementById('np-enter').classList.add('show'), 1230);
        }
      }, i * 240);
    });
  }

  document.getElementById('np-enter').addEventListener('click', () => {
    overlay.classList.add('hide');
    setTimeout(() => overlay.remove(), 1100);
    // Start music on first scroll, not on click — feels natural as she scrolls in
    window.addEventListener('scroll', function onFirstScroll() {
      window.removeEventListener('scroll', onFirstScroll);
      startYT();
    }, { once: true });
  });

  document.getElementById('dev-skip').addEventListener('click', () => {
    seedStars('np-stars');
    goTo('name-phase', 0);
    setTimeout(initNameReveal, 720);
  });
})();

// ── AUDIO ENGINE ──
let _ac = null;
function ac() {
  if (!_ac) _ac = new (window.AudioContext || window.webkitAudioContext)();
  if (_ac.state === 'suspended') _ac.resume();
  return _ac;
}

// ── CANDLE: WHOOSH (plays on click, before flame goes out) ──
function playBlowWhoosh() {
  const ctx = ac(), now = ctx.currentTime;
  const dur = 0.38;
  const len = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d   = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  // Bandpass sweeping 900→130 Hz — air rushing toward flame
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.setValueAtTime(900, now);
  bp.frequency.exponentialRampToValueAtTime(130, now + dur);
  bp.Q.value = 0.7;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.5, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + dur);
  src.connect(bp); bp.connect(g); g.connect(ctx.destination);
  src.start(now); src.stop(now + dur + 0.05);
}

// ── CANDLE: EXTINGUISH (plays when flame dies) ──
function playBlow(isLast) {
  const ctx = ac(), now = ctx.currentTime;

  // Pink noise puff — soft breath body
  const pDur = isLast ? 0.45 : 0.26;
  const pLen = Math.floor(ctx.sampleRate * pDur);
  const pBuf = ctx.createBuffer(1, pLen, ctx.sampleRate);
  const pd   = pBuf.getChannelData(0);
  let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
  for (let i = 0; i < pLen; i++) {
    const w = Math.random()*2-1;
    b0=0.99886*b0+w*0.0555179; b1=0.99332*b1+w*0.0750759;
    b2=0.96900*b2+w*0.1538520; b3=0.86650*b3+w*0.3104856;
    b4=0.55000*b4+w*0.5329522; b5=-0.7616*b5-w*0.0168980;
    pd[i] = (b0+b1+b2+b3+b4+b5+b6+w*0.5362) * 0.11;
    b6 = w * 0.115926;
  }
  const pSrc = ctx.createBufferSource();
  pSrc.buffer = pBuf;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.value = 340; lp.Q.value = 0.35;
  const pG = ctx.createGain();
  pG.gain.setValueAtTime(isLast ? 0.6 : 0.42, now);
  pG.gain.exponentialRampToValueAtTime(0.001, now + pDur);
  pSrc.connect(lp); lp.connect(pG); pG.connect(ctx.destination);
  pSrc.start(now); pSrc.stop(now + pDur + 0.05);

  // High-freq sizzle — flame extinguishing
  const sLen = Math.floor(ctx.sampleRate * 0.14);
  const sBuf = ctx.createBuffer(1, sLen, ctx.sampleRate);
  const sd   = sBuf.getChannelData(0);
  for (let i = 0; i < sLen; i++) sd[i] = Math.random() * 2 - 1;
  const sSrc = ctx.createBufferSource();
  sSrc.buffer = sBuf;
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass'; hp.frequency.value = 4000;
  const sG = ctx.createGain();
  sG.gain.setValueAtTime(0.16, now + 0.02);
  sG.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
  sSrc.connect(hp); hp.connect(sG); sG.connect(ctx.destination);
  sSrc.start(now); sSrc.stop(now + 0.22);

  // Wax crackle — 3 random pops
  for (let p = 0; p < 3; p++) {
    const t  = now + 0.04 + Math.random() * 0.22;
    const cLen = Math.floor(ctx.sampleRate * 0.025);
    const cBuf = ctx.createBuffer(1, cLen, ctx.sampleRate);
    const cd   = cBuf.getChannelData(0);
    for (let i = 0; i < cLen; i++) cd[i] = (Math.random()*2-1) * Math.pow(1-i/cLen,2);
    const cSrc = ctx.createBufferSource();
    cSrc.buffer = cBuf;
    const cG = ctx.createGain();
    cG.gain.setValueAtTime(0.12 + Math.random()*0.1, t);
    cSrc.connect(cG); cG.connect(ctx.destination);
    cSrc.start(t); cSrc.stop(t + 0.03);
  }

  // Bass thump on final blow
  if (isLast) {
    const o = ctx.createOscillator(), og = ctx.createGain();
    o.type = 'sine'; o.frequency.value = 62;
    og.gain.setValueAtTime(0.28, now);
    og.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    o.connect(og); og.connect(ctx.destination);
    o.start(now); o.stop(now + 0.6);
    // Magic shimmer after a beat
    setTimeout(playMagicShimmer, 380);
  }
}

// ── MAGIC SHIMMER (after last candle) ──
function playMagicShimmer() {
  const ctx = ac(), now = ctx.currentTime;
  [523, 659, 784, 1047, 1319, 1568, 2093, 2637].forEach((f, i) => {
    const t = now + i * 0.055;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.13, t + 0.018);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.75);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + 0.8);
  });
}

// ── CATCH SOUND ──
function playCatch() {
  const ctx = ac(), now = ctx.currentTime;
  [784, 1047, 1319, 1568, 2093].forEach((f, i) => {
    const t = now + i * 0.07;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.24, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + 0.55);
  });
}

// ── HEART NOTE (ascending scale per star connected) ──
const HEART_NOTES = [261, 294, 330, 392, 440, 494, 523, 587, 659, 784];
function playHeartNote(idx) {
  const ctx = ac(), now = ctx.currentTime;
  const f   = HEART_NOTES[idx % HEART_NOTES.length];
  [f, f*2].forEach((freq, i) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = i === 0 ? 'triangle' : 'sine';
    o.frequency.value = freq;
    const vol = i === 0 ? 0.26 : 0.10;
    const dec = i === 0 ? 0.90 : 0.55;
    g.gain.setValueAtTime(vol, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + dec);
    o.connect(g); g.connect(ctx.destination);
    o.start(now); o.stop(now + dec + 0.05);
  });
}

// ── BLOOM (heart complete / name reveal) ──
function playBloom() {
  const ctx = ac(), now = ctx.currentTime;
  [261, 330, 392, 523, 659].forEach((f, i) => {
    const t = now + i * 0.09;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.2, t + 0.07);
    g.gain.setValueAtTime(0.2, t + 0.55);
    g.gain.exponentialRampToValueAtTime(0.001, t + 2.0);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + 2.1);
  });
}

// ── LETTER CHIME (name reveal) ──
const RAGA = [261, 294, 330, 392, 440, 523, 587];
function playLetterChime(idx) {
  const ctx = ac(), now = ctx.currentTime;
  const f   = RAGA[idx] * 2;
  const o   = ctx.createOscillator(), g = ctx.createGain();
  o.type = 'sine'; o.frequency.value = f;
  g.gain.setValueAtTime(0.15, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
  o.connect(g); g.connect(ctx.destination);
  o.start(now); o.stop(now + 0.7);
}

// ── PIANO NOTE (synthesized piano tone) ──
function playPianoNote(freq) {
  const ctx = ac(), now = ctx.currentTime;
  // Fundamental + 3 harmonics = piano-like timbre
  [[1, 0.48, 0.9], [2, 0.18, 0.55], [3, 0.08, 0.32], [4.2, 0.04, 0.18]].forEach(([m, v, d]) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = freq * m;
    g.gain.setValueAtTime(v, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + d);
    o.connect(g); g.connect(ctx.destination);
    o.start(now); o.stop(now + d + 0.05);
  });
}

// ── VISUAL BLOW EFFECTS ──
function blowEffects(candle, isLast) {
  const fw = candle.querySelector('.flame-wrap').getBoundingClientRect();
  const x  = fw.left + fw.width / 2;
  const y  = fw.top  + fw.height / 2;

  // Ripple ring(s) expanding from flame
  const rings = isLast ? 3 : 1;
  for (let i = 0; i < rings; i++) {
    setTimeout(() => {
      const r = document.createElement('div');
      r.className = 'blow-ripple';
      r.style.cssText = `left:${x}px;top:${y}px;animation-delay:0s;`;
      document.body.appendChild(r);
      setTimeout(() => r.remove(), 820);
    }, i * 130);
  }

  // Golden flash at flame tip
  const fl = document.createElement('div');
  fl.className = 'blow-flash';
  fl.style.cssText = `left:${x}px;top:${y}px;`;
  document.body.appendChild(fl);
  setTimeout(() => fl.remove(), 450);

  // Subtle screen pulse on last candle
  if (isLast) {
    const ov = document.getElementById('intro-overlay');
    ov.classList.add('screen-pulse');
    setTimeout(() => ov.classList.remove('screen-pulse'), 500);
  }
}

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

document.querySelectorAll('.message-content')
  .forEach(el => observer.observe(el));

// ── CINEMATIC SLIDESHOW ──
(function initGallery() {
  const slides   = Array.from(document.querySelectorAll('.gs-slide'));
  const flash    = document.getElementById('gs-flash');
  const leak     = document.getElementById('gs-light-leak');
  const curtain  = document.getElementById('gs-curtain');
  const lbT      = document.getElementById('gs-lb-t');
  const lbB      = document.getElementById('gs-lb-b');
  const pfill    = document.getElementById('gs-pfill');
  const currEl   = document.getElementById('gs-curr');
  const grainEl  = document.getElementById('gs-grain');
  const total    = slides.length;
  let current    = 0;
  let busy       = false;
  let tIdx       = 0;
  const TYPES    = ['blast', 'curtain', 'flash', 'leak'];

  // Bake film grain texture once into a canvas data URL
  (function bakeGrain() {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const ctx = c.getContext('2d');
    const id  = ctx.createImageData(256, 256);
    for (let i = 0; i < id.data.length; i += 4) {
      const v = Math.random() * 255 | 0;
      id.data[i] = id.data[i+1] = id.data[i+2] = v;
      id.data[i+3] = 255;
    }
    ctx.putImageData(id, 0, 0);
    grainEl.style.backgroundImage = 'url(' + c.toDataURL() + ')';
  })();

  // Ken Burns direction per slide
  const KB = [
    { x: '-2%', y: '-1%' }, { x:  '2%', y: '-1%' },
    { x: '-1%', y:  '2%' }, { x:  '1%', y:  '1%' },
    { x: '-2%', y:  '1%' }, { x:  '2%', y:  '1%' },
    { x:  '0%', y: '-2%' }, { x:  '0%', y:  '2%' },
  ];

  // Pan directions for landscape — background-position shift only, no div scale
  const PAN = [
    { from: '48% 52%', to: '52% 48%' },
    { from: '52% 48%', to: '48% 52%' },
    { from: '50% 54%', to: '50% 46%' },
    { from: '46% 50%', to: '54% 50%' },
    { from: '54% 46%', to: '46% 54%' },
    { from: '50% 46%', to: '50% 54%' },
    { from: '48% 48%', to: '52% 52%' },
    { from: '52% 52%', to: '48% 48%' },
  ];

  function startKB(slide) {
    const photo = slide.querySelector('.gs-photo');
    const isPortrait = slide.classList.contains('gs-slide--portrait');
    const idx = parseInt(slide.dataset.idx) % PAN.length;
    gsap.killTweensOf(photo);
    if (isPortrait) {
      // Portrait has dark space around the image — subtle scale is safe
      gsap.fromTo(photo,
        { scale: 1.01, backgroundPosition: 'right center' },
        { scale: 1.06, backgroundPosition: 'right center', duration: 13, ease: 'none' }
      );
    } else {
      // Landscape fills the viewport — animate background-position only, never scale beyond 1
      gsap.set(photo, { scale: 1 });
      gsap.fromTo(photo,
        { backgroundPosition: PAN[idx].from },
        { backgroundPosition: PAN[idx].to, duration: 13, ease: 'none' }
      );
    }
  }

  function showCaption(slide) {
    const label = slide.querySelector('.gs-label');
    const lines = slide.querySelectorAll('.gs-line');
    const sub   = slide.querySelector('.gs-sub');
    gsap.timeline()
      .fromTo(label, { opacity:0, y:8 },      { opacity:1, y:0,     duration:0.7,  ease:'power3.out' }, 0.25)
      .fromTo(lines, { y:'105%', opacity:0 }, { y:'0%', opacity:1,  duration:1.05, stagger:0.18, ease:'power4.out' }, 0.4)
      .fromTo(sub,   { opacity:0 },           { opacity:1,           duration:0.8 }, 0.95);
  }

  function hideCaption(slide) {
    gsap.to(slide.querySelectorAll('.gs-label, .gs-line, .gs-sub'),
      { opacity:0, y:'-12px', duration:0.28, stagger:0.04, ease:'power2.in' });
  }

  function playWhoosh() {
    try {
      const ctx2 = new (window.AudioContext || window.webkitAudioContext)();
      const len  = Math.floor(ctx2.sampleRate * 0.45);
      const buf  = ctx2.createBuffer(1, len, ctx2.sampleRate);
      const d    = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random()*2-1) * Math.pow(1-i/len, 2.5) * 0.55;
      const src = ctx2.createBufferSource(); src.buffer = buf;
      const bp  = ctx2.createBiquadFilter(); bp.type = 'bandpass';
      bp.frequency.setValueAtTime(380, ctx2.currentTime);
      bp.frequency.exponentialRampToValueAtTime(75, ctx2.currentTime + 0.45);
      bp.Q.value = 0.6;
      const g = ctx2.createGain();
      g.gain.setValueAtTime(0.35, ctx2.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx2.currentTime + 0.45);
      src.connect(bp); bp.connect(g); g.connect(ctx2.destination);
      src.start(); src.stop(ctx2.currentTime + 0.5);
    } catch(e) {}
  }

  function updateUI(idx) {
    currEl.textContent = String(idx + 1).padStart(2, '0');
    gsap.to(pfill, { width: ((idx + 1) / total * 100) + '%', duration:0.9, ease:'power2.out' });
  }

  function resetSlide(slide) {
    gsap.set(slide, { opacity:0, scale:1, zIndex:1 });
    gsap.set(slide.querySelector('.gs-photo'), { scale:1, x:'0%', y:'0%', opacity:1, clearProps:'clipPath,backgroundPosition' });
    gsap.set(slide.querySelectorAll('.gs-label, .gs-line, .gs-sub'), { opacity:0, y:0 });
    slide.classList.remove('gs-active');
  }

  // TRANSITION 1: BLAST — photo explodes out, new one slams in
  function doBlast(from, to, done) {
    hideCaption(from);
    gsap.set([lbT, lbB], { height: 0 });
    const tl = gsap.timeline({ onComplete: done });
    tl.to([lbT, lbB], { height:'9vh', duration:0.22, ease:'power2.in' })
      .to(from.querySelector('.gs-photo'), { scale:1.45, opacity:0, duration:0.5, ease:'power3.in' }, '<')
      .to(from, { opacity:0, duration:0.35 }, '-=0.2')
      .call(function() {
        gsap.set(from, { zIndex:1, opacity:0 });
        gsap.set(to,   { zIndex:2, opacity:1 });
        to.classList.add('gs-active');
        gsap.set(to.querySelector('.gs-photo'), { scale:0.86, opacity:0 });
      })
      .to(to.querySelector('.gs-photo'), { scale:1, opacity:1, duration:0.75, ease:'power2.out' })
      .to([lbT, lbB], { height:0, duration:0.35, ease:'power2.out' }, '-=0.5')
      .call(function() { showCaption(to); startKB(to); });
  }

  // TRANSITION 2: CURTAIN — diagonal wipe sweeps across
  function doCurtain(from, to, done) {
    hideCaption(from);
    gsap.set(curtain, { clipPath:'polygon(0 0, 0 0, 0 100%, 0 100%)' });
    const tl = gsap.timeline({ onComplete: done });
    tl.to(curtain, { clipPath:'polygon(0 0, 105% 0, 115% 100%, 0 100%)', duration:0.65, ease:'power3.inOut' })
      .call(function() {
        gsap.set(from, { zIndex:1, opacity:0 });
        gsap.set(to,   { zIndex:2, opacity:1 });
        to.classList.add('gs-active');
        startKB(to);
      })
      .to(curtain, { clipPath:'polygon(105% 0, 105% 0, 115% 100%, 115% 100%)', duration:0.6, ease:'power3.inOut' })
      .call(function() {
        gsap.set(curtain, { clipPath:'polygon(0 0, 0 0, 0 100%, 0 100%)' });
        showCaption(to);
      });
  }

  // TRANSITION 3: FLASH — blinding white cut
  function doFlash(from, to, done) {
    hideCaption(from);
    const tl = gsap.timeline({ onComplete: done });
    tl.to(flash, { opacity:0.97, duration:0.07, ease:'none' })
      .call(function() {
        gsap.set(from, { zIndex:1, opacity:0 });
        gsap.set(to,   { zIndex:2, opacity:1 });
        to.classList.add('gs-active');
        startKB(to);
      })
      .to(flash, { opacity:0, duration:0.6, ease:'power2.out' })
      .call(function() { showCaption(to); }, null, '-=0.2');
  }

  // TRANSITION 4: LIGHT LEAK — warm orange sweep
  function doLeak(from, to, done) {
    hideCaption(from);
    gsap.set(leak, { x:'-110%', opacity:1 });
    const tl = gsap.timeline({ onComplete: done });
    tl.to(leak, { x:'110%', duration:0.8, ease:'power2.inOut' })
      .to(from, { opacity:0, duration:0.4 }, '-=0.55')
      .call(function() {
        gsap.set(from, { zIndex:1, opacity:0 });
        gsap.set(to,   { zIndex:2, opacity:1 });
        gsap.set(leak, { opacity:0 });
        to.classList.add('gs-active');
        startKB(to);
      })
      .call(function() { showCaption(to); }, null, '+=0.05');
  }

  function goTo(idx) {
    if (busy || idx === current) return;
    busy = true;
    playWhoosh();
    const from = slides[current];
    const to   = slides[idx];
    const type = TYPES[tIdx++ % TYPES.length];
    from.classList.remove('gs-active');
    gsap.set(to, { opacity:0, scale:1, zIndex:3 });
    updateUI(idx);
    current = idx;
    function onDone() { resetSlide(from); busy = false; }
    if      (type === 'blast')   doBlast(from, to, onDone);
    else if (type === 'curtain') doCurtain(from, to, onDone);
    else if (type === 'flash')   doFlash(from, to, onDone);
    else                         doLeak(from, to, onDone);
  }

  function revealMessage() {
    var msg = document.getElementById('message');
    msg.classList.add('revealed');
  }

  function next() {
    if (current === total - 1) { revealMessage(); return; }
    goTo(current + 1);
  }
  function prev() { goTo((current - 1 + total) % total); }

  document.getElementById('gs-next').addEventListener('click', next);
  document.getElementById('gs-prev').addEventListener('click', prev);
  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft')  prev();
  });

  var touchX = 0;
  document.getElementById('gallery').addEventListener('touchstart', function(e) {
    touchX = e.touches[0].clientX;
  }, { passive:true });
  document.getElementById('gallery').addEventListener('touchend', function(e) {
    var dx = touchX - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 44) dx > 0 ? next() : prev();
  }, { passive:true });

  // Pre-cache every slide's background image + detect portrait orientation
  slides.forEach(function(slide) {
    var photo = slide.querySelector('.gs-photo');
    if (!photo) return;
    var bg = window.getComputedStyle(photo).backgroundImage;
    var m  = bg.match(/url\(["']?([^"')]+)["']?\)/);
    if (!m) return;
    var img = new Image();
    img.onload = function() {
      if (img.naturalHeight > img.naturalWidth) {
        slide.classList.add('gs-slide--portrait');
      }
    };
    img.src = m[1];
  });

  // Init
  gsap.set(slides[0], { opacity:1, zIndex:2 });
  slides[0].classList.add('gs-active');
  slides.slice(1).forEach(function(s) { gsap.set(s, { opacity:0 }); });
  updateUI(0);
  startKB(slides[0]);
  setTimeout(function() { showCaption(slides[0]); }, 600);
})();

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

// ── YOUTUBE MUSIC ──
let ytPlayer = null;
let ytReady  = false;
let ytPending = false;

window.onYouTubeIframeAPIReady = function () {
  ytPlayer = new YT.Player('yt-player', {
    videoId: 'NRiF7j6BcnA',
    playerVars: { autoplay: 0, loop: 1, playlist: 'NRiF7j6BcnA', controls: 0, rel: 0, start: 27 },
    events: {
      onReady() {
        ytReady = true;
        ytPlayer.setVolume(0);
        if (ytPending) { fadeInYT(); ytPending = false; }
      },
    },
  });
};

function fadeInYT() {
  ytPlayer.seekTo(27, true);
  ytPlayer.setVolume(0);
  ytPlayer.playVideo();
  updateMusicIcon(true);
  let vol = 0;
  const fade = setInterval(() => {
    vol = Math.min(vol + 2, 35);
    ytPlayer.setVolume(vol);
    if (vol >= 35) clearInterval(fade);
  }, 80); // ~1.9 s fade-in
}

function startYT() {
  if (ytReady) fadeInYT();
  else ytPending = true;
}

function updateMusicIcon(on) {
  document.getElementById('audio-icon').textContent = on ? '■' : '♪';
}

const audioBtn  = document.getElementById('audio-control');
const audioIcon = document.getElementById('audio-icon');

audioBtn.addEventListener('click', () => {
  if (!ytReady) return;
  const state = ytPlayer.getPlayerState();
  if (state === YT.PlayerState.PLAYING) {
    ytPlayer.pauseVideo();
    updateMusicIcon(false);
  } else {
    ytPlayer.playVideo();
    updateMusicIcon(true);
  }
});
