import * as React from 'react';

import { ComponentToPrint } from "../ComponentToPrint";
import { CUSTOM_FONTS } from "../fonts";
import { useReactToPrint } from "../../src/hooks/useReactToPrint";

export const DynamicDocumentTitle = () => {
  const componentRef = React.useRef<HTMLDivElement>(null);

  const handleAfterPrint = React.useCallback(() => {
    console.log("`onAfterPrint` called");
  }, []);

  const handleBeforePrint = React.useCallback(() => {
    console.log("`onBeforePrint` called");
    return Promise.resolve();
  }, []);

  const printFn = useReactToPrint({
    contentRef: componentRef,
    documentTitle: () => {
      const now = new Date();
      const timestamp = now.toISOString().replace(/[:.]/g, '-');
      return `PrintedDocument_${timestamp}`;
    },
    fonts: CUSTOM_FONTS,
    onAfterPrint: handleAfterPrint,
    onBeforePrint: handleBeforePrint,
  }); 

  return (
    <div>
      <button onClick={printFn}>Print with Dynamic Timestamp</button>
      <ComponentToPrint ref={componentRef} />
    </div>
  );
};
