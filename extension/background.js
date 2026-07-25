const APP_ORIGIN = "https://netflixclone-pearl-eight.vercel.app";
const LOCAL_ORIGIN = "http://localhost:3000";

function isSocialSofaUrl(url) {
  if (!url) return false;
  try {
    const u = new URL(url);
    return (
      u.origin === APP_ORIGIN ||
      u.origin === LOCAL_ORIGIN ||
      u.hostname === "localhost"
    );
  } catch {
    return false;
  }
}

function parseWatchRoom(url) {
  try {
    const u = new URL(url);
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

async function rememberRoomFromTab(tabId, url) {
  if (!isSocialSofaUrl(url)) return;
  const room = parseWatchRoom(url);
  if (!room) return;
  await chrome.storage.local.set({
    lastRoom: {
      roomId: room.roomId,
      inviteUrl: room.inviteUrl,
      origin: room.origin,
      savedAt: Date.now(),
    },
  });
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    rememberRoomFromTab(tabId, changeInfo.url);
  } else if (changeInfo.status === "complete" && tab.url) {
    rememberRoomFromTab(tabId, tab.url);
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    appUrl: APP_ORIGIN,
    // Future: authToken, premiumExpiresAt
  });
});
