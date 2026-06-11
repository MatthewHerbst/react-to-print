import { StrictMode, useRef, useState } from "react";
import { createRoot } from "react-dom/client";

// Import directly from source so the e2e tests exercise the real library code
import { useReactToPrint } from "../../src";

function App() {
    const contentRef = useRef<HTMLDivElement>(null);
    const [afterPrintCount, setAfterPrintCount] = useState(0);

    const handlePrint = useReactToPrint({
        contentRef,
        documentTitle: "e2e-document-title",
        onAfterPrint: () => {
            setAfterPrintCount((count) => count + 1);
        },
    });

    return (
        <div>
            <button id="print-button" onClick={() => handlePrint()}>
                Print
            </button>
            <div id="after-print-count" data-count={afterPrintCount}>
                {afterPrintCount}
            </div>
            <div ref={contentRef} className="printable" id="printable">
                <h1>Printable heading</h1>
                <p>Some printable content</p>
            </div>
        </div>
    );
}

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
