export type Phase = 'idle' | 'thinking' | 'done'

export type View = {
  phase: Phase
  startedAt: number
  now: number
  index: number
  liked: number[]
  likePulse: number
  watched: number
  lastSeconds: number
  lastWatched: number
}

declare module 'claude-code' {
  interface PluginState {
    'reel-scroll': { view: View }
  }
}
