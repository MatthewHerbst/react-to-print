import { Font } from "../types/font";
import { UseReactToPrintOptions } from "../types/UseReactToPrintOptions";
import { handlePrintWindowOnLoad, HandlePrintWindowOnLoadData } from "./handlePrintWindowOnLoad";

export function appendPrintWindow(
    /** The print iframe */
    printWindow: HTMLIFrameElement,
    markLoaded: (resource: Element | Font | FontFace, errorMessages?: unknown[]) => void,
    data: HandlePrintWindowOnLoadData,
    options: UseReactToPrintOptions,
) {
    printWindow.onload = () => handlePrintWindowOnLoad(
        printWindow,
        markLoaded,
        data,
        options
    );

    document.body.appendChild(printWindow);
}
