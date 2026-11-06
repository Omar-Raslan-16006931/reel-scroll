# Reel Scroll 1.0

<p align="center">
  <a href="media/reel-scroll-promo.mp4">
    <img src="media/preview.gif" alt="Reel Scroll promo (click for the full video with sound)" width="300">
  </a>
  <br>
  <a href="media/reel-scroll-promo.mp4"><b>▶ Watch the full 44-second video (with sound)</b></a>
</p>

<video src="media/reel-scroll-promo.mp4" poster="media/poster.jpg" controls muted width="360"></video>

Productive scrolling. Your Instagram Reels unlock only while Claude is thinking, and lock the moment the answer lands.

- **You send Claude a message:** the Claude app's built-in browser jumps to your Instagram Reels, with a "Claude is thinking · 12s" pill at the top of the screen.
- **Claude finishes:** the video pauses and mutes, and a lock screen shows how long you scrolled and how many reels you watched. Scrolling and clicks are blocked until your next message.
- **Login pages are never locked**, so signing in or two-step verification always works.

## Where it works

Reel Scroll is a plugin with hooks, and Claude only runs plugin hooks in **Claude Code** (the desktop app's **Code** tab, the terminal, IDE extensions) and in **Cowork** tasks. The plain **Chat** tab, and claude.ai in the browser, ignore plugin hooks, so Reel Scroll cannot run there. Start a Code or Cowork session in the Claude desktop app to use it.

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

## Commands and settings

- `/enable-reels` turns Reel Scroll on for the current chat and asks for the one-time instagram.com approval right then.
- `/disable-reels` turns it off for the current chat.
- `/reels` opens the demo-reels panel.
- **Where it runs** (plugin setting): `auto` (default) runs in every chat. `chat` runs only in chats where you ran `/enable-reels`.

## Not running in a chat?

- Run `/enable-reels` in that chat. It also grants the Instagram approval.
- **Install for every session:** when asked for a scope, pick **user**. Project or local scope only works in that one project.
- **Chats already open don't pick it up.** Start a new chat, or run `/reload-plugins`.
- **Approve Instagram once.** The built-in browser asks before a chat may use instagram.com. Reel Scroll requests it for you; choose "allow for this site" so new chats don't ask again.
- **Update:** `claude plugin update reel-scroll`, then `/reload-plugins`.
- The Claude desktop app has to be open and online, because the reels play in its built-in browser.

Not affiliated with Instagram or Meta.
