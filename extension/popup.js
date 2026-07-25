import { APP_URL, LOCAL_APP_URL, getEntitlements } from "./config.js";

const APP_ORIGINS = new Set([
  new URL(APP_URL).origin,
  new URL(LOCAL_APP_URL).origin,
]);

const DEFAULT_VIDEO =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

const els = {
  youtubeSection: document.getElementById("youtube-section"),
  youtubeHint: document.getElementById("youtube-hint"),
  youtubeBtn: document.getElementById("btn-youtube"),
  start: document.getElementById("btn-start"),
  browse: document.getElementById("btn-browse"),
  joinInput: document.getElementById("join-input"),
  join: document.getElementById("btn-join"),
  joinError: document.getElementById("join-error"),
  lastSection: document.getElementById("last-room-section"),
  lastRoomId: document.getElementById("last-room-id"),
  reopen: document.getElementById("btn-reopen"),
  copy: document.getElementById("btn-copy"),
  copyStatus: document.getElementById("copy-status"),
  activeSection: document.getElementById("active-tab-section"),
  activeHint: document.getElementById("active-tab-hint"),
  copyActive: document.getElementById("btn-copy-active"),
  planBadge: document.getElementById("plan-badge"),
  openApp: document.getElementById("open-app"),
};

let appBase = APP_URL;
let lastRoom = null;
let activeInviteUrl = null;
let youtubeVideoId = null;

function showError(message) {
  els.joinError.hidden = !message;
  els.joinError.textContent = message || "";
}

function showCopyStatus(message) {
  els.copyStatus.hidden = !message;
  els.copyStatus.textContent = message || "";
  if (message) {
    setTimeout(() => showCopyStatus(""), 1800);
  }
}

/** Extract YouTube video ID from URL or bare ID. */
function parseYouTubeVideoId(input) {
  const value = (input || "").trim();
  if (!value) return null;
  if (/^[\w-]{11}$/.test(value)) return value;

  try {
    const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    const u = new URL(withProtocol);
    const host = u.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id && /^[\w-]{11}$/.test(id) ? id : null;
    }

    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "music.youtube.com"
    ) {
      const v = u.searchParams.get("v");
      if (v && /^[\w-]{11}$/.test(v)) return v;
      const pathMatch = u.pathname.match(/^\/(embed|shorts|live)\/([\w-]{11})/);
      if (pathMatch) return pathMatch[2];
    }
  } catch {
    return null;
  }
  return null;
}

function partyUrlForYouTube(videoId) {
  return `${appBase}/watch/new?v=${encodeURIComponent(videoId)}`;
}

async function getPreferredAppBase() {
  const { appUrl } = await chrome.storage.local.get("appUrl");
  if (appUrl) return appUrl.replace(/\/$/, "");

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.url) {
    try {
      const origin = new URL(tab.url).origin;
      if (origin === new URL(LOCAL_APP_URL).origin) return LOCAL_APP_URL;
    } catch {
      /* ignore */
    }
  }
  return APP_URL;
}

function parseWatchRoom(url) {
  try {
    const u = new URL(url);
    if (!APP_ORIGINS.has(u.origin) && u.hostname !== "localhost") return null;
    const match = u.pathname.match(/^\/watch\/([^/]+)/);
    if (!match || match[1] === "new") return null;
    return {
      roomId: match[1],
      inviteUrl: url.split("#")[0],
      origin: u.origin,
    };
  } catch {
    return null;
  }
}

/**
 * Resolve pasted text to a Social Sofa URL.
 * Supports invite links, room IDs, and YouTube links (starts a new party).
 */
function resolveGoTarget(raw) {
  const value = raw.trim();
  if (!value) return null;

  const yt = parseYouTubeVideoId(value);
  if (yt) return partyUrlForYouTube(yt);

  if (/^https?:\/\//i.test(value)) {
    try {
      const u = new URL(value);
      const match = u.pathname.match(/^\/watch\/([^/]+)/);
      if (match && match[1] !== "new") return value.split("#")[0];
      return null;
    } catch {
      return null;
    }
  }

  if (/^[a-zA-Z0-9_-]{8,}$/.test(value)) {
    return `${appBase}/watch/${value}`;
  }
  return null;
}

async function openUrl(url) {
  await chrome.tabs.create({ url });
  window.close();
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

function renderLastRoom() {
  if (!lastRoom?.inviteUrl) {
    els.lastSection.hidden = true;
    return;
  }
  els.lastSection.hidden = false;
  els.lastRoomId.textContent = lastRoom.roomId;
}

async function init() {
  appBase = await getPreferredAppBase();
  els.openApp.href = appBase;

  const entitlements = await getEntitlements();
  els.planBadge.textContent = entitlements.isPremium ? "Premium" : "Free";

  const stored = await chrome.storage.local.get("lastRoom");
  lastRoom = stored.lastRoom || null;
  renderLastRoom();

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const tabUrl = tab?.url || "";

  const activeRoom = tabUrl ? parseWatchRoom(tabUrl) : null;
  if (activeRoom) {
    activeInviteUrl = activeRoom.inviteUrl;
    els.activeSection.hidden = false;
    els.activeHint.textContent = `You're in room ${activeRoom.roomId}`;
    lastRoom = {
      roomId: activeRoom.roomId,
      inviteUrl: activeRoom.inviteUrl,
      origin: activeRoom.origin,
      savedAt: Date.now(),
    };
    await chrome.storage.local.set({ lastRoom });
    renderLastRoom();
  }

  youtubeVideoId = parseYouTubeVideoId(tabUrl);
  if (youtubeVideoId && !activeRoom) {
    els.youtubeSection.hidden = false;
    els.youtubeHint.textContent = `Video ${youtubeVideoId} — start a party and invite friends`;
  }
}

els.youtubeBtn.addEventListener("click", () => {
  if (!youtubeVideoId) return;
  openUrl(partyUrlForYouTube(youtubeVideoId));
});

els.start.addEventListener("click", () => {
  openUrl(`${appBase}/watch/new?u=${encodeURIComponent(DEFAULT_VIDEO)}`);
});

els.browse.addEventListener("click", () => {
  openUrl(appBase);
});

els.join.addEventListener("click", () => {
  const target = resolveGoTarget(els.joinInput.value);
  if (!target) {
    showError("Paste an invite link, room ID, or YouTube URL.");
    return;
  }
  showError("");
  openUrl(target);
});

els.joinInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") els.join.click();
});

els.reopen.addEventListener("click", () => {
  if (lastRoom?.inviteUrl) openUrl(lastRoom.inviteUrl);
});

els.copy.addEventListener("click", async () => {
  if (!lastRoom?.inviteUrl) return;
  const ok = await copyText(lastRoom.inviteUrl);
  showCopyStatus(ok ? "Invite link copied" : "Could not copy");
});

els.copyActive.addEventListener("click", async () => {
  if (!activeInviteUrl) return;
  const ok = await copyText(activeInviteUrl);
  showCopyStatus(ok ? "Invite link copied" : "Could not copy");
});

init();
