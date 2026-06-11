import { describe, expect, it, vi } from "vitest";

import { cloneShadowRoots } from "./clone";

/**
 * `cloneShadowRoots` walks the descendants of the nodes it is given (the TreeWalker starts at the
 * first child), so shadow hosts must be nested inside the passed root - mirroring real usage where
 * the root is the print container and hosts live within it. These helpers build that shape.
 */
function makeSourceWithShadowHost(shadowInnerHTML: string): {
    root: HTMLDivElement;
    host: HTMLDivElement;
} {
    const root = document.createElement("div");
    const host = document.createElement("div");
    root.appendChild(host);
    host.attachShadow({ mode: "open" }).innerHTML = shadowInnerHTML;
    return { root, host };
}

/** A structural clone of the source root - which does NOT carry shadow roots, as in real usage. */
function makeTargetClone(sourceRoot: HTMLElement): HTMLElement {
    return sourceRoot.cloneNode(true) as HTMLElement;
}

describe("cloneShadowRoots", () => {
    it("copies shadow root content from source to target", () => {
        const { root } = makeSourceWithShadowHost("<span>shadow content</span>");
        const target = makeTargetClone(root);

        cloneShadowRoots(root, target, false);

        const copiedHost = target.querySelector("div");
        expect(copiedHost?.shadowRoot).not.toBeNull();
        expect(copiedHost?.shadowRoot?.innerHTML).toContain("shadow content");
    });

    it("recursively copies nested shadow roots", () => {
        const root = document.createElement("div");
        const outerHost = document.createElement("div");
        root.appendChild(outerHost);
        const outerShadow = outerHost.attachShadow({ mode: "open" });
        const innerHost = document.createElement("div");
        outerShadow.appendChild(innerHost);
        innerHost.attachShadow({ mode: "open" }).innerHTML = "<p>deeply nested</p>";

        const target = makeTargetClone(root);

        cloneShadowRoots(root, target, false);

        const copiedOuterHost = target.querySelector("div");
        const copiedInnerHost = copiedOuterHost?.shadowRoot?.querySelector("div");
        expect(copiedInnerHost?.shadowRoot?.innerHTML).toContain("deeply nested");
    });

    it("logs and bails out when source/target structures diverge", () => {
        const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

        const { root } = makeSourceWithShadowHost("<span>content</span>");
        const target = makeTargetClone(root);
        // Make the structures diverge after cloning so element counts differ
        root.appendChild(document.createElement("p"));

        cloneShadowRoots(root, target, false);

        expect(errorSpy).toHaveBeenCalled();
        const copiedHost = target.querySelector("div");
        expect(copiedHost?.shadowRoot ?? null).toBeNull();

        errorSpy.mockRestore();
    });
});
