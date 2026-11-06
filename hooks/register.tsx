import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, Timer } from 'claude-code'

import type { Chat, View } from '../types'
import { REELS, REEL_H, REEL_W, reelSvg } from './reels'
import { lockScript, offScript, unlockScript } from './page'
import type { Reel } from './reels'

const PANE = 'reels'
const TITLE = 'Reel Scroll 1.0'

const START: View = {
  phase: 'idle',
  startedAt: 0,
  now: 0,
  index: REELS.length - 1,
  liked: [],
  likePulse: 0,
  watched: 0,
  lastSeconds: 0,
  lastWatched: 0,
}

const view = atom({ plugin: 'reel-scroll', key: 'view' } as const, START)
const chat = atom({ plugin: 'reel-scroll', key: 'chat' } as const, { enabled: null } as Chat)

// The app's built-in browser, reached through the linked computer.
const BROWSER = 'remote-devices'
const REELS_URL = 'https://www.instagram.com/reels/'

type Engine = EngineInterface

const textOf = (r: unknown): string => {
  const c = (r as { content?: { type?: string; text?: string }[] })?.content ?? []
  return c.map(b => (b.type === 'text' ? b.text ?? '' : '')).join('\n')
}

// A cloud session reaches the browser through the linked computer; a session
// running inside the desktop app reaches it directly. Try both, keep the winner.
const ROUTES: [string, (tool: string) => string][] = [
  [BROWSER, tool => `Claude_Browser__${tool}`],
  ['Claude_Browser', tool => tool],
  ['Claude Browser', tool => tool],
]
let route = -1

const NEEDS_ACCESS = /not (yet )?allowed|approv|permission|request_access|blocked|denied/i
let askedAccess = 0

const callOnce = async ($: Engine, i: number, tool: string, args: Record<string, unknown>) => {
  const [server, name] = ROUTES[i]!
  const r = await $.mcp.call(server, name(tool), args)
  const text = textOf(r)
  if ((r as { isError?: boolean }).isError) throw new Error(text || tool + ' failed')
  return text
}

const call = async ($: Engine, tool: string, args: Record<string, unknown>) => {
  const order = route >= 0 ? [route] : ROUTES.map((_, i) => i)
  let last: unknown
  for (const i of order) {
    try {
      const text = await callOnce($, i, tool, args)
      route = i
      return text
    } catch (err) {
      last = err
      // A new chat has not been allowed to use instagram.com yet: ask, then try again.
      if (NEEDS_ACCESS.test(String((err as Error)?.message ?? err)) && Date.now() - askedAccess > 20000) {
        askedAccess = Date.now()
        $.ui.toast('Reel Scroll: approve instagram.com for the built-in browser to unlock your feed.')
        try {
          await callOnce($, i, 'request_access', { url: 'https://www.instagram.com', scope: 'site' })
          const text = await callOnce($, i, tool, args)
          route = i
          return text
        } catch (err2) {
          last = err2
        }
      }
      if (route >= 0) break
    }
  }
  throw last instanceof Error ? last : new Error(String(last))
}

// The tab already on Instagram, if the browser has one.
const findTab = async ($: Engine): Promise<{ isOpen: boolean; tabId?: string }> => {
  const text = await call($, 'tabs_context', {})
  const json = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1)
  const ctx = JSON.parse(json) as { browserOpen?: boolean; tabs?: { tabId: string; origin: string }[] }
  const tab = (ctx.tabs ?? []).find(t => /instagram\.com/.test(t.origin))
  return { isOpen: !!ctx.browserOpen, tabId: tab?.tabId }
}

const runIn = ($: Engine, tabId: string, script: string) =>
  call($, 'javascript_tool', { action: 'javascript_exec', text: script, tabId })

