import * as React from 'react';

import { ComponentToPrint } from "../ComponentToPrint";
import { CUSTOM_FONTS } from "../fonts";
import { useReactToPrint } from "../../src/hooks/useReactToPrint";

/**
 * A basic example showing how to pass a custom `print` function 
 */
export const CustomPrint = () => {
  const componentRef = React.useRef(null);

  const printFn = useReactToPrint({
    contentRef: componentRef,
    documentTitle: "AwesomeFileName",
    fonts: CUSTOM_FONTS,
    print: (iframe) => {
      return new Promise<void>((resolve) => {
          console.log("Custom printing, 1.5 second mock delay...");
          setTimeout(() => {
              console.log("Mock custom print of iframe complete", iframe);
              resolve();
          }, 1500);
      });
    },
  }); 

  return (
    <div>
      <h3>See console for output: print window will not open</h3>
      <button onClick={printFn}>Print</button>
      <ComponentToPrint ref={componentRef} />
    </div>
  );
};
