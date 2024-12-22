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

            if (print) {
                print(printWindow)
                    .then(() => {
                        onAfterPrint?.();
                        removePrintIframe(preserveAfterPrint);
                    })
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
				 * Remove the print iframe after the print dialog closes. This is determined by the
                 * main window regaining focus after the print dialog closes. This workaround is
                 * used due to the unreliability and variation of behavior of the `afterprint`
                 * event in most browsers. For example, some browsers will fire the `afterprint`
                 * event immediately after opening the print dialog.
				 */
				window.addEventListener(
					"focus",
					() => {
						onAfterPrint?.();
						removePrintIframe(preserveAfterPrint);
					},
					{ once: true } // Clean up the listener after is it invoked
				);
            }
        } else {
            logMessages({
                messages: ["Printing failed because the `contentWindow` of the print iframe did not load. This is possibly an error with `react-to-print`. Please file an issue: https://github.com/MatthewHerbst/react-to-print/issues/"],
                suppressErrors,
            });
        }
    }, 500);
}