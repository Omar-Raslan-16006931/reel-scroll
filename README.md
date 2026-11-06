<h1 align="center">Reel Scroll</h1>
<p align="center"><b>Productive scrolling.</b><br>Your Instagram Reels unlock only while Claude is thinking, and lock the moment the answer lands.</p>

<p align="center">
  <a href="media/reel-scroll-promo.mp4"><img src="media/preview.gif" alt="Reel Scroll promo" width="300"></a><br>
  <a href="media/reel-scroll-promo.mp4"><b>▶ Watch the 44-second video (with sound)</b></a>
</p>

## How it works

1. You send Claude a message. Instagram Reels open in the Claude app's built-in browser, with a **"Claude is thinking"** timer.
2. Claude finishes. The video pauses, mutes and a **lock screen** shows how long you scrolled.
3. Your next message unlocks it again.

Sign-in pages are never locked, so logging in always works.

---

## Pick your version

| You use | Get |
|---|---|
| **Claude Chat** (the normal chat) | [Chat skills](#-claude-chat) |
| **Claude Code** or **Cowork** | [Plugin](#-claude-code--cowork) |

---

## 💬 Claude Chat

Two skills: `/enable-reels` turns it on for the chat you are in, `/disable-reels` turns it off.

<p align="center">
  <a href="https://github.com/Omar-Raslan-16006931/reel-scroll/raw/main/downloads/enable-reels.zip"><img src="https://img.shields.io/badge/%E2%AC%87%20%20DOWNLOAD%20%20enable--reels-ff6a1a?style=for-the-badge&labelColor=0c0a09" alt="Download enable-reels" height="56"></a>
  <br><br>
  <a href="https://github.com/Omar-Raslan-16006931/reel-scroll/raw/main/downloads/disable-reels.zip"><img src="https://img.shields.io/badge/%E2%AC%87%20%20DOWNLOAD%20%20disable--reels-57534e?style=for-the-badge&labelColor=0c0a09" alt="Download disable-reels" height="56"></a>
</p>

**Install (do it once for each file):**

1. Click a download button above.
2. In the Claude app go to **Customize → Skills → Upload skill**.
3. Pick the zip you downloaded.

**Use it:**

1. Open the Claude desktop app's built-in browser and sign in to Instagram once.
2. In any chat, type `/enable-reels`.
3. Ask Claude anything. Reels unlock while it works.

---

## 🧑‍💻 Claude Code / Cowork

<p align="center">
  <a href="#install-the-plugin"><img src="https://img.shields.io/badge/%E2%AC%87%20%20INSTALL%20%20THE%20PLUGIN-ff6a1a?style=for-the-badge&labelColor=0c0a09" alt="Install the plugin" height="56"></a>
</p>

### Install the plugin

In the Claude desktop app click **+** next to the prompt box, then **Plugins**, **Add marketplace**, type `Omar-Raslan-16006931/reel-scroll`, then **Add plugin**.

Or in a terminal:

```
claude plugin install reel-scroll --marketplace Omar-Raslan-16006931/reel-scroll
```

Choose the **user** scope so it works in every session, then start a new chat.

**Commands:** `/reels-on` and `/reels-off` for the current chat. In plugin settings, set **Where Reel Scroll runs** to `auto` (every chat) or `chat` (only after `/reels-on`).

---

## Troubleshooting

- **Nothing happens:** the Claude desktop app must be open. The reels play in its built-in browser.
- **It asks about instagram.com:** choose "allow for this site", once.
- **New chat, still nothing:** chats opened before you installed don't pick it up. Start a new one.
- **Using claude.ai in Chrome?** There is also a [Chrome extension](claude-ai-extension/README.md).

Not affiliated with Instagram, Meta or Anthropic.
