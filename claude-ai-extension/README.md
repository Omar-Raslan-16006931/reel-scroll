# Reel Scroll for claude.ai (Chrome extension)

Reel Scroll for plain claude.ai chat. Your Instagram Reels unlock only while Claude is generating a reply, and lock the moment it finishes.

## Install (2 minutes)

1. Open `chrome://extensions` in Chrome.
2. Turn on **Developer mode** (top right).
3. Click **Load unpacked** and pick this `claude-ai-extension` folder.
4. Open Instagram once in Chrome and sign in.
5. Go to claude.ai and send a message.

When Claude starts answering, a phone-sized Reels window opens beside your chat with a "Claude is thinking" pill. When the answer lands it locks, shows how long you scrolled, and brings you back to your chat.

Click the extension's icon to turn it off or stop it switching windows.

## Notes

- Works on claude.ai in Chrome. The Claude desktop app's Chat tab can't load extensions.
- It watches for claude.ai's "Stop response" button to know when Claude is generating. If claude.ai changes that button, update the selectors at the top of `claude.js`.
- Not affiliated with Instagram, Meta or Anthropic.
