// Watches claude.ai and tells the background when Claude starts and stops generating.
(() => {
  const SELECTOR = [
    'button[aria-label*="Stop" i]',
    'button[data-testid*="stop" i]',
    '[data-is-streaming="true"]',
  ].join(',')

  const generating = () => !!document.querySelector(SELECTOR)

  let current = false
  let timer
  const send = (on) => { try { chrome.runtime.sendMessage({ type: 'gen', on }) } catch (e) { /* extension reloaded */ } }

  // Debounced: a start counts at once, an end after a short quiet (tool calls pause the stop button).
  const check = () => {
    const now = generating()
    if (now === current) { clearTimeout(timer); timer = undefined; return }
    if (now) { clearTimeout(timer); timer = undefined; current = true; send(true); return }
    if (!timer) timer = setTimeout(() => { timer = undefined; if (!generating()) { current = false; send(false) } }, 1500)
  }

  new MutationObserver(check).observe(document.documentElement, {
    subtree: true, childList: true, attributes: true, attributeFilter: ['aria-label', 'data-is-streaming', 'data-testid'],
  })
  setInterval(check, 700)
  addEventListener('pagehide', () => { if (current) send(false) })
})()
