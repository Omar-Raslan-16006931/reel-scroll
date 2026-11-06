// Scripts run inside the Instagram tab of the app's built-in browser.
// Built with DOM calls only (no innerHTML), so Instagram's CSP has nothing to refuse.

const FONT =
  "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI Variable Display', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"

// Palette: warm near-black ground, paper white, a muted warm grey, one orange.
const INK = '#0c0a09'
const PAPER = '#faf7f4'
const MUTED = '#a8a29e'
const LINE = 'rgba(250,247,244,0.12)'
const ORANGE = '#ff6a1a'

const helpers = `
  const W = window;
  const kill = () => {
    clearInterval(W.__rsPause); clearInterval(W.__rsTick); clearInterval(W.__rsPos);
    if (W.__rsPlay) document.removeEventListener('play', W.__rsPlay, true);
    if (W.__rsKeys) document.removeEventListener('keydown', W.__rsKeys, true);
    if (W.__rsWheel) document.removeEventListener('wheel', W.__rsWheel, {capture: true});
    document.getElementById('rs-lock')?.remove();
    document.getElementById('rs-pill')?.remove();
  };
  kill();
  const onLogin = location.pathname.startsWith('/accounts') || location.pathname.startsWith('/challenge');
  const el = (tag, css, text) => { const n = document.createElement(tag); n.style.cssText = css; if (text != null) n.textContent = text; return n; };
  const svgLock = (size, color) => {
    const NS = 'http://www.w3.org/2000/svg';
    const s = document.createElementNS(NS, 'svg');
    s.setAttribute('width', size); s.setAttribute('height', size * 52 / 44); s.setAttribute('viewBox', '0 0 44 52');
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', 'M11 22v-7.5a11 11 0 0 1 22 0V22');
    p.setAttribute('fill', 'none'); p.setAttribute('stroke', color); p.setAttribute('stroke-width', '4'); p.setAttribute('stroke-linecap', 'round');
    const r = document.createElementNS(NS, 'rect');
    r.setAttribute('x', '3'); r.setAttribute('y', '22'); r.setAttribute('width', '38'); r.setAttribute('height', '28'); r.setAttribute('rx', '6'); r.setAttribute('fill', color);
    s.append(p, r);
    return s;
  };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
`

export const lockScript = (isIdle: boolean) => `(() => {
  ${helpers}
  if (onLogin) return 'skipped: signing in';

  const seen = W.__rsSeen ? W.__rsSeen.size : 0;
  const secs = W.__rsStart ? Math.max(0, Math.round((Date.now() - W.__rsStart) / 1000)) : 0;
  const clock = Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0');
  const idle = ${isIdle} || !seen;

  const hush = v => { try { v.muted = true; v.pause(); } catch (e) {} };
  const pauseAll = () => document.querySelectorAll('video').forEach(hush);
  if (W.__rsWasMuted === undefined) {
    const playing = [...document.querySelectorAll('video')].find(v => !v.paused);
    W.__rsWasMuted = playing ? playing.muted : false;
  }
  pauseAll();
  W.__rsPlay = e => { if (e.target instanceof HTMLVideoElement) hush(e.target); };
  document.addEventListener('play', W.__rsPlay, true);
  W.__rsPause = setInterval(pauseAll, 250);
  W.__rsKeys = e => { e.stopPropagation(); e.preventDefault(); };
  W.__rsWheel = e => { e.stopPropagation(); e.preventDefault(); };
  document.addEventListener('keydown', W.__rsKeys, true);
  document.addEventListener('wheel', W.__rsWheel, {capture: true, passive: false});

  const o = el('div', "position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;background:${INK};color:${PAPER};font-family:${FONT};-webkit-font-smoothing:antialiased;padding:24px;box-sizing:border-box;");
  o.id = 'rs-lock';
  const col = el('div', 'width:min(420px,100%);display:flex;flex-direction:column;align-items:flex-start;');

  const head = el('div', 'display:flex;align-items:center;gap:16px;margin-bottom:44px;');
  head.append(svgLock(40, '${ORANGE}'), el('span', 'font-size:26px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:${PAPER};', idle ? 'Reels locked' : 'Locked'));
  col.append(head);

  if (idle) {
    col.append(
      el('div', 'font-size:44px;line-height:1.05;font-weight:700;letter-spacing:-.025em;margin-bottom:14px;', 'Ask Claude something.'),
      el('div', 'font-size:17px;line-height:1.5;color:${MUTED};max-width:32ch;', 'Your feed unlocks while Claude is thinking, and locks again the moment the answer lands.'),
    );
  } else {
    const big = el('div', 'font-size:112px;line-height:.9;font-weight:700;letter-spacing:-.05em;font-variant-numeric:tabular-nums;', clock);
    const cap = el('div', 'font-size:15px;color:${MUTED};margin:12px 0 44px;', 'scrolled across ' + seen + (seen === 1 ? ' reel' : ' reels') + ' while Claude thought');
    const rule = el('div', 'width:100%;height:1px;background:${LINE};margin-bottom:28px;');
    const msg = el('div', 'font-size:32px;line-height:1.15;font-weight:700;letter-spacing:-.02em;');
    msg.append(document.createTextNode('Your answer is ready.'), document.createElement('br'), el('span', 'color:${ORANGE};', 'Back to work.'));
    col.append(big, cap, rule, msg);
  }

  col.append(el('div', 'margin-top:56px;font-size:12px;color:${MUTED};letter-spacing:.02em;', 'Reel Scroll 1.0'));
  o.append(col);
  ['click','pointerdown','touchstart','touchmove','contextmenu'].forEach(k => o.addEventListener(k, e => { e.stopPropagation(); e.preventDefault(); }, true));
  document.documentElement.appendChild(o);
  if (!reduce) {
    o.animate([{opacity: 0}, {opacity: 1}], {duration: 220, easing: 'ease-out'});
    col.animate([{transform: 'translateY(12px)', opacity: 0}, {transform: 'none', opacity: 1}], {duration: 360, delay: 60, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'both'});
  }
  return 'locked';
})()`

