export function generatePrintWindow(): HTMLIFrameElement {
    const printWindow = document.createElement("iframe");
    printWindow.width = `${document.documentElement.clientWidth}px`;
    printWindow.height = `${document.documentElement.clientHeight}px`;
    printWindow.style.position = "absolute";
    printWindow.style.top = `-${document.documentElement.clientHeight + 100}px`;
    printWindow.style.left = `-${document.documentElement.clientWidth + 100}px`;
    printWindow.id = "printWindow";
    // Ensure we set a DOCTYPE on the iframe's document
    // https://github.com/MatthewHerbst/react-to-print/issues/459
    printWindow.srcdoc = "<!DOCTYPE html>";

    return printWindow;
}