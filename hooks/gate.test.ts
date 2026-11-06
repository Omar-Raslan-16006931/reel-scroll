import { expect, test } from 'claude-code/testing'

const turn = (id: string) => ({ turnId: id, sessionId: 's', cwd: '/' }) as never

for (const [name, stored, calls] of [
  ['chat mode, not enabled: no browser calls', { enabled: null }, 0],
  ['chat mode, enabled: browser is used', { enabled: true }, 1],
] as const) {
  test(name, { options: { mode: 'chat' } }, async ($, on) => {
    let browser = 0 // counts the unlock status: the browser work itself runs off a timer
    on('state.get', () => ({ value: { value: stored, version: 1 } }))
    on('state.set', () => ({ value: { isSet: true, version: 2 } }))
    on('turn.start', (_, e) => ({ turnId: e.turnId }))
    on('clock.now', () => ({ value: 1000 }))
    on('clock.after', () => ({ value: {} }) as never)
    on('clock.every', () => ({ value: {} }) as never)
    on('ui.status', (_, e) => {
      if (/unlocked/.test(String((e as { text?: string }).text))) browser++
      return { value: {} } as never
    })

    await $.turn.start(turn('t1'))
    expect(browser > 0).toBe(calls === 1)
  })
}
