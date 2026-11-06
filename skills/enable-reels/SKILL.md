---
name: enable-reels
description: Turn on Reel Scroll for this chat. Instagram Reels unlock in the built-in browser while Claude is working on a reply and lock again when the answer is ready. Use when the user types /enable-reels, asks for Reel Scroll, or wants reels to scroll while Claude thinks.
---

# Reel Scroll: reels only while Claude is thinking

Once this skill is used, it stays on for **every reply in this conversation** until the user runs /disable-reels or says to stop. The user never has to ask again.

## Browser: built-in browser only

Use only the **built-in browser**, the browser pane inside the Claude desktop app. Its tools are named `mcp__Claude_Browser__*`, or `mcp__remote-devices__Claude_Browser__*` when the chat is linked to the user's computer. **Never use Claude in Chrome** (`mcp__claude-in-chrome__*`) and never open the user's real Chrome, even if it is available.

- If the built-in browser tools are deferred, load them all in one ToolSearch with the prefix as the query. If the only one present is an `enable__...Claude_Browser` tool, call it first.
- Use `tabs_context` to see its tabs, `tabs_create` or `navigate` to open pages, `tabs_select` to bring a tab forward, and `javascript_tool` to run the scripts.
- If the site is not allowed yet and a `request_access` tool exists, call it for https://www.instagram.com with scope "site", wait for the answer, then retry.
- If the built-in browser is not available, say so in one sentence and stop. Do not fall back to Chrome.

Run each script below with `javascript_tool` on the Instagram tab (`action: "javascript_exec"`, `text` = the script, exactly as written, plus the `tabId`).

## When the user runs /enable-reels

1. Call `tabs_context`. Use a built-in browser tab already on instagram.com, otherwise open https://www.instagram.com/reels/ in a new built-in browser tab. If it shows a sign-in page, ask the user to sign in themselves in that pane, never type credentials.
2. Run the LOCK script (it shows the locked screen).
3. Reply in one line: "Reel Scroll is on for this chat. Reels unlock while I work and lock when the answer is ready."

## On every reply after that

1. **First action of the turn, before anything else:** run the UNLOCK script on the Instagram tab (use `tabs_select` to bring it forward, and reopen reels in the built-in browser if the tab is gone).
2. Do the work or think as usual.
3. **Right before writing the final answer:** run the LOCK script, then write the answer.
4. Make these calls silently: no commentary about the browser. If a call fails, retry once, then carry on with the answer and add one short line at the end saying Reel Scroll could not reach the built-in browser.

## UNLOCK script

```js
(() => {
  const W = window, e = (t, c, x) => { const n = document.createElement(t); n.style.cssText = c; if (x != null) n.textContent = x; return n };
  clearInterval(W.__rsA); clearInterval(W.__rsB); clearInterval(W.__rsC);
  ['rs-lock', 'rs-pill'].forEach(i => document.getElementById(i)?.remove());
  if (W.__rsPlay) document.removeEventListener('play', W.__rsPlay, true);
  if (W.__rsKey) document.removeEventListener('keydown', W.__rsKey, true);
  if (W.__rsWh) document.removeEventListener('wheel', W.__rsWh, { capture: true });
  if (/^\/(accounts|challenge)/.test(location.pathname)) return 'sign-in page: ask the user to sign in';
  W.__rsStart = Date.now(); W.__rsSeen = new Set([location.pathname]);
  const NS = 'http://www.w3.org/2000/svg', F = "-apple-system,'Segoe UI',Roboto,Arial,sans-serif";
  const p = e('div', 'position:fixed;top:0;left:0;z-index:2147483647;display:flex;align-items:center;gap:9px;height:40px;padding:0 15px 0 12px;border-radius:20px;white-space:nowrap;background:rgba(12,10,9,.9);border:1px solid rgba(250,247,244,.12);box-shadow:0 10px 30px rgba(0,0,0,.45);color:#faf7f4;font-family:' + F + ';pointer-events:none;opacity:0;transition:opacity .2s;');
  p.id = 'rs-pill';
  const sp = document.createElementNS(NS, 'svg'); sp.setAttribute('width', 18); sp.setAttribute('height', 18); sp.setAttribute('viewBox', '-12 -12 24 24');
  for (let i = 0; i < 8; i++) { const l = document.createElementNS(NS, 'line'); l.setAttribute('y1', -3.2); l.setAttribute('y2', i % 2 ? -8 : -10.5); l.setAttribute('stroke', '#ff6a1a'); l.setAttribute('stroke-width', 2.6); l.setAttribute('stroke-linecap', 'round'); l.setAttribute('transform', 'rotate(' + i * 45 + ')'); sp.append(l); }
  const t = e('span', 'font-size:13px;font-weight:600;color:#a8a29e;font-variant-numeric:tabular-nums;min-width:2.6ch;text-align:right;', '0s');
  p.append(sp, e('span', 'font-size:13px;font-weight:600;', 'Claude is thinking'), t);
  const draw = () => { if (location.pathname.startsWith('/reels/')) W.__rsSeen.add(location.pathname); const s = Math.round((Date.now() - W.__rsStart) / 1000); t.textContent = s < 60 ? s + 's' : Math.floor(s / 60) + 'm'; };
  const place = () => { p.style.transform = 'translate(' + Math.round((innerWidth - p.offsetWidth) / 2) + 'px,16px)'; p.style.opacity = 1; };
  draw(); W.__rsA = setInterval(draw, 1000); W.__rsB = setInterval(place, 500);
  document.documentElement.appendChild(p); place();
  sp.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(360deg)' }], { duration: 2600, iterations: Infinity });
  if (W.__rsMuted === false) document.querySelectorAll('video').forEach(v => { try { v.muted = false } catch (x) {} });
  W.__rsMuted = undefined;
  const vs = [...document.querySelectorAll('video')], mid = innerHeight / 2;
  const v = vs.find(x => { const r = x.getBoundingClientRect(); return r.top < mid && r.bottom > mid }) || vs[0];
  if (v) v.play().catch(() => {});
  return 'unlocked';
})()
```

