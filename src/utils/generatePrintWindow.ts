import { DEFAULT_PRINT_WINDOW_ID } from "../consts";
import { UseReactToPrintOptions } from "../types/UseReactToPrintOptions";

export function generatePrintWindow(printIframeProps: UseReactToPrintOptions["printIframeProps"]): HTMLIFrameElement {
    const printWindow = document.createElement("iframe");
    printWindow.width = `${document.documentElement.clientWidth}px`;
    printWindow.height = `${document.documentElement.clientHeight}px`;
    printWindow.style.position = "absolute";
    printWindow.style.top = `-${document.documentElement.clientHeight + 100}px`;
    printWindow.style.left = `-${document.documentElement.clientWidth + 100}px`;
    printWindow.id = DEFAULT_PRINT_WINDOW_ID;
    // Ensure we set a DOCTYPE on the iframe's document
    // https://github.com/MatthewHerbst/react-to-print/issues/459
    printWindow.srcdoc = "<!DOCTYPE html>";
    
    // Assign user supplied iframe props
    if (printIframeProps) {
        if (printIframeProps.allow) { // "" is not a meaningful `allow` value
            printWindow.allow = printIframeProps.allow;
        }

        if (printIframeProps.referrerPolicy !== undefined) { // Ensure "" is valid, which applies the browser's default referrer policy
            printWindow.referrerPolicy = printIframeProps.referrerPolicy;
        }

        if (printIframeProps.sandbox !== undefined) { // Ensure "" is valid, which applies all sandbox rules
            printWindow.sandbox = printIframeProps.sandbox;
        }
    }

    return printWindow;
}