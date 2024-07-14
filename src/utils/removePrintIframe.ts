import type { UseReactToPrintOptions } from "../types/UseReactToPrintOptions";

export function removePrintIframe(preserveAfterPrint: UseReactToPrintOptions["preserveAfterPrint"], force?: boolean) {
    if (force || !preserveAfterPrint) {
        const documentPrintWindow = document.getElementById("printWindow");
        
        if (documentPrintWindow) {
            document.body.removeChild(documentPrintWindow);
        }
    }
}