## LOCK script

```js
(() => {
  const W = window, e = (t, c, x) => { const n = document.createElement(t); n.style.cssText = c; if (x != null) n.textContent = x; return n };
  clearInterval(W.__rsA); clearInterval(W.__rsB); clearInterval(W.__rsC);
  ['rs-lock', 'rs-pill'].forEach(i => document.getElementById(i)?.remove());
  if (W.__rsPlay) document.removeEventListener('play', W.__rsPlay, true);
  if (W.__rsKey) document.removeEventListener('keydown', W.__rsKey, true);
  if (W.__rsWh) document.removeEventListener('wheel', W.__rsWh, { capture: true });
  if (/^\/(accounts|challenge)/.test(location.pathname)) return 'sign-in page: skipped';
  const seen = W.__rsSeen ? W.__rsSeen.size : 0, idle = !seen;
  const s = W.__rsStart ? Math.round((Date.now() - W.__rsStart) / 1000) : 0, clock = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  const hush = v => { try { v.muted = true; v.pause() } catch (x) {} }, all = () => document.querySelectorAll('video').forEach(hush);
  if (W.__rsMuted === undefined) { const pl = [...document.querySelectorAll('video')].find(v => !v.paused); W.__rsMuted = pl ? pl.muted : false; }
  all(); W.__rsPlay = ev => { if (ev.target instanceof HTMLVideoElement) hush(ev.target) }; document.addEventListener('play', W.__rsPlay, true);
  W.__rsC = setInterval(all, 250);
  W.__rsKey = ev => { ev.stopPropagation(); ev.preventDefault() }; W.__rsWh = W.__rsKey;
  document.addEventListener('keydown', W.__rsKey, true); document.addEventListener('wheel', W.__rsWh, { capture: true, passive: false });
  const F = "-apple-system,'Segoe UI',Roboto,Arial,sans-serif", O = '#ff6a1a', M = '#a8a29e';
  const o = e('div', 'position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;background:#0c0a09;color:#faf7f4;font-family:' + F + ';padding:24px;box-sizing:border-box;'); o.id = 'rs-lock';
  const c = e('div', 'width:min(420px,100%);');
  const NS = 'http://www.w3.org/2000/svg', ic = document.createElementNS(NS, 'svg'); ic.setAttribute('width', 40); ic.setAttribute('height', 47); ic.setAttribute('viewBox', '0 0 44 52');
  const pa = document.createElementNS(NS, 'path'); pa.setAttribute('d', 'M11 22v-7.5a11 11 0 0 1 22 0V22'); pa.setAttribute('fill', 'none'); pa.setAttribute('stroke', O); pa.setAttribute('stroke-width', 4); pa.setAttribute('stroke-linecap', 'round');
  const re = document.createElementNS(NS, 'rect'); re.setAttribute('x', 3); re.setAttribute('y', 22); re.setAttribute('width', 38); re.setAttribute('height', 28); re.setAttribute('rx', 6); re.setAttribute('fill', O); ic.append(pa, re);
  const hd = e('div', 'display:flex;align-items:center;gap:16px;margin-bottom:44px;'); hd.append(ic, e('span', 'font-size:26px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#faf7f4;', idle ? 'Reels locked' : 'Locked')); c.append(hd);
  if (idle) c.append(e('div', 'font-size:44px;line-height:1.05;font-weight:700;letter-spacing:-.025em;margin-bottom:14px;', 'Ask Claude something.'), e('div', 'font-size:17px;line-height:1.5;color:' + M + ';', 'Your feed unlocks while Claude is thinking.'));
  else {
    c.append(e('div', 'font-size:112px;line-height:.9;font-weight:700;letter-spacing:-.05em;font-variant-numeric:tabular-nums;', clock), e('div', 'font-size:15px;color:' + M + ';margin:12px 0 40px;', 'scrolled across ' + seen + (seen === 1 ? ' reel' : ' reels') + ' while Claude thought'));
    const m = e('div', 'font-size:32px;line-height:1.15;font-weight:700;letter-spacing:-.02em;'); m.append(document.createTextNode('Your answer is ready.'), document.createElement('br'), e('span', 'color:' + O + ';', 'Back to work.')); c.append(m);
  }
  o.append(c); ['click', 'pointerdown', 'touchstart', 'touchmove', 'contextmenu'].forEach(k => o.addEventListener(k, ev => { ev.stopPropagation(); ev.preventDefault() }, true));
  document.documentElement.appendChild(o);
  return 'locked';
})()
```

## Turning it off

If the user says to stop reels, run the OFF script once in the built-in browser's Instagram tab and stop doing steps 1 and 3 above for the rest of the chat.

```js
(() => {
  const W = window; clearInterval(W.__rsA); clearInterval(W.__rsB); clearInterval(W.__rsC);
  ['rs-lock', 'rs-pill'].forEach(i => document.getElementById(i)?.remove());
  if (W.__rsPlay) document.removeEventListener('play', W.__rsPlay, true);
  if (W.__rsKey) document.removeEventListener('keydown', W.__rsKey, true);
  if (W.__rsWh) document.removeEventListener('wheel', W.__rsWh, { capture: true });
  if (W.__rsMuted === false) document.querySelectorAll('video').forEach(v => { try { v.muted = false } catch (x) {} });
  W.__rsMuted = undefined; return 'off';
})()
```
