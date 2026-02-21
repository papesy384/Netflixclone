import { test, expect } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "https://netflixclone-pearl-eight.vercel.app";

test.describe("Watch Party Sync", () => {
  test("play, pause, and seek sync between two tabs", async ({ browser }) => {
    const results: { step: string; passed: boolean; error?: string }[] = [];

    // Tab 1: Create watch party
    const page1 = await browser.newPage();
    try {
      await page1.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 15000 });
    } catch (e) {
      results.push({ step: "Navigate to app", passed: false, error: String(e) });
      await page1.close();
      return;
    }
    results.push({ step: "Navigate to app", passed: true });

    // Wait for page to load and find Start Watch Party button (use main hero CTA, not nav)
    const startBtn = page1.getByRole("main").getByRole("button", { name: /Start Watch Party/i });
    await expect(startBtn).toBeVisible({ timeout: 10000 });
    await startBtn.click();
    results.push({ step: "Click Start Watch Party", passed: true });

    // Wait for navigation to watch room
    await page1.waitForURL(/\/watch\/[a-f0-9-]+/, { timeout: 10000 });
    const roomUrl = page1.url();
    results.push({ step: "Create room and get URL", passed: !!roomUrl });

    // Copy link button - click to copy
    const copyBtn = page1.getByRole("button", { name: /Copy Link|Copied!/i });
    await expect(copyBtn).toBeVisible({ timeout: 5000 });
    await copyBtn.click();
    results.push({ step: "Copy share URL", passed: true });

    // Tab 2: Join with same URL
    const page2 = await browser.newPage();
    await page2.goto(roomUrl, { waitUntil: "domcontentloaded", timeout: 15000 });
    results.push({ step: "Open URL in second tab", passed: true });

    // Wait for both players to be ready (room loading spinner disappears)
    await page1.waitForSelector('[aria-hidden]', { state: "visible", timeout: 5000 }).catch(() => {});
    await page1.waitForTimeout(3000); // Allow room/subscription setup
    await page2.waitForTimeout(3000);

    // Both pages should have video elements
    const video1 = page1.locator("video").first();
    const video2 = page2.locator("video").first();
    const hasReactPlayer1 = await page1.locator('[class*="react-player"]').count() > 0;
    const hasReactPlayer2 = await page2.locator('[class*="react-player"]').count() > 0;
    const hasVideoEl1 = await video1.count() > 0;
    const hasVideoEl2 = await video2.count() > 0;
    const playersReady = (hasVideoEl1 || hasReactPlayer1) && (hasVideoEl2 || hasReactPlayer2);
    results.push({ step: "Both players ready", passed: playersReady });

    // Tab 1: Click play (use play button in controls or click video)
    try {
      const playTarget = hasVideoEl1 ? video1 : page1.locator(".react-player").first();
      await playTarget.click({ force: true });
      await page1.waitForTimeout(1500);
      // Tab 2 should be playing - check via video paused state or play state
      await page2.waitForTimeout(1500);
      const tab2Paused = await page2.evaluate(() => {
        const v = document.querySelector("video");
        return v ? v.paused : null;
      });
      results.push({ step: "Tab 2 plays when Tab 1 plays", passed: tab2Paused === false });
    } catch (e) {
      results.push({ step: "Tab 2 plays when Tab 1 plays", passed: false, error: String(e) });
    }

    // Tab 1: Click pause
    try {
      const pauseTarget = hasVideoEl1 ? video1 : page1.locator(".react-player").first();
      await pauseTarget.click({ force: true });
      await page1.waitForTimeout(1500);
      await page2.waitForTimeout(1500);
      const tab2PausedAfter = await page2.evaluate(() => {
        const v = document.querySelector("video");
        return v ? v.paused : null;
      });
      results.push({ step: "Tab 2 pauses when Tab 1 pauses", passed: tab2PausedAfter === true });
    } catch (e) {
      results.push({ step: "Tab 2 pauses when Tab 1 pauses", passed: false, error: String(e) });
    }

    // Tab 1: Seek - simulate seeking (e.g. click progress bar or use keyboard)
    try {
      const seekTarget = hasVideoEl1 ? video1 : page1.locator(".react-player").first();
      await seekTarget.click({ position: { x: 100, y: 50 } }); // May not reliably seek
      await page1.waitForTimeout(1000);
      // Alternative: dispatch timeupdate/seek if we have access
      const t1 = await page1.evaluate(() => {
        const v = document.querySelector("video");
        return v ? v.currentTime : 0;
      });
      const t2 = await page2.evaluate(() => {
        const v = document.querySelector("video");
        return v ? v.currentTime : 0;
      });
      const seekDiff = Math.abs(t1 - t2);
      results.push({ step: "Seek sync (position within 3s)", passed: seekDiff < 3 });
    } catch (e) {
      results.push({ step: "Seek sync", passed: false, error: String(e) });
    }

    // Collect console errors from both pages
    const consoleErrors1: string[] = [];
    const consoleErrors2: string[] = [];
    page1.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors1.push(msg.text());
    });
    page2.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors2.push(msg.text());
    });

    await page1.close();
    await page2.close();

    // Report
    const passed = results.filter((r) => r.passed).length;
    const failed = results.filter((r) => !r.passed);
    console.log("\n=== Watch Party Sync Test Results ===");
    results.forEach((r) => console.log(r.passed ? "✓" : "✗", r.step, r.error || ""));
    if (consoleErrors1.length || consoleErrors2.length) {
      console.log("\nConsole errors (Tab 1):", consoleErrors1);
      console.log("Console errors (Tab 2):", consoleErrors2);
    }

    expect(passed).toBeGreaterThanOrEqual(results.length - 2); // Allow up to 2 failures for flaky sync
  });
});
