/** Shared config for The Social Sofa companion extension. */
export const APP_URL = "https://netflixclone-pearl-eight.vercel.app";

/** Optional local override while developing the Next.js app. */
export const LOCAL_APP_URL = "http://localhost:3000";

/**
 * Premium entitlement hook (v1 is free for everyone).
 * Later: check Supabase Auth session + subscription status here.
 */
export async function getEntitlements() {
  return {
    plan: "free",
    maxPartySize: 4,
    isPremium: false,
  };
}
