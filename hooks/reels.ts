// The reels and the SVG that draws each one, 9:16, animated with SMIL.

export type Reel = {
  handle: string
  hook: string
  caption: string
  audio: string
  emoji: string
  sky: [string, string]
  floor: string
  motion: 'bob' | 'breathe' | 'hop' | 'wobble' | 'slide'
  likes: number
  comments: number
}

export const REELS: Reel[] = [
  { handle: 'catsofsydney', hook: "POV: it's monday 9am", caption: 'she does this every morning', audio: 'original audio · catsofsydney', emoji: '🐈', sky: ['#c9b9a6', '#8f7e6c'], floor: '#6d5f50', motion: 'breathe', likes: 48200, comments: 1204 },
  { handle: 'fluff.report', hook: 'when someone says "walk" 👀', caption: 'he heard the word "walk"', audio: 'original audio · fluff.report', emoji: '🐕', sky: ['#dfe8f2', '#a9bccf'], floor: '#e9eef3', motion: 'hop', likes: 112000, comments: 3310 },
  { handle: 'birb.daily', hook: 'reviewing my life choices', caption: 'reviewing my life choices', audio: 'original audio · birb.daily', emoji: '🐦', sky: ['#1d2b3a', '#0b1118'], floor: '#24323f', motion: 'wobble', likes: 9861, comments: 1204 },
  { handle: 'quack.hq', hook: 'me walking into standup with 0 updates', caption: 'confidence is everything', audio: 'standup theme · quack.hq', emoji: '🦆', sky: ['#9fd3c7', '#4f9e8f'], floor: '#3b7d70', motion: 'slide', likes: 77400, comments: 2051 },
  { handle: 'hamster.dev', hook: 'my code compiling on the first try', caption: 'it never happens again', audio: 'victory.mp3 · hamster.dev', emoji: '🐹', sky: ['#ffd9a8', '#f39c4a'], floor: '#c76a1f', motion: 'hop', likes: 203000, comments: 8890 },
  { handle: 'otterly', hook: 'they hold hands so they don’t drift apart', caption: 'this is the content I signed up for', audio: 'soft piano · otterly', emoji: '🦦', sky: ['#a8c8e8', '#4f7fae'], floor: '#3a6890', motion: 'bob', likes: 541000, comments: 12400 },
  { handle: 'ribbit.tv', hook: 'frog sees rain for the first time', caption: 'he stood there for 20 minutes', audio: 'rain sounds · ribbit.tv', emoji: '🐸', sky: ['#5d6d7a', '#2d3840'], floor: '#3c4c3a', motion: 'breathe', likes: 66300, comments: 940 },
  { handle: 'waddle.zone', hook: 'penguin trips, 47 times in a row', caption: 'part 2 when this hits 10k', audio: 'oops · waddle.zone', emoji: '🐧', sky: ['#e8f4fb', '#b6d7ea'], floor: '#f4fafd', motion: 'slide', likes: 128000, comments: 4402 },
]

