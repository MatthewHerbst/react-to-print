import { useCallback } from "react";

import { Font } from "../types/Font";
import type { UseReactToPrintOptions } from "../types/UseReactToPrintOptions";
import { getContentNode } from "../utils/getContentNode";
import { generatePrintWindow } from "../utils/generatePrintWindow";
import { logMessages } from "../utils/logMessage";
import { UseReactToPrintHookContent } from "../types/UseReactToPrintHookContent";
import { HandlePrintWindowOnLoadData } from "../utils/handlePrintWindowOnLoad";
import { removePrintIframe } from "../utils/removePrintIframe";
import { UseReactToPrintFn } from "../types/UseReactToPrintFn";
import { appendPrintWindow } from "../utils/appendPrintWindow";
import { startPrint } from "../utils/startPrint";

export function useReactToPrint(options: UseReactToPrintOptions): UseReactToPrintFn {
    const {
        contentRef,
        fonts,
        ignoreGlobalStyles,
        onBeforePrint,
        onPrintError,
        preserveAfterPrint,
        suppressErrors,
    } = options;

    const handlePrint = useCallback((optionalContent?: UseReactToPrintHookContent) => {
        // Ensure we remove any pre-existing print windows before adding a new one
        removePrintIframe(preserveAfterPrint, true);

        const contentNode = getContentNode({
            contentRef,
            optionalContent,
            suppressErrors,
        });

        if (!contentNode) {
            logMessages({
                messages: ['There is nothing to print'],
                suppressErrors,
            });
            return;
        }

        if (!contentNode) {
            logMessages({
                messages: ['"react-to-print" could not locate the DOM node corresponding with the `content` prop'],
                suppressErrors,
            });
            return;
        }

        // React components can return a bare string as a valid JSX response
        const clonedContentNode = contentNode.cloneNode(true);

        const globalLinkNodes = document.querySelectorAll("link[rel~='stylesheet'], link[as='style']");
        const renderComponentImgNodes = (clonedContentNode as Element).querySelectorAll("img");
        const renderComponentVideoNodes = (clonedContentNode as Element).querySelectorAll("video");

        const numFonts = fonts ? fonts.length : 0;

        const numResourcesToLoad =
            (ignoreGlobalStyles ? 0 : globalLinkNodes.length) +
            renderComponentImgNodes.length +
            renderComponentVideoNodes.length +
            numFonts;
        const resourcesLoaded: (Element | Font | FontFace)[] = [];
        const resourcesErrored: (Element | Font | FontFace)[] = [];

        const printWindow = generatePrintWindow();

        /**
         * Keeps track of loaded resources, kicking off the actual print function once all 
         * resources have been marked (loaded or failed)
         */
        const markLoaded = (resource: Element | Font | FontFace, errorMessages?: unknown[]) => {
            if (resourcesLoaded.includes(resource)) {
                logMessages({
                    level: "debug",
                    messages: ["Tried to mark a resource that has already been handled", resource],
                    suppressErrors,
                });
                return;
            }

            if (!errorMessages) {
                resourcesLoaded.push(resource);
            } else {
                logMessages({
                    messages: [
                        '"react-to-print" was unable to load a resource but will continue attempting to print the page',
                        ...errorMessages
                    ],
                    suppressErrors,
                });
                resourcesErrored.push(resource);
            }

            // We may have errors, but attempt to print anyways - maybe they are trivial and the
            // user will be ok ignoring them
            const numResourcesManaged = resourcesLoaded.length + resourcesErrored.length;

            if (numResourcesManaged === numResourcesToLoad) {
                startPrint(printWindow, options);
            }
        };

        const data: HandlePrintWindowOnLoadData = {
            clonedContentNode,
            contentNode,
            numResourcesToLoad,
            renderComponentImgNodes,
            renderComponentVideoNodes,
        }

        // Ensure we run `onBeforePrint` before appending the print window, which kicks off loading
        // needed resources once mounted
        if (onBeforePrint) {
            onBeforePrint()
                .then(() => appendPrintWindow(printWindow, markLoaded, data, options))
                .catch((error: Error) => {
                    onPrintError?.("onBeforePrint", error);
                });
        } else {
            appendPrintWindow(printWindow, markLoaded, data, options);
        }
    }, [options]);

    return handlePrint;
}