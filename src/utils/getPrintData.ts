import type { UseReactToPrintHookContent } from "../types/UseReactToPrintHookContent";
import type { UseReactToPrintOptions } from "../types/UseReactToPrintOptions";
import { getContentNode } from "./getContentNode";
import type { HandlePrintWindowOnLoadData } from "./handlePrintWindowOnLoad";

/** Returns `undefined` if there is nothing to print */
export function getPrintData(
    optionalContent: UseReactToPrintHookContent | undefined,
    options: UseReactToPrintOptions,
): HandlePrintWindowOnLoadData | undefined {
    const {
        contentRef,
        fonts,
        ignoreGlobalStyles,
        suppressErrors,
    } = options;

    const contentNode = getContentNode({
        contentRef,
        optionalContent,
        suppressErrors,
    });

    if (!contentNode) {
        return;
    }

    // NOTE: `canvas` elements do not have their painted images copied
    // https://developer.mozilla.org/en-US/docs/Web/API/Node/cloneNode
    const clonedContentNode = contentNode.cloneNode(true);

    const globalLinkNodes = document.querySelectorAll("link[rel~='stylesheet'], link[as='style']");
    const clonedImgNodes = (clonedContentNode as Element).querySelectorAll("img");
    const clonedVideoNodes = (clonedContentNode as Element).querySelectorAll("video");

    const numFonts = fonts ? fonts.length : 0;

    const numResourcesToLoad =
        (ignoreGlobalStyles ? 0 : globalLinkNodes.length) +
        clonedImgNodes.length +
        clonedVideoNodes.length +
        numFonts;

    return {
        contentNode,
        clonedContentNode,
        clonedImgNodes,
        clonedVideoNodes,
        numResourcesToLoad,
        originalCanvasNodes: (contentNode as Element).querySelectorAll("canvas")
    };
}