// Reel Scroll for claude.ai: the service worker that links the claude.ai tab to the Instagram tab.
const REELS_URL = 'https://www.instagram.com/reels/'
const DEFAULTS = { enabled: true, front: true }

const getState = async () => (await chrome.storage.session.get({ thinking: false, startedAt: 0 }))
const setState = (s) => chrome.storage.session.set(s)
const getSettings = () => chrome.storage.local.get(DEFAULTS)

const igTabs = () => chrome.tabs.query({ url: '*://*.instagram.com/*' })
const tell = async (tabId, msg) => { try { await chrome.tabs.sendMessage(tabId, msg) } catch (e) { /* page not ready: it asks for the state itself when it loads */ } }

async function setBadge(on) {
  await chrome.action.setBadgeBackgroundColor({ color: '#ff6a1a' })
  await chrome.action.setBadgeText({ text: on ? 'ON' : '' })
}

async function generating(on, sender) {
  const { enabled, front } = await getSettings()
  if (!enabled) return
  const state = await getState()
  if (on === state.thinking) return

  if (on) {
    const startedAt = Date.now()
    await setState({ thinking: true, startedAt, claudeTab: sender.tab?.id, claudeWindow: sender.tab?.windowId })
    await setBadge(true)
    let tabs = await igTabs()
    if (!tabs.length) {
      // A phone-shaped window beside the chat. The page syncs itself when it loads.
      await chrome.windows.create({ url: REELS_URL, type: 'popup', width: 440, height: 860, focused: front })
    } else {
      const t = tabs.find((x) => /\/reels/.test(x.url || '')) || tabs[0]
      if (!/\/reels/.test(t.url || '')) await chrome.tabs.update(t.id, { url: REELS_URL })
      if (front) {
        await chrome.windows.update(t.windowId, { focused: true })
        await chrome.tabs.update(t.id, { active: true })
      }
      for (const x of tabs) await tell(x.id, { type: 'sync', thinking: true, startedAt })
    }
  } else {
    await setState({ thinking: false })
    await setBadge(false)
    for (const x of await igTabs()) await tell(x.id, { type: 'sync', thinking: false, startedAt: state.startedAt })
    // Back to work.
    if (front && state.claudeWindow != null) {
      try {
        await chrome.windows.update(state.claudeWindow, { focused: true })
        if (state.claudeTab != null) await chrome.tabs.update(state.claudeTab, { active: true })
      } catch (e) { /* the chat window was closed */ }
    }
  }
}

chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  if (msg?.type === 'gen') {
    generating(!!msg.on, sender).then(() => reply({ ok: true }))
    return true
  }
  if (msg?.type === 'hello') {
    Promise.all([getState(), getSettings()]).then(([s, set]) => reply({ thinking: s.thinking, startedAt: s.startedAt, enabled: set.enabled }))
    return true
  }
})

chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area === 'local' && changes.enabled) {
    const { enabled } = await getSettings()
    for (const x of await igTabs()) await tell(x.id, { type: 'enabled', enabled })
    if (!enabled) { await setState({ thinking: false }); await setBadge(false) }
  }
})
