---
name: disable-reels
description: Turn off Reel Scroll for this chat. Use when the user types /disable-reels or asks to stop the reels while Claude thinks.
---

# Turn Reel Scroll off

1. Use only the built-in browser (tools named `mcp__Claude_Browser__*` or `mcp__remote-devices__Claude_Browser__*`), never Claude in Chrome. Find its tab on instagram.com with `tabs_context` and run this with `javascript_tool` (`action: "javascript_exec"`):

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

2. From now on in this conversation, stop unlocking and locking reels around replies.
3. Reply in one line: "Reel Scroll is off for this chat. Run /enable-reels to turn it back on."
