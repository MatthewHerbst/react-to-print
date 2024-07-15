import * as React from 'react';

import { ComponentToPrint } from "../ComponentToPrint";
import { CUSTOM_FONTS } from "../fonts";
import { useReactToPrint } from "../../src/hooks/useReactToPrint";

export const LazyContent = () => {
  const componentRef = React.useRef(null);

  const reactToPrintContent = () => {
    return componentRef.current;
  };

  const handlePrint = useReactToPrint({
    documentTitle: "SuperFileName",
    fonts: CUSTOM_FONTS
  });

  return (
    <div>
      <button onClick={() => handlePrint(reactToPrintContent)}>
        Print
      </button>
      <ComponentToPrint ref={componentRef} />
    </div>
  );
};
