import { describe, expect, it } from "vitest";

import { DEFAULT_PRINT_WINDOW_ID } from "../consts";
import { generatePrintWindow } from "./generatePrintWindow";

describe("generatePrintWindow", () => {
    it("creates an absolutely-positioned, off-screen iframe with the expected id and DOCTYPE", () => {
        const iframe = generatePrintWindow(undefined);

        expect(iframe.tagName).toBe("IFRAME");
        expect(iframe.id).toBe(DEFAULT_PRINT_WINDOW_ID);
        expect(iframe.style.position).toBe("absolute");
        expect(iframe.srcdoc).toBe("<!DOCTYPE html>");
        // Off-screen, so it never flashes on the page
        expect(iframe.style.top.startsWith("-")).toBe(true);
        expect(iframe.style.left.startsWith("-")).toBe(true);
    });

    it("defaults width/height to the document's client size", () => {
        const iframe = generatePrintWindow(undefined);
        expect(iframe.width).toBe(`${document.documentElement.clientWidth}px`);
        expect(iframe.height).toBe(`${document.documentElement.clientHeight}px`);
    });

    it("applies security-related iframe props", () => {
        const iframe = generatePrintWindow({
            allow: "fullscreen",
            referrerPolicy: "no-referrer",
            sandbox: "allow-same-origin",
        });
        expect(iframe.allow).toBe("fullscreen");
        expect(iframe.referrerPolicy).toBe("no-referrer");
        expect(String(iframe.sandbox)).toContain("allow-same-origin");
    });

    it("ignores an empty `allow` value", () => {
        // "" is not a meaningful `allow` value, so it should be left unset
        const iframe = generatePrintWindow({ allow: "" });
        expect(iframe.allow).toBeFalsy();
    });
});
