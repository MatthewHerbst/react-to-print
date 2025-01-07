import { logMessages } from "./logMessage";
import { removePrintIframe } from "./removePrintIframe";
import type { UseReactToPrintOptions } from "../types/UseReactToPrintOptions";
import { getErrorFromUnknown } from "./getErrorMessage";

/**
 * Starts the main printing process. This includes determining if we are running the default
 * printing process or using a custom `print` function, handling updating the print windows's title
 * if a `documentTitle` is set, calling `onAfterPrint`, and removing the print iframe based on the
 * value of `preserveAfterPrint`.
 */
export function startPrint(printWindow: HTMLIFrameElement, options: UseReactToPrintOptions) {
    const {
        documentTitle,
        onAfterPrint,
        onPrintError,
        preserveAfterPrint,
        print,
        suppressErrors,
    } = options;

    // Some browsers such as Safari don't always behave well without this timeout
    setTimeout(() => {
        if (printWindow.contentWindow) {
            printWindow.contentWindow.focus(); // Needed for IE 11

            function handleAfterPrint() {
                onAfterPrint?.()
                removePrintIframe(preserveAfterPrint)
            }

            if (print) {
                print(printWindow)
                    .then(handleAfterPrint)
                    .catch((error: unknown) => {
                        if (onPrintError) {
                            onPrintError('print', getErrorFromUnknown(error));
                        } else {
                            logMessages({
                                messages: ["An error was thrown by the specified `print` function"],
                                suppressErrors,
                            });
                        }
                    });
            } else {
                // Some browsers do not have a `.print` available, even though they should
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                if (printWindow.contentWindow.print) {
                    const tempContentDocumentTitle = printWindow.contentDocument?.title ?? '';
                    const tempOwnerDocumentTitle = printWindow.ownerDocument.title;

                    // Override page and various target content titles during print
                    // NOTE: some browsers seem to take the print title from the highest level
                    // title, while others take it from the lowest level title. So, we set the title
                    // in a few places and hope the current browser takes one of them :pray:
                    if (documentTitle) {
                        // Print filename in Chrome
                        printWindow.ownerDocument.title = documentTitle;

                        // Print filename in Firefox, Safari
                        if (printWindow.contentDocument) {
                            printWindow.contentDocument.title = documentTitle;
                        }
                    }

                    printWindow.contentWindow.print();

                    // Restore the page's original title information
                    if (documentTitle) {
                        printWindow.ownerDocument.title = tempOwnerDocumentTitle;

                        if (printWindow.contentDocument) {
                            printWindow.contentDocument.title = tempContentDocumentTitle;
                        }
                    }
                } else {
                    // Some browsers, such as Firefox Android, do not support printing at all
                    // https://developer.mozilla.org/en-US/docs/Web/API/Window/print
                    logMessages({
                        messages: ["Printing for this browser is not currently possible: the browser does not have a `print` method available for iframes."],
                        suppressErrors,
                    });
                }

                /**
                 * This workaround is implemented to prevent a bug on mobile browsers where `handleAfterPrint` 
                 * is called immediately, even before the print dialog opens. This issue is described in #187.
                 *
                 * On mobile devices, a delay is introduced using `setTimeout` to ensure the dialog has time to open.
                 * 
                 * @see [Stack Overflow Reference](https://stackoverflow.com/q/77215077/4899926)
                 */
                if (isMobileBrowser()) {
                    setTimeout(handleAfterPrint, 500)
                } else {
                    handleAfterPrint()
                }
            }
        } else {
            logMessages({
                messages: ["Printing failed because the `contentWindow` of the print iframe did not load. This is possibly an error with `react-to-print`. Please file an issue: https://github.com/MatthewHerbst/react-to-print/issues/"],
                suppressErrors,
            });
        }
    }, 500);
}

/**
 * Determines if the current browser is a mobile browser by checking the `navigator.userAgent` 
 * against a predefined list of common mobile browser identifiers.
 * 
 * Note: This function is not exhaustive and may not detect all mobile browsers, 
 * as it is designed to remain simple and lightweight.
 * 
 * @see [Stack Overflow Reference](https://stackoverflow.com/a/11381730/4899926)
 */
function isMobileBrowser() {
    const toMatch = [
        /Android/i,
        /webOS/i,
        /iPhone/i,
        /iPad/i,
        /iPod/i,
        /BlackBerry/i,
        /Windows Phone/i
    ];

    return toMatch.some(toMatchItem => {
        return (
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            navigator.userAgent ??

            // Retained for compatibility with browsers that use `navigator.vendor` to identify the browser.
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            navigator.vendor ??

            // Retained for compatibility with older versions of Opera that use `window.opera`.
            ('opera' in window && window.opera)
        ).match(toMatchItem)
    })
}
