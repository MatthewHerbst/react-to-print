import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { getPrintData } from "./getPrintData";
import type { UseReactToPrintOptions } from "../types/UseReactToPrintOptions";

function makeContent(html: string): HTMLDivElement {
    const node = document.createElement("div");
    node.innerHTML = html;
    return node;
}

describe("getPrintData", () => {
    beforeEach(() => {
        document.head.innerHTML = "";
    });

    afterEach(() => {
        document.head.innerHTML = "";
    });

    it("returns undefined when there is no content node", () => {
        const result = getPrintData(undefined, {} as UseReactToPrintOptions);
        expect(result).toBeUndefined();
    });

    it("clones the content node rather than returning the original", () => {
        const node = makeContent("<p>hello</p>");
        const result = getPrintData(undefined, { contentRef: { current: node } });
        expect(result).toBeDefined();
        expect(result!.contentNode).toBe(node);
        expect(result!.clonedContentNode).not.toBe(node);
        expect((result!.clonedContentNode as Element).querySelector("p")?.textContent).toBe("hello");
    });

    it("counts img and video nodes as resources to load", () => {
        const node = makeContent("<img src='a.png' /><img src='b.png' /><video></video>");
        const result = getPrintData(undefined, { contentRef: { current: node } });
        expect(result!.clonedImgNodes.length).toBe(2);
        expect(result!.clonedVideoNodes.length).toBe(1);
        // 2 imgs + 1 video, no global link nodes, no fonts
        expect(result!.numResourcesToLoad).toBe(3);
    });

    it("includes global stylesheet links in the resource count by default", () => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://example.com/styles.css";
        document.head.appendChild(link);

        const node = makeContent("<p>hi</p>");
        const result = getPrintData(undefined, { contentRef: { current: node } });
        expect(result!.numResourcesToLoad).toBe(1);
    });

    it("excludes global styles from the count when ignoreGlobalStyles is set", () => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://example.com/styles.css";
        document.head.appendChild(link);

        const node = makeContent("<p>hi</p>");
        const result = getPrintData(undefined, {
            contentRef: { current: node },
            ignoreGlobalStyles: true,
        });
        expect(result!.numResourcesToLoad).toBe(0);
    });

    it("counts fonts as resources", () => {
        const node = makeContent("<p>hi</p>");
        const result = getPrintData(undefined, {
            contentRef: { current: node },
            fonts: [
                { family: "A", source: "url(a.woff2)" },
                { family: "B", source: "url(b.woff2)" },
            ],
        });
        expect(result!.numResourcesToLoad).toBe(2);
    });
});
