import { startPrint } from "./startPrint";
import type { UseReactToPrintOptions } from "../types/UseReactToPrintOptions";

/**
 * Begins the printing process. Ensures proper calling of `onBeforePrint` when specified before
 * handing off to the main printing function. 
 */
export function handleOnBeforePrint(
    printWindow: HTMLIFrameElement,
    options: UseReactToPrintOptions,
) {
    const {
        onBeforePrint,
        onPrintError,
    } = options;

    if (onBeforePrint) {
        onBeforePrint()
            .then(() => {
                startPrint(printWindow, options);
            })
            .catch((error: Error) => {
                onPrintError?.("onBeforePrint", error);
            });
    } else {
        startPrint(printWindow, options);
    }
}