const W = 320
const H = 568
const ACCENT = '#ff6a1a'

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export const count = (n: number) =>
  n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(n >= 100000 ? 0 : 1)}K` : String(n)

const motionOf = (m: Reel['motion']) => {
  switch (m) {
    case 'bob':
      return '<animateTransform attributeName="transform" type="translate" values="0 0; 0 -14; 0 0" dur="2.4s" repeatCount="indefinite"/>'
    case 'breathe':
      return '<animateTransform attributeName="transform" type="scale" values="1 1; 1.04 0.97; 1 1" dur="3s" repeatCount="indefinite" additive="sum"/>'
    case 'hop':
      return '<animateTransform attributeName="transform" type="translate" values="0 0; 0 -46; 0 0; 0 0" keyTimes="0; 0.35; 0.7; 1" dur="1.1s" repeatCount="indefinite"/>'
    case 'wobble':
      return '<animateTransform attributeName="transform" type="rotate" values="-8 0 0; 8 0 0; -8 0 0" dur="1.8s" repeatCount="indefinite"/>'
    case 'slide':
      return '<animateTransform attributeName="transform" type="translate" values="-60 0; 60 0; -60 0" dur="4s" repeatCount="indefinite"/>'
  }
}

// The scene shared by every state: sky, floor, the star, its shadow.
const scene = (r: Reel, blur: boolean) => `
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${r.sky[0]}"/><stop offset="1" stop-color="${r.sky[1]}"/></linearGradient>
    <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.75"/></linearGradient>
    <filter id="soft" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="${blur ? 16 : 0}"/></filter>
    <clipPath id="frame"><rect width="${W}" height="${H}" rx="22"/></clipPath>
  </defs>
  <g clip-path="url(#frame)">
    <g filter="url(#soft)">
      <rect width="${W}" height="${H}" fill="url(#sky)"/>
      <ellipse cx="${W / 2}" cy="${H * 0.86}" rx="${W}" ry="${H * 0.22}" fill="${r.floor}"/>
      <ellipse cx="${W / 2}" cy="${H * 0.69}" rx="70" ry="12" fill="#000" opacity="0.18"/>
      <g transform="translate(${W / 2} ${H * 0.6})">
        <g>${motionOf(r.motion)}
          <text x="0" y="0" font-size="150" text-anchor="middle" dominant-baseline="middle">${r.emoji}</text>
        </g>
      </g>
    </g>
    <rect width="${W}" height="${H}" fill="url(#shade)"/>
  </g>`

const tabs = `
  <text x="${W / 2 - 34}" y="34" font-size="13" fill="#fff" fill-opacity="0.7" text-anchor="middle" font-family="system-ui, sans-serif">Following</text>
  <text x="${W / 2 + 36}" y="34" font-size="13" fill="#fff" font-weight="700" text-anchor="middle" font-family="system-ui, sans-serif">For You</text>
  <rect x="${W / 2 + 22}" y="41" width="28" height="2" rx="1" fill="#fff"/>`

// Raw icons only: no tile or circle behind any of them.
const heart = (x: number, y: number, fill: string) =>
  `<path transform="translate(${x} ${y}) scale(1.1)" d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.8 4.5c2.1 0 3.6 1.1 5.2 3 1.6-1.9 3.1-3 5.2-3 3.8 0 5.9 3.9 4.4 7.3C19.5 16.4 12 21 12 21z" fill="${fill}" stroke="#fff" stroke-width="${fill === 'none' ? 1.8 : 0}"/>`
const bubble = (x: number, y: number) =>
  `<path transform="translate(${x} ${y}) scale(1.1)" d="M4 5h16v11H9l-5 4z" fill="none" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/>`
const send = (x: number, y: number) =>
  `<path transform="translate(${x} ${y}) scale(1.1)" d="M3 11 21 3l-7 18-3-7z" fill="none" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/>`
const lock = (cx: number, cy: number, color: string) =>
  `<g transform="translate(${cx - 22} ${cy - 26})" fill="none" stroke="${color}" stroke-width="3.2" stroke-linecap="round"><path d="M10 22v-8a12 12 0 0 1 24 0v8"/><rect x="4" y="22" width="36" height="28" rx="5" fill="${color}" stroke="none"/></g>`

const label = (x: number, y: number, t: string) =>
  `<text x="${x}" y="${y}" font-size="11" fill="#fff" text-anchor="middle" font-family="system-ui, sans-serif">${esc(t)}</text>`

export type ReelState =
  | { kind: 'unlocked'; seconds: number; liked: boolean; pulse: number }
  | { kind: 'idle' }
  | { kind: 'done'; seconds: number; watched: number }

