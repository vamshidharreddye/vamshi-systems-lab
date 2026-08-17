import { expect, test } from "@playwright/test";

const mainRoutes = [
  { path: "/", heading: /I build systems that connect models/i },
  { path: "/systems", heading: /Not projects in boxes/i },
  { path: "/systems/project-wifi", heading: /^Project WiFi$/i },
  { path: "/lab", heading: /Systems become clearer/i },
  { path: "/signals", heading: /^Signals$/i },
  { path: "/field-notes", heading: /^Field Notes$/i },
  { path: "/about", heading: /I build systems to understand how they behave/i },
] as const;

test.describe("primary routes", () => {
  for (const route of mainRoutes) {
    test(`${route.path} renders its primary experience`, async ({ page }) => {
      const response = await page.goto(route.path);

      expect(response?.ok(), `${route.path} should return a successful response`).toBeTruthy();
      await expect(page.getByRole("main")).toBeVisible();
      await expect(page.getByRole("heading", { level: 1, name: route.heading })).toBeVisible();
      await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
    });
  }

  test("a static MDX field note renders", async ({ page }) => {
    const response = await page.goto("/field-notes/why-sse-for-a-local-presence-dashboard");

    expect(response?.ok()).toBeTruthy();
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Why I used SSE for a local presence dashboard",
      }),
    ).toBeVisible();
    await expect(page.getByRole("article")).toBeVisible();
  });
});

test.describe("persistent environment", () => {
  test("command palette opens from the keyboard and navigates", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("ControlOrMeta+KeyK");

    const palette = page.getByRole("dialog", { name: "Command palette" });
    const search = page.getByRole("textbox", { name: "Search commands" });
    await expect(palette).toBeVisible();
    await expect(search).toBeFocused();

    await search.fill("open lab");
    await expect(page.getByRole("option", { name: /Open Lab/ })).toBeVisible();
    await page.keyboard.press("Enter");

    await expect(page).toHaveURL(/\/lab$/);
    await expect(page.getByRole("heading", { level: 1, name: /Systems become clearer/i })).toBeVisible();
    await expect(palette).toBeHidden();
  });

  test("X-Ray mode reveals metadata and persists across a reload", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: /X-Ray/ });

    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("html")).toHaveAttribute("data-xray", "on");
    await expect(
      page.locator('[data-inspect-id="hero-system"] .inspection-tag'),
    ).toContainText("HeroSystem");

    await page.reload();
    await expect(page.getByRole("button", { name: /X-Ray/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(page.locator("html")).toHaveAttribute("data-xray", "on");

    await page.getByRole("button", { name: /X-Ray/ }).click();
    await expect(page.locator(".inspection-tag")).toHaveCount(0);
    await expect(page.locator("html")).toHaveAttribute("data-xray", "off");
  });
});

test.describe("Project WiFi architecture", () => {
  test("command deep-link starts a presence event", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("ControlOrMeta+KeyK");
    await page.getByRole("textbox", { name: "Search commands" }).fill("simulate presence");
    await page.keyboard.press("Enter");

    await expect(page).toHaveURL(/\/systems\/project-wifi\?run=presence/);
    const inspector = page.getByRole("complementary", {
      name: "Project WiFi event inspector",
    });
    await expect(inspector.getByText("people_detected", { exact: true })).toBeVisible();
  });

  test("runs an eight-stage presence trace and supports stage inspection", async ({ page }) => {
    await page.goto("/systems/project-wifi#simulation");

    const stageIds = await page.locator("[data-stage]").evaluateAll((elements) => [
      ...new Set(elements.map((element) => element.getAttribute("data-stage"))),
    ]);
    expect(stageIds).toEqual([
      "echo",
      "routine",
      "skill",
      "lambda",
      "ngrok",
      "webhook",
      "sse",
      "react",
    ]);

    const inspector = page.getByRole("complementary", {
      name: "Project WiFi event inspector",
    });
    await page.getByRole("button", { name: "Simulate presence" }).click();
    await page.getByRole("button", { name: "Pause" }).click();
    await expect(page.getByRole("button", { name: "Resume" })).toBeEnabled();

    const step = page.getByRole("button", { name: "Step stage" });
    for (let index = 0; index < 8 && (await step.isEnabled()); index += 1) {
      await step.click();
    }

    await expect(inspector.getByText("PRESENCE DETECTED", { exact: true })).toBeVisible();
    await expect(inspector.getByText("8/8 stages", { exact: true })).toBeVisible();
    await expect(inspector.getByText("people_detected", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: /Local webhook receiver/ }).click();
    await expect(inspector.getByRole("heading", { name: "Webhook" })).toBeVisible();

    await page.getByRole("button", { name: "Reset" }).click();
    await expect(inspector.getByText("AWAITING EVENT", { exact: true })).toBeVisible();
  });

  test("reduced-motion users receive a fast stepped simulation", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/systems/project-wifi#simulation");

    await expect
      .poll(() => page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches))
      .toBe(true);

    await page.getByRole("button", { name: "Simulate presence" }).click();
    const inspector = page.getByRole("complementary", {
      name: "Project WiFi event inspector",
    });
    await expect(inspector.getByText("PRESENCE DETECTED", { exact: true })).toBeVisible();
    await expect(inspector.getByText("8/8 stages", { exact: true })).toBeVisible();
  });
});
