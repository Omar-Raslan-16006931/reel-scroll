// Runs on instagram.com: shows the "Claude is thinking" pill while Claude generates, and the lock screen otherwise.
// DOM calls only (no innerHTML).
(() => {
  const FONT = "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI Variable Display', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
  const INK = '#0c0a09', PAPER = '#faf7f4', MUTED = '#a8a29e', LINE = 'rgba(250,247,244,0.12)', ORANGE = '#ff6a1a'
  const NS = 'http://www.w3.org/2000/svg'
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches

  let want = { enabled: true, thinking: false, startedAt: 0 }
  let shown = 'off' // 'off' | 'unlocked' | 'locked'
  let seen = new Set()
  let wasMuted
  const timers = []
  let onPlay, onKey, onWheel

  const onLogin = () => /^\/(accounts|challenge)/.test(location.pathname)
  const el = (tag, css, text) => { const n = document.createElement(tag); n.style.cssText = css; if (text != null) n.textContent = text; return n }
  const svgLock = (size, color) => {
    const s = document.createElementNS(NS, 'svg')
    s.setAttribute('width', size); s.setAttribute('height', size * 52 / 44); s.setAttribute('viewBox', '0 0 44 52')
    const p = document.createElementNS(NS, 'path')
    p.setAttribute('d', 'M11 22v-7.5a11 11 0 0 1 22 0V22'); p.setAttribute('fill', 'none'); p.setAttribute('stroke', color)
    p.setAttribute('stroke-width', '4'); p.setAttribute('stroke-linecap', 'round')
    const r = document.createElementNS(NS, 'rect')
    r.setAttribute('x', '3'); r.setAttribute('y', '22'); r.setAttribute('width', '38'); r.setAttribute('height', '28'); r.setAttribute('rx', '6'); r.setAttribute('fill', color)
    s.append(p, r)
    return s
  }

  const kill = () => {
    while (timers.length) clearInterval(timers.pop())
    if (onPlay) document.removeEventListener('play', onPlay, true)
    if (onKey) document.removeEventListener('keydown', onKey, true)
    if (onWheel) document.removeEventListener('wheel', onWheel, { capture: true })
    onPlay = onKey = onWheel = undefined
    document.getElementById('rs-lock')?.remove()
    document.getElementById('rs-pill')?.remove()
  }

  const hush = (v) => { try { v.muted = true; v.pause() } catch (e) { /* ignore */ } }

  function unlock(startedAt) {
    kill()
    shown = 'unlocked'
    seen = new Set([location.pathname])

    const p = el('div', "position:fixed;top:0;left:0;z-index:2147483647;display:flex;flex-direction:row;align-items:center;gap:9px;height:40px;padding:0 15px 0 12px;box-sizing:border-box;border-radius:20px;white-space:nowrap;background:rgba(12,10,9,.9);border:1px solid " + LINE + ";box-shadow:0 10px 30px rgba(0,0,0,.45);color:" + PAPER + ";font-family:" + FONT + ";-webkit-font-smoothing:antialiased;pointer-events:none;opacity:0;transition:opacity .2s ease;")
    p.id = 'rs-pill'
    const spark = document.createElementNS(NS, 'svg')
    spark.setAttribute('width', '18'); spark.setAttribute('height', '18'); spark.setAttribute('viewBox', '-12 -12 24 24')
    for (let i = 0; i < 8; i++) {
      const ray = document.createElementNS(NS, 'line')
      ray.setAttribute('x1', '0'); ray.setAttribute('y1', '-3.2'); ray.setAttribute('x2', '0'); ray.setAttribute('y2', i % 2 ? '-8' : '-10.5')
      ray.setAttribute('stroke', ORANGE); ray.setAttribute('stroke-width', '2.6'); ray.setAttribute('stroke-linecap', 'round')
      ray.setAttribute('transform', 'rotate(' + i * 45 + ')')
      spark.append(ray)
    }
    const time = el('span', 'font-size:13px;font-weight:600;color:' + MUTED + ';font-variant-numeric:tabular-nums;line-height:1;min-width:2.6ch;text-align:right;', '0s')
    const label = el('span', 'font-size:13px;font-weight:600;letter-spacing:.005em;line-height:1;', 'Claude is thinking')
    p.append(spark, label, time)
    const draw = () => {
      if (location.pathname.startsWith('/reels/')) seen.add(location.pathname)
      const s = Math.max(0, Math.round((Date.now() - startedAt) / 1000))
      time.textContent = s < 60 ? s + 's' : Math.floor(s / 60) + 'm'
    }
    const place = () => {
      p.style.transform = 'translate(' + Math.round((innerWidth - p.offsetWidth) / 2) + 'px,16px)'
      p.style.opacity = '1'
    }
    draw()
    timers.push(setInterval(draw, 1000), setInterval(place, 500))
    document.documentElement.appendChild(p)
    place()
    if (!reduce) {
      spark.animate([{ transform: 'rotate(0deg) scale(1)' }, { transform: 'rotate(180deg) scale(.82)' }, { transform: 'rotate(360deg) scale(1)' }], { duration: 2600, iterations: Infinity, easing: 'cubic-bezier(.45,0,.55,1)' })
    }

    if (wasMuted === false) document.querySelectorAll('video').forEach((v) => { try { v.muted = false } catch (e) { /* ignore */ } })
    wasMuted = undefined
    const vids = [...document.querySelectorAll('video')]
    const mid = innerHeight / 2
    const v = vids.find((x) => { const r = x.getBoundingClientRect(); return r.top < mid && r.bottom > mid }) || vids[0]
    if (v) v.play().catch(() => {})
  }

  function lock(startedAt) {
    const hadSeen = seen.size
    const idle = !startedAt || !hadSeen
    const secs = startedAt ? Math.max(0, Math.round((Date.now() - startedAt) / 1000)) : 0
    const clock = Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0')
    kill()
    shown = 'locked'

    if (wasMuted === undefined) {
      const playing = [...document.querySelectorAll('video')].find((v) => !v.paused)
      wasMuted = playing ? playing.muted : false
    }
    const pauseAll = () => document.querySelectorAll('video').forEach(hush)
    pauseAll()
    onPlay = (e) => { if (e.target instanceof HTMLVideoElement) hush(e.target) }
    document.addEventListener('play', onPlay, true)
    timers.push(setInterval(pauseAll, 250))
    onKey = (e) => { e.stopPropagation(); e.preventDefault() }
    onWheel = (e) => { e.stopPropagation(); e.preventDefault() }
    document.addEventListener('keydown', onKey, true)
    document.addEventListener('wheel', onWheel, { capture: true, passive: false })

    const o = el('div', 'position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;background:' + INK + ';color:' + PAPER + ';font-family:' + FONT + ';-webkit-font-smoothing:antialiased;padding:24px;box-sizing:border-box;')
    o.id = 'rs-lock'
    const col = el('div', 'width:min(420px,100%);display:flex;flex-direction:column;align-items:flex-start;')
    const head = el('div', 'display:flex;align-items:center;gap:16px;margin-bottom:44px;')
    head.append(svgLock(40, ORANGE), el('span', 'font-size:26px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:' + PAPER + ';', idle ? 'Reels locked' : 'Locked'))
    col.append(head)
    if (idle) {
      col.append(
        el('div', 'font-size:44px;line-height:1.05;font-weight:700;letter-spacing:-.025em;margin-bottom:14px;', 'Ask Claude something.'),
        el('div', 'font-size:17px;line-height:1.5;color:' + MUTED + ';max-width:32ch;', 'Your feed unlocks while Claude is thinking, and locks again the moment the answer lands.'),
      )
    } else {
      const big = el('div', 'font-size:112px;line-height:.9;font-weight:700;letter-spacing:-.05em;font-variant-numeric:tabular-nums;', clock)
      const cap = el('div', 'font-size:15px;color:' + MUTED + ';margin:12px 0 44px;', 'scrolled across ' + hadSeen + (hadSeen === 1 ? ' reel' : ' reels') + ' while Claude thought')
      const rule = el('div', 'width:100%;height:1px;background:' + LINE + ';margin-bottom:28px;')
      const msg = el('div', 'font-size:32px;line-height:1.15;font-weight:700;letter-spacing:-.02em;')
      msg.append(document.createTextNode('Your answer is ready.'), document.createElement('br'), el('span', 'color:' + ORANGE + ';', 'Back to work.'))
      col.append(big, cap, rule, msg)
    }
    col.append(el('div', 'margin-top:56px;font-size:12px;color:' + MUTED + ';letter-spacing:.02em;', 'Reel Scroll 1.0'))
    o.append(col)
    ;['click', 'pointerdown', 'touchstart', 'touchmove', 'contextmenu'].forEach((k) => o.addEventListener(k, (e) => { e.stopPropagation(); e.preventDefault() }, true))
    document.documentElement.appendChild(o)
    if (!reduce) {
      o.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: 'ease-out' })
      col.animate([{ transform: 'translateY(12px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 360, delay: 60, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'both' })
    }
  }

  function off() {
    kill()
    if (shown === 'locked' && wasMuted === false) document.querySelectorAll('video').forEach((v) => { try { v.muted = false } catch (e) { /* ignore */ } })
    wasMuted = undefined
    shown = 'off'
  }

  // The page is made to match what the background last said; checked every second so a sign-in
  // or an Instagram page change never leaves it in the wrong state.
  function ensure() {
    if (!want.enabled) { if (shown !== 'off') off(); return }
    if (onLogin()) { if (shown !== 'off') off(); return }
    if (want.thinking) {
      if (shown !== 'unlocked' || !document.getElementById('rs-pill')) unlock(want.startedAt)
    } else if (shown !== 'locked' || !document.getElementById('rs-lock')) {
      lock(want.startedAt)
    }
  }

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.type === 'sync') { want = { ...want, thinking: !!msg.thinking, startedAt: msg.startedAt || want.startedAt }; ensure() }
    if (msg?.type === 'enabled') { want = { ...want, enabled: !!msg.enabled }; ensure() }
  })
  chrome.runtime.sendMessage({ type: 'hello' }, (s) => {
    if (chrome.runtime.lastError || !s) return
    want = { enabled: s.enabled, thinking: s.thinking, startedAt: s.startedAt }
    ensure()
  })
  setInterval(ensure, 1000)
})()