const openReels = async ($: Engine, startedAt: number) => {
  let { isOpen, tabId } = await findTab($)
  if (tabId) {
    await call($, 'tabs_select', { tabId })
  } else {
    if (isOpen) {
      const made = await call($, 'tabs_create', { foreground: true })
      const id = /tabId\W+([\w-]+)/.exec(made)?.[1]
      await call($, 'navigate', id ? { url: REELS_URL, tabId: id } : { url: REELS_URL })
    } else {
      await call($, 'navigate', { url: REELS_URL })
    }
    await $.clock.sleep(3500)
    tabId = (await findTab($)).tabId
  }
  if (tabId) await runIn($, tabId, unlockScript(startedAt))
}

const lockReels = async ($: Engine, isIdle: boolean) => {
  const { tabId } = await findTab($)
  if (tabId) await runIn($, tabId, lockScript(isIdle))
}

const offReels = async ($: Engine) => {
  const { tabId } = await findTab($)
  if (tabId) await runIn($, tabId, offScript())
}

// Asked once, with the person at the keyboard: lets this chat use instagram.com in the built-in browser.
const askAccess = async ($: Engine) => {
  for (let i = 0; i < ROUTES.length; i++) {
    try {
      await callOnce($, i, 'request_access', { url: 'https://www.instagram.com', scope: 'site' })
      route = i
      return true
    } catch {
      /* try the next route */
    }
  }
  return false
}

const isOn = async ($: Engine, mode: string) => {
  const c = await read($, chat)
  return c.enabled ?? mode === 'auto'
}