export const unlockScript = (startedAt: number) => `(() => {
  ${helpers}
  if (onLogin) return 'skipped: signing in';
  W.__rsStart = ${startedAt};
  W.__rsSeen = new Set([location.pathname]);

  // A horizontal pill pinned to the top of the screen.
  const p = el('div', "position:fixed;top:0;left:0;z-index:2147483647;display:flex;flex-direction:row;align-items:center;gap:9px;height:40px;padding:0 15px 0 12px;box-sizing:border-box;border-radius:20px;white-space:nowrap;background:rgba(12,10,9,.9);border:1px solid ${LINE};box-shadow:0 10px 30px rgba(0,0,0,.45);color:${PAPER};font-family:${FONT};-webkit-font-smoothing:antialiased;pointer-events:none;opacity:0;transition:opacity .2s ease;");
  p.id = 'rs-pill';
  const NS = 'http://www.w3.org/2000/svg';
  const spark = document.createElementNS(NS, 'svg');
  spark.setAttribute('width', '18'); spark.setAttribute('height', '18'); spark.setAttribute('viewBox', '-12 -12 24 24');
  for (let i = 0; i < 8; i++) {
    const ray = document.createElementNS(NS, 'line');
    ray.setAttribute('x1', '0'); ray.setAttribute('y1', '-3.2'); ray.setAttribute('x2', '0'); ray.setAttribute('y2', i % 2 ? '-8' : '-10.5');
    ray.setAttribute('stroke', '${ORANGE}'); ray.setAttribute('stroke-width', '2.6'); ray.setAttribute('stroke-linecap', 'round');
    ray.setAttribute('transform', 'rotate(' + i * 45 + ')');
    spark.append(ray);
  }
  const time = el('span', 'font-size:13px;font-weight:600;color:${MUTED};font-variant-numeric:tabular-nums;line-height:1;min-width:2.6ch;text-align:right;', '0s');
  const label = el('span', 'font-size:13px;font-weight:600;letter-spacing:.005em;line-height:1;', 'Claude is thinking');
  p.append(spark, label, time);
  const draw = () => {
    if (location.pathname.startsWith('/reels/')) W.__rsSeen.add(location.pathname);
    const s = Math.max(0, Math.round((Date.now() - ${startedAt}) / 1000));
    time.textContent = s < 60 ? s + 's' : Math.floor(s / 60) + 'm';
  };
  // Pinned to the top of the screen, centred.
  const place = () => {
    p.style.transform = 'translate(' + Math.round((innerWidth - p.offsetWidth) / 2) + 'px,16px)';
    p.style.opacity = '1';
  };
  draw();
  W.__rsTick = setInterval(draw, 1000);
  W.__rsPos = setInterval(place, 500);
  document.documentElement.appendChild(p);
  place();
  if (!reduce) {
    spark.animate([{transform: 'rotate(0deg) scale(1)'}, {transform: 'rotate(180deg) scale(.82)'}, {transform: 'rotate(360deg) scale(1)'}], {duration: 2600, iterations: Infinity, easing: 'cubic-bezier(.45,0,.55,1)'});
    label.animate([{opacity: .7}, {opacity: 1}, {opacity: .7}], {duration: 2600, iterations: Infinity, easing: 'ease-in-out'});
  }

  // Sound back the way it was before the lock.
  const wasMuted = W.__rsWasMuted; W.__rsWasMuted = undefined;
  if (wasMuted === false) document.querySelectorAll('video').forEach(v => { try { v.muted = false; } catch (e) {} });

  const vids = [...document.querySelectorAll('video')];
  const mid = innerHeight / 2;
  const v = vids.find(x => { const r = x.getBoundingClientRect(); return r.top < mid && r.bottom > mid; }) || vids[0];
  if (v) v.play().catch(() => {});
  return 'unlocked';
})()`

// Takes the overlay, pill and guards away and leaves the page as it was.
export const offScript = () => `(() => {
  ${helpers}
  if (W.__rsWasMuted === false) document.querySelectorAll('video').forEach(v => { try { v.muted = false; } catch (e) {} });
  W.__rsWasMuted = undefined;
  return 'off';
})()`
