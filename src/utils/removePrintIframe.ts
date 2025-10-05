import { DEFAULT_PRINT_WINDOW_ID } from "../consts";
import type { UseReactToPrintOptions } from "../types/UseReactToPrintOptions";

export function removePrintIframe(preserveAfterPrint: UseReactToPrintOptions["preserveAfterPrint"], force?: boolean) {
    if (force || !preserveAfterPrint) {
        const documentPrintWindow = document.getElementById(DEFAULT_PRINT_WINDOW_ID);
        
        if (documentPrintWindow) {
            document.body.removeChild(documentPrintWindow);
        }
    }
}