export const register: Register = (on, options) => {
  // 'auto': every chat. 'chat': only chats where /enable-reels was run.
  const mode = String(options?.mode ?? 'auto')

  let tick: Timer | undefined
  let mainTurn: string | undefined
  // Browser calls run in order, off the turn, so Claude never waits on them.
  let browserWork: Promise<void> = Promise.resolve()

  const stopTick = () => {
    tick?.cancel()
    tick = undefined
  }

  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'reels',
      description: 'Open Reel Scroll: reels that unlock only while Claude is thinking',
    })
    await $.command.register({
      name: 'enable-reels',
      description: 'Turn Reel Scroll on for this chat: reels unlock while Claude thinks, in every message',
    })
    await $.command.register({
      name: 'disable-reels',
      description: 'Turn Reel Scroll off for this chat',
    })
    if (await isOn($, mode)) {
      $.ui.status('🔒 Reels locked · ask Claude something')
      $.clock.after(0, () => {
        void lockReels($, true).catch(() => {})
      })
    }

    return next(e)
  })

  on('command.run', { command: 'reels' }, async $ => {
    await $.ui.open({ id: PANE, title: TITLE })

    return { text: 'Reel Scroll is open. Ask Claude something to unlock your feed.' }
  })

  on('command.run', { command: 'enable-reels' }, async $ => {
    await update($, chat, (): Chat => ({ enabled: true }))
    $.ui.status('🔒 Reels locked · ask Claude something')
    const ok = await askAccess($)
    $.clock.after(0, () => {
      void lockReels($, true).catch(() => {})
    })

    return {
      text: ok
        ? 'Reel Scroll is on for this chat. Reels unlock while Claude thinks and lock when the answer lands.'
        : 'Reel Scroll is on for this chat, but I could not reach the app\'s built-in browser. Open the Claude desktop app, then ask Claude something.',
    }
  })

  on('command.run', { command: 'disable-reels' }, async $ => {
    await update($, chat, (): Chat => ({ enabled: false }))
    stopTick()
    $.ui.status(undefined)
    $.clock.after(0, () => {
      void offReels($).catch(() => {})
    })

    return { text: 'Reel Scroll is off for this chat. Run /enable-reels to turn it back on.' }
  })

  // Claude starts thinking: unlock.
  on('turn.start', async ($, e, next) => {
    const started = await next(e)
    if (e.agentId !== undefined) return started
    if (!(await isOn($, mode))) return started

    mainTurn = e.turnId
    const now = await $.clock.now()
    await update($, view, (v): View => ({
      ...v,
      phase: 'thinking',
      startedAt: now,
      now,
      watched: 1,
      index: (v.index + 1) % REELS.length,
    }))
    $.ui.status('🔓 Reels unlocked · Claude is thinking')
    $.clock.after(0, () => {
      browserWork = browserWork.then(() =>
        openReels($, now).catch(err => {
          $.ui.toast(`Reel Scroll couldn't reach the app's browser: ${String((err as Error)?.message ?? err).slice(0, 160)}`)
        }),
      )
    })
    stopTick()
    tick = $.clock.every(1000, async () => {
      const t = await $.clock.now()
      await update($, view, (v): View => (v.phase === 'thinking' ? { ...v, now: t } : v))
    })

    return started
  })

  // Claude is done: lock it back up.
  on('turn.complete', async ($, e, next) => {
    const done = await next(e)
    if (e.agentId !== undefined) return done
    if (!(await isOn($, mode))) return done

    mainTurn = undefined
    stopTick()
    const now = await $.clock.now()
    await update($, view, (v): View => ({
      ...v,
      phase: 'done',
      now,
      lastSeconds: Math.max(0, Math.round((now - v.startedAt) / 1000)),
      lastWatched: v.watched,
    }))

    $.ui.status('🔒 Reels locked · back to work')
    $.clock.after(0, () => {
      browserWork = browserWork.then(() =>
        lockReels($, false).catch(() => {}),
      )
    })

    return done
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const els = $.ui.resolve(e)
    const { Box, Text, Button } = els
    const v = await read($, view)
    if (!('Svg' in els)) {
      return (
        <Box flexDirection="column">
          <Text bold>Reel Scroll 1.0</Text>
          <Text dimColor>Open this session in the Claude desktop app to watch reels.</Text>
        </Box>
      )
    }
    const { Svg } = els
    const reel = (REELS[v.index % REELS.length] ?? REELS[0]) as Reel
    const isOpen = v.phase === 'thinking'
    const seconds = Math.max(0, Math.round((v.now - v.startedAt) / 1000))

    const source = isOpen
      ? reelSvg(reel, {
          kind: 'unlocked',
          seconds,
          liked: v.liked.includes(v.index),
          pulse: v.likePulse,
        })
      : v.phase === 'done'
        ? reelSvg(reel, { kind: 'done', seconds: v.lastSeconds, watched: v.lastWatched })
        : reelSvg(reel, { kind: 'idle' })

    const go = (step: number) =>
      update($, view, (s): View =>
        s.phase === 'thinking'
          ? {
              ...s,
              index: (s.index + step + REELS.length) % REELS.length,
              watched: s.watched + (step > 0 ? 1 : 0),
            }
          : s,
      )

    const like = () =>
      update($, view, (s): View => {
        if (s.phase !== 'thinking') return s
        const has = s.liked.includes(s.index)
        return {
          ...s,
          liked: has ? s.liked.filter(i => i !== s.index) : [...s.liked, s.index],
          likePulse: s.likePulse + 1,
        }
      })

    return (
      <Box flexDirection="column" gap={1}>
        <Box flexDirection="row" justifyContent="space-between">
          <Text bold>
            Reel Scroll <Text color="#ff6a1a">1.0</Text>
          </Text>
          {isOpen ? (
            <Text color="green">● Live · {seconds}s</Text>
          ) : (
            <Text dimColor>Locked</Text>
          )}
        </Box>
        <Svg
          source={source}
          alt={
            isOpen
              ? `Reel by @${reel.handle}: ${reel.hook}`
              : 'Reels locked. They unlock while Claude is thinking.'
          }
          width={REEL_W}
          height={REEL_H}
        />
        {isOpen ? (
          <Box flexDirection="row" gap={1}>
            <Button key="prev" label="↑ Prev" hotkey="k" onPress={() => go(-1)} />
            <Button
              key="like"
              label={v.liked.includes(v.index) ? '♥ Liked' : '♡ Like'}
              hotkey="l"
              onPress={like}
            />
            <Button key="next" variant="primary" label="Next ↓" hotkey="j" onPress={() => go(1)} />
          </Box>
        ) : (
          <Text dimColor>
            {v.phase === 'done'
              ? 'Answer ready. Reels unlock again on your next prompt.'
              : 'Reels unlock only while Claude is thinking.'}
          </Text>
        )}
      </Box>
    )
  })
}
