import { test, expect } from "@playwright/test";

test.describe("TempoSketch", () => {
  test("loads the app and displays main elements", async ({ page }) => {
    await page.goto("/");

    // Check title and description
    await expect(page.locator("h1")).toContainText("TempoSketch");
    await expect(page.locator("text=Draw → Chords → Melody")).toBeVisible();

    // Check canvas is present
    const canvas = page.locator("canvas");
    await expect(canvas).toBeVisible();

    // Check control buttons are present
    await expect(page.locator("button", { hasText: "Clear" })).toBeVisible();
    await expect(page.locator("button", { hasText: "Arc" })).toBeVisible();
    await expect(page.locator("button", { hasText: "Play" })).toBeVisible();
    await expect(page.locator("button", { hasText: "Export MIDI" })).toBeVisible();
  });

  test("demo arc → play → stop flow", async ({ page }) => {
    // Listen for console errors
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto("/");

    // Click Arc demo button
    await page.locator("button", { hasText: "Arc" }).click();

    // Wait a bit for the curve to be drawn
    await page.waitForTimeout(500);

    // Click Play button
    await page.locator("button", { hasText: "Play" }).click();

    // Wait for playback to start
    await page.waitForTimeout(1000);

    // Click Stop button
    await page.locator("button", { hasText: "Stop" }).click();

    // Check no console errors occurred
    expect(consoleErrors).toHaveLength(0);
  });

  test("export MIDI creates download", async ({ page }) => {
    await page.goto("/");

    // Load demo curve
    await page.locator("button", { hasText: "Wave" }).click();
    await page.waitForTimeout(500);

    // Set up download listener
    const downloadPromise = page.waitForEvent("download");

    // Click Export MIDI
    await page.locator("button", { hasText: "Export MIDI" }).click();

    // Wait for download
    const download = await downloadPromise;

    // Check filename
    expect(download.suggestedFilename()).toBe("temposketch.mid");
  });

  test("changing key and mode updates display", async ({ page }) => {
    await page.goto("/");

    // Load demo curve
    await page.locator("button", { hasText: "Arc" }).click();
    await page.waitForTimeout(300);

    // Check initial key/mode display
    await expect(page.locator("text=/Key: C Ionian/")).toBeVisible();

    // Change key to G
    await page.locator('button[id="key"]').click();
    await page.locator('div[role="option"]', { hasText: "G" }).click();

    // Check updated display
    await expect(page.locator("text=/Key: G/")).toBeVisible();

    // Change mode to Aeolian
    await page.locator('button[id="mode"]').click();
    await page.locator('div[role="option"]', { hasText: "Aeolian" }).click();

    // Check updated display
    await expect(page.locator("text=/Aeolian/")).toBeVisible();
  });

  test("clear button removes drawn curve", async ({ page }) => {
    await page.goto("/");

    // Load demo curve
    await page.locator("button", { hasText: "Zigzag" }).click();
    await page.waitForTimeout(300);

    // Play button should be enabled
    await expect(page.locator("button", { hasText: "Play" })).toBeEnabled();

    // Click Clear
    await page.locator("button", { hasText: "Clear" }).click();
    await page.waitForTimeout(100);

    // Play button should be disabled (no curve)
    await expect(page.locator("button", { hasText: "Play" })).toBeDisabled();
  });
});
