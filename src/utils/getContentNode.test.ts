import { afterEach, describe, expect, it, vi } from "vitest";

import { getContentNode } from "./getContentNode";

describe("getContentNode", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("returns the result of the optional-content callback when provided", () => {
        const node = document.createElement("div");
        const result = getContentNode({ optionalContent: () => node });
        expect(result).toBe(node);
    });

    it("returns `contentRef.current` when no optional content is given", () => {
        const node = document.createElement("div");
        const result = getContentNode({ contentRef: { current: node } });
        expect(result).toBe(node);
    });

    it("prefers optional content over contentRef, and warns about the conflict", () => {
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
        const optionalNode = document.createElement("section");
        const refNode = document.createElement("div");

        const result = getContentNode({
            contentRef: { current: refNode },
            optionalContent: () => optionalNode,
        });

        expect(result).toBe(optionalNode);
        expect(warnSpy).toHaveBeenCalled();
    });

    it("returns undefined and logs an error when neither source is provided", () => {
        const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
        const result = getContentNode({});
        expect(result).toBeUndefined();
        expect(errorSpy).toHaveBeenCalled();
    });
});