export const reelSvg = (r: Reel, s: ReelState): string => {
  const font = 'font-family="system-ui, -apple-system, Segoe UI, sans-serif"'
  let body = ''

  if (s.kind === 'unlocked') {
    const pill = `Unlocked · Claude thinking ${s.seconds}s`
    const pw = 22 + pill.length * 6.4
    const rail = W - 34
    body = `
      ${tabs}
      <g>
        <rect x="${(W - pw) / 2}" y="56" width="${pw}" height="24" rx="12" fill="${ACCENT}"/>
        <text x="${W / 2}" y="72" font-size="12" font-weight="700" fill="#fff" text-anchor="middle" ${font}>${esc(pill)}</text>
      </g>
      <g>
        <rect x="${W / 2 - (r.hook.length * 7.6 + 24) / 2}" y="150" width="${r.hook.length * 7.6 + 24}" height="32" rx="6" fill="#fff"/>
        <text x="${W / 2}" y="171" font-size="14" font-weight="700" fill="#111" text-anchor="middle" ${font}>${esc(r.hook)}</text>
      </g>
      ${heart(rail - 13, 300, s.liked ? '#ff3b5c' : 'none')}
      ${label(rail, 340, count(r.likes + (s.liked ? 1 : 0)))}
      ${bubble(rail - 13, 360)}
      ${label(rail, 400, count(r.comments))}
      ${send(rail - 13, 420)}
      ${label(rail, 460, 'Share')}
      <text x="16" y="${H - 64}" font-size="14" font-weight="700" fill="#fff" ${font}>@${esc(r.handle)}</text>
      <text x="16" y="${H - 44}" font-size="13" fill="#fff" ${font}>${esc(r.caption)}</text>
      <text x="16" y="${H - 22}" font-size="11" fill="#fff" fill-opacity="0.8" ${font}>♫ ${esc(r.audio)}</text>
      ${
        s.liked
          ? `<g transform="translate(${W / 2} ${H * 0.5})" opacity="0">
               <g transform="translate(-48 -44) scale(4)"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.8 4.5c2.1 0 3.6 1.1 5.2 3 1.6-1.9 3.1-3 5.2-3 3.8 0 5.9 3.9 4.4 7.3C19.5 16.4 12 21 12 21z" fill="#ff3b5c"/></g>
               <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.6;1" dur="0.9s" begin="0s" fill="freeze" id="p${s.pulse}"/>
             </g>`
          : ''
      }`
  } else {
    const title = s.kind === 'idle' ? 'Reels locked' : 'Locked'
    const sub: [string, string] =
      s.kind === 'idle'
        ? ['Ask Claude something', 'to unlock']
        : ['Your answer is ready.', 'Back to work 🫡']
    const stat =
      s.kind === 'done'
        ? `${s.watched} reel${s.watched === 1 ? '' : 's'} · ${Math.floor(s.seconds / 60)}:${String(s.seconds % 60).padStart(2, '0')}`
        : ''
    body = `
      <rect width="${W}" height="${H}" rx="22" fill="#0d0907" opacity="0.55"/>
      ${tabs}
      ${lock(W / 2, H / 2 - 50, ACCENT)}
      <text x="${W / 2}" y="${H / 2 + 20}" font-size="20" font-weight="800" fill="#fff" text-anchor="middle" ${font}>${title}</text>
      <text x="${W / 2}" y="${H / 2 + 46}" font-size="13" fill="#fff" fill-opacity="0.75" text-anchor="middle" ${font}>${esc(sub[0])}</text>
      <text x="${W / 2}" y="${H / 2 + 64}" font-size="13" fill="#fff" fill-opacity="0.75" text-anchor="middle" ${font}>${esc(sub[1])}</text>
      ${stat ? `<text x="${W / 2}" y="${H / 2 + 96}" font-size="12" font-weight="700" fill="${ACCENT}" text-anchor="middle" ${font}>${esc(stat)} ✓</text>` : ''}`
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${scene(r, s.kind !== 'unlocked')}${body}</svg>`
}

export const REEL_W = W
export const REEL_H = H
