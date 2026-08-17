import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/systems",
  "/systems/project-wifi",
  "/lab",
  "/signals",
  "/field-notes",
  "/about",
] as const;

test.describe("mobile layout", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });

  test("main routes do not create document-level horizontal overflow", async ({ page }) => {
    for (const route of routes) {
      await test.step(route, async () => {
        const response = await page.goto(route);
        expect(response?.ok(), `${route} should return a successful response`).toBeTruthy();
        await expect(page.getByRole("main")).toBeVisible();
        await page.evaluate(() => document.fonts.ready);

        const layout = await page.evaluate(() => {
          const root = document.documentElement;
          const overflowers = Array.from(document.querySelectorAll<HTMLElement>("body *"))
            .map((element) => {
              const rect = element.getBoundingClientRect();
              return {
                element: `${element.tagName.toLowerCase()}.${String(element.className)
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .join(".")}`,
                left: Math.round(rect.left),
                right: Math.round(rect.right),
              };
            })
            .filter(({ left, right }) => left < -1 || right > window.innerWidth + 1)
            .slice(0, 8);

          return {
            clientWidth: root.clientWidth,
            scrollWidth: root.scrollWidth,
            overflowers,
          };
        });

        expect(
          layout.scrollWidth,
          `${route} overflowed ${layout.clientWidth}px viewport: ${JSON.stringify(layout.overflowers)}`,
        ).toBeLessThanOrEqual(layout.clientWidth + 1);
      });
    }
  });

  test("mobile navigation exposes every primary destination", async ({ page }) => {
    await page.goto("/");
    const menu = page.getByRole("button", { name: "Menu" });
    await menu.click();

    const navigation = page.getByRole("navigation", { name: "Mobile navigation" });
    await expect(navigation).toBeVisible();
    for (const label of ["Systems", "Lab", "Signals", "Field Notes", "About"]) {
      await expect(navigation.getByRole("link", { name: new RegExp(label) })).toBeVisible();
    }
  });

  test("mobile X-Ray disclosure is named and does not shift document flow", async ({ page }) => {
    await page.goto("/");
    const before = await page.evaluate(() => document.documentElement.scrollHeight);
    const toggle = page.getByRole("button", { name: /X-Ray mode off/i });

    await toggle.click();
    await expect(page.getByRole("button", { name: /X-Ray mode on/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    const tag = page.locator('[data-inspect-id="hero-system"] .inspection-tag');
    await expect(tag).toBeVisible();
    await tag.focus();
    await expect(tag).toContainText("exec:client");

    const after = await page.evaluate(() => document.documentElement.scrollHeight);
    expect(after).toBe(before);
  });
});
