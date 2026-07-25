# The Social Sofa — Browser Extension

Companion extension for [The Social Sofa](https://netflixclone-pearl-eight.vercel.app/). Works on **Chrome** and **Firefox** (Manifest V3). Mobile users should install the **web app (PWA)** from the site instead.

## What it does

- **Watch this together** — when you're on a YouTube video tab, one click starts a party with that video
- **Start Watch Party** — opens a new synced room (demo video)
- **Browse movies** — opens the catalog
- **Go** — paste an invite link, room ID, *or YouTube URL* to join/start
- **Last room** — reopen or copy the invite
- **This tab** — when you're already in a room, copy that invite

v1 is free for everyone. `config.js` has a `getEntitlements()` hook for a future Premium plan.

### YouTube (first-time flow)

1. Open any YouTube video in Chrome/Firefox
2. Click the Social Sofa toolbar icon
3. Click **Watch this together**
4. Copy the invite link from the room and send it to friends
5. Friends open the link — everyone watches that YouTube video in sync

## Load in Chrome (local test)

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. **Load unpacked** → select this `extension` folder
4. Pin the toolbar icon and try Start / Join / Copy

After edits, click the refresh icon on the extension card.

## Load in Firefox (local test)

1. Open `about:debugging#/runtime/this-firefox`
2. **Load Temporary Add-on…**
3. Select `manifest.json` inside this folder

Temporary add-ons are removed when Firefox restarts.

## Smoke checklist

- [ ] Popup opens with no errors
- [ ] Start Watch Party opens a `/watch/...` room on production (or localhost if you're on it)
- [ ] Invite link copies and opens the same room in another profile/browser
- [ ] Playback stays in sync between two viewers
- [ ] Chat still works when the room was opened from the extension

## Config

Edit `config.js` / `background.js` if your deploy URL changes. Default production URL:

`https://netflixclone-pearl-eight.vercel.app`

If the active tab is `http://localhost:3000`, the popup prefers localhost automatically.

## Package for the stores (later)

```bash
# from repo root
cd extension
zip -r ../social-sofa-extension.zip . -x "*.DS_Store" -x "README.md"
```

Upload the zip to the [Chrome Web Store](https://chrome.google.com/webstore/devconsole) ($5 one-time) and [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/).

## Mobile

There is no Chrome extension on iOS/Android. Users open the site and use **Add to Home Screen** (PWA).
