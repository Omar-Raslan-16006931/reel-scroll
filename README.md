# Reel Scroll 1.0

Productive scrolling. Your Instagram Reels unlock only while Claude is thinking, and lock the moment the answer lands.

- **You send Claude a message:** the Claude app's built-in browser jumps to your Instagram Reels, with a "Claude is thinking · 12s" pill at the top of the screen.
- **Claude finishes:** the video pauses and mutes, and a lock screen shows how long you scrolled and how many reels you watched. Scrolling and clicks are blocked until your next message.
- **Login pages are never locked**, so signing in or two-step verification always works.

## Install

In the Claude desktop app: click **+** next to the prompt box, then **Plugins**, **Add marketplace** with `Omar-Raslan-16006931/reel-scroll`, then **Add plugin**.

In a Claude Code terminal session:

```
/plugin install reel-scroll --marketplace Omar-Raslan-16006931/reel-scroll
```

Answer `y` to add the marketplace, then pick the **user** scope so it runs in every session.

From a shell:

```
claude plugin install reel-scroll --marketplace Omar-Raslan-16006931/reel-scroll
```

## First run

1. Open the built-in browser in the Claude desktop app (Cmd+Shift+B on Mac, Ctrl+Shift+B on Windows).
2. Go to instagram.com and sign in once. The sign-in is kept for later sessions.
3. Send Claude anything. Reels unlock.

Reel Scroll needs the Claude desktop app open, because the reels play in its built-in browser. `/reels` opens a small panel with built-in demo reels if you want to try it without Instagram.

Not affiliated with Instagram or Meta.
