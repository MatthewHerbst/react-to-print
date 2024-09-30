import * as React from 'react';

import { ComponentToPrint } from "../ComponentToPrint";
import { CUSTOM_FONTS } from "../fonts";
import { useReactToPrint } from "../../src/hooks/useReactToPrint";

/**
 * A basic printing example printing a component
 */
export const BasicComponent = () => {
  const componentRef = React.useRef(null);

  const handleAfterPrint = React.useCallback(() => {
    console.log("`onAfterPrint` called"); // tslint:disable-line no-console
  }, []);

  const handleBeforePrint = React.useCallback(() => {
    console.log("`onBeforePrint` called"); // tslint:disable-line no-console
    return Promise.resolve();
  }, []);

  const printFn = useReactToPrint({
    contentRef: componentRef,
    documentTitle: "AwesomeFileName",
    fonts: CUSTOM_FONTS,
    onAfterPrint: handleAfterPrint,
    onBeforePrint: handleBeforePrint,
  }); 

  return (
    <div>
      {/* @ts-expect-error Works without lazy content wrapping */}
      <button onClick={printFn}>Print</button>
      <ComponentToPrint ref={componentRef} />
    </div>
  );
};
