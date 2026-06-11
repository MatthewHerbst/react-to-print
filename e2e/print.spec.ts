import { expect, test } from "@playwright/test";

/**
 * Real-browser smoke tests for the core print flow. We override the iframe's `print()` so the
 * native dialog never blocks the test, then assert on the observable side effects: the print
 * iframe is created with the cloned content and copied global styles, the document title is
 * applied during printing, and `onAfterPrint` fires.
 */

test.beforeEach(async ({ page }) => {
    // Stub `window.print` on every frame (including the print iframe) so the dialog never opens.
    // We record each call so the test can assert that printing was actually triggered.
    await page.addInitScript(() => {
        (window as unknown as { __printCalls: number }).__printCalls = 0;
        window.print = () => {
            (window as unknown as { __printCalls: number }).__printCalls += 1;
        };
    });

    await page.goto("/");
    await expect(page.locator("#printable")).toContainText("Printable heading");
});

test("creates a print iframe containing the cloned content", async ({ page }) => {
    await page.locator("#print-button").click();

    const printIframe = page.locator("#printWindow");
    await expect(printIframe).toBeAttached();

    // The cloned content should be present inside the print iframe's document
    const frame = page.frameLocator("#printWindow");
    await expect(frame.locator("h1")).toContainText("Printable heading");
    await expect(frame.locator("p")).toContainText("Some printable content");
});

test("copies global <style> rules into the print iframe", async ({ page }) => {
    await page.locator("#print-button").click();

    const frame = page.frameLocator("#printWindow");
    const color = await frame.locator("#printable").evaluate((el) =>
        getComputedStyle(el).color,
    );

    // `.printable { color: rgb(10, 20, 30) }` is a global style that must be copied
    expect(color).toBe("rgb(10, 20, 30)");
});

test("invokes print and then fires onAfterPrint", async ({ page }) => {
    await page.locator("#print-button").click();

    // onAfterPrint increments the counter once printing completes
    await expect(page.locator("#after-print-count")).toHaveAttribute("data-count", "1");

    // The print iframe is removed after printing by default
    await expect(page.locator("#printWindow")).toHaveCount(0);
});

test("applies the documentTitle during printing", async ({ page }) => {
    // The init script runs in every frame, including the print iframe (same-origin via srcdoc).
    // The library sets the owner (top) document's title right before calling the iframe's print(),
    // then restores it afterwards - so the override records the top title at the moment of print.
    await page.addInitScript(() => {
        window.print = () => {
            const top = window.top as (Window & { __titleAtPrint?: string }) | null;
            if (top) {
                top.__titleAtPrint = top.document.title;
            }
        };
    });

    await page.goto("/");
    const originalTitle = await page.title();

    await page.locator("#print-button").click();
    await expect(page.locator("#printWindow")).toHaveCount(0);

    const titleAtPrint = await page.evaluate(
        () => (window as unknown as { __titleAtPrint?: string }).__titleAtPrint,
    );

    // The overridden title was active during printing...
    expect(titleAtPrint).toBe("e2e-document-title");
    // ...and was restored on the parent document afterwards
    expect(await page.title()).toBe(originalTitle);
});
