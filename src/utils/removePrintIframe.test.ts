import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { DEFAULT_PRINT_WINDOW_ID } from "../consts";
import { removePrintIframe } from "./removePrintIframe";

function addPrintIframe(): HTMLIFrameElement {
    const iframe = document.createElement("iframe");
    iframe.id = DEFAULT_PRINT_WINDOW_ID;
    document.body.appendChild(iframe);
    return iframe;
}

describe("removePrintIframe", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
    });

    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("removes the print iframe when preserveAfterPrint is falsy", () => {
        addPrintIframe();
        removePrintIframe(false);
        expect(document.getElementById(DEFAULT_PRINT_WINDOW_ID)).toBeNull();
    });

    it("keeps the print iframe when preserveAfterPrint is true", () => {
        addPrintIframe();
        removePrintIframe(true);
        expect(document.getElementById(DEFAULT_PRINT_WINDOW_ID)).not.toBeNull();
    });

    it("removes the print iframe when force is true even if preserveAfterPrint is true", () => {
        addPrintIframe();
        removePrintIframe(true, true);
        expect(document.getElementById(DEFAULT_PRINT_WINDOW_ID)).toBeNull();
    });

    it("is a no-op when there is no print iframe", () => {
        expect(() => { removePrintIframe(false); }).not.toThrow();
    });
});
