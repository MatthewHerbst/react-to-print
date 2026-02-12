import { UseReactToPrintOptions } from "../types/UseReactToPrintOptions";
import { handlePrintWindowOnLoad, HandlePrintWindowOnLoadData } from "./handlePrintWindowOnLoad";

export function appendPrintWindow(
    printWindow: HTMLIFrameElement,
    data: HandlePrintWindowOnLoadData,
    options: UseReactToPrintOptions,
) {
    printWindow.onload = () => {
        handlePrintWindowOnLoad(
            printWindow,
            data,
            options
        );
    };

    document.body.appendChild(printWindow);
}
