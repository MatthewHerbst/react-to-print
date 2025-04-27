import { useCallback } from "react";

import type { UseReactToPrintOptions } from "../types/UseReactToPrintOptions";
import { generatePrintWindow } from "../utils/generatePrintWindow";
import { logMessages } from "../utils/logMessage";
import { UseReactToPrintHookContent } from "../types/UseReactToPrintHookContent";
import { removePrintIframe } from "../utils/removePrintIframe";
import { UseReactToPrintFn } from "../types/UseReactToPrintFn";
import { appendPrintWindow } from "../utils/appendPrintWindow";
import { getErrorFromUnknown } from "../utils/getErrorMessage";
import { getPrintData } from "../utils/getPrintData";
import { getMarkedLoaded } from "../utils/getMarkedLoaded";

export function useReactToPrint({
    bodyClass,
    contentRef,
    copyShadowRoots,
    documentTitle,
    fonts,
    ignoreGlobalStyles,
    nonce,
    onAfterPrint,
    onBeforePrint,
    onPrintError,
    pageStyle,
    preserveAfterPrint,
    print,
    suppressErrors,
}: UseReactToPrintOptions): UseReactToPrintFn {
    const handlePrint = useCallback((optionalContent?: UseReactToPrintHookContent) => {
        // Ensure we remove any pre-existing print windows before adding a new one
        removePrintIframe(preserveAfterPrint, true);

        function beginPrint() {
            const options: UseReactToPrintOptions = {
                bodyClass,
                contentRef,
                copyShadowRoots,
                documentTitle,
                fonts,
                ignoreGlobalStyles,
                nonce,
                onAfterPrint,
                onBeforePrint,
                onPrintError,
                pageStyle,
                preserveAfterPrint,
                print,
                suppressErrors,
            };
            
            const printWindow = generatePrintWindow();
            const data = getPrintData(optionalContent, options);

            if (!data) {
                logMessages({
                    messages: ['There is nothing to print'],
                    suppressErrors,
                });
                return;
            }

            const markLoaded = getMarkedLoaded(options, data.numResourcesToLoad, printWindow);
            appendPrintWindow(printWindow, markLoaded, data, options);
        }

        // Ensure we run `onBeforePrint` before appending the print window, which kicks off loading
        // needed resources once mounted
        // TODO: At this point we should remove `onBeforePrint` completely and just have consumers
        // call the print function when they are ready. 
        if (onBeforePrint) {
            onBeforePrint()
                .then(() => {
                    beginPrint();
                })
                .catch((error: unknown) => {
                    onPrintError?.("onBeforePrint", getErrorFromUnknown(error));
                });
        } else {
            beginPrint();
        }
    }, [
        bodyClass,
        contentRef,
        copyShadowRoots,
        documentTitle,
        fonts,
        ignoreGlobalStyles,
        nonce,
        onAfterPrint,
        onBeforePrint,
        onPrintError,
        pageStyle,
        preserveAfterPrint,
        print,
        suppressErrors,
    ]);

    return handlePrint;
}
