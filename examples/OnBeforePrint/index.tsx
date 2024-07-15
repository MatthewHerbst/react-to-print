import * as React from 'react';

import { ComponentToPrint } from "../ComponentToPrint";
import { CUSTOM_FONTS } from "../fonts";
import { useReactToPrint } from "../../src/hooks/useReactToPrint";

/**
 * Print while specifying the `onBeforePrint` option
 */
export const OnBeforePrint = () => {
  const componentRef = React.useRef(null);

  const onBeforePrintResolve = React.useRef<(() => void) | null>(null);

  const [loading, setLoading] = React.useState(false);
  const [text, setText] = React.useState("Some cool text from the parent");

  const handleOnAfterPrint = React.useCallback(() => {
    console.log("`onAfterPrint` called"); // tslint:disable-line no-console
  }, []);

  const handleOnBeforePrint = React.useCallback(() => {
    console.log("`onBeforePrint` called"); // tslint:disable-line no-console
    setLoading(true);
    setText("Loading new text...");

    return new Promise<void>((resolve) => {
      // Recall that setting state is async, so we need to save the promise resolve and only call
      // it in the `useEffect` once we've verified the state update has been applied
      onBeforePrintResolve.current = resolve;

      setTimeout(() => {
        setLoading(false);
        setText("New, Updated Text!");
        resolve();
      }, 2000);
    });
  }, [setLoading, setText]);

  React.useEffect(() => {
    if (text === "New, Updated Text!" && typeof onBeforePrintResolve.current === "function") {
      console.log("State update applied, resolving the promise for `onBeforePrint`"); // tslint:disable-line no-console
      onBeforePrintResolve.current();
    }
  }, [onBeforePrintResolve.current, text]);

  const printFn = useReactToPrint({
    contentRef: componentRef,
    documentTitle: "AwesomeFileName",
    fonts: CUSTOM_FONTS,
    onAfterPrint: handleOnAfterPrint,
    onBeforePrint: handleOnBeforePrint,
  }); 

  const handleOnClick = React.useCallback(() => {
    printFn();
  }, [printFn]);

  return (
    <div>
      <button onClick={handleOnClick}>Print</button>
      {loading && <p className="indicator">onBeforePrint: Loading...</p>}
      <ComponentToPrint ref={componentRef} text={text} />
    </div>
  );
};
