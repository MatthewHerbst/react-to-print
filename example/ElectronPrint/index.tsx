import * as React from "react";

import {ComponentToPrint} from "../ComponentToPrint";
import ReactToPrint from "../../src/index";

// TODO: Should ideally be declared somewhere else, not
//  sure what the best practice for this is, though
declare global {
  interface Window {
    electron: {
      printSilently: () => Promise<void | string>;
    }
  }
}

export class ElectronPrint extends React.PureComponent<{}> {
  componentRef: ComponentToPrint | null = null;

  constructor(props: Readonly<{}>) {
    super(props);
  }

  setComponentRef = (ref: ComponentToPrint) => {
    this.componentRef = ref;
  }

  reactToPrintContent = () => {
    return this.componentRef;
  }

  reactToPrintTrigger = () => {
    return <a href="#">Print silently if running Electron (WILL PRINT WITH DEFAULT PRINTER WITHOUT DIALOG)</a>;
  }

  printWithElectron = (target: HTMLIFrameElement) => {
    // Create a new Electron window (opening the current url in the new window to allow relative sources to work)
    let printWindow = window.open(window.location.href, 'silent-print-content')!;

    // Write the iframe contents into its body
    printWindow.document.body = target.contentWindow!.document.body;

    // Call the Electron print function from the electron preloader, from
    // the new window and close that window after the printing is done
    return printWindow.electron.printSilently().catch((failReason: string) => {
      // TODO: Add the print callback as an error location for the error
      //  handler so that this alert can be put in the actual onPrintError
      alert('Something went wrong while printing: ' + failReason);
      // throw new Error(failReason);
    }).finally(() => printWindow.close());
  }

  printErrorHandler = (_errorLocation: string, error : Error) => {
    // TODO: Handle errors in the print callback here, instead of inside that callback
    alert('Something went wrong while printing: ' + error.message);
  }

  render() {
    return (
      <div>
        <ReactToPrint
          content={this.reactToPrintContent}
          // Only pass print callback if window electron api is available
          print={typeof window.electron !== "undefined" ? this.printWithElectron : undefined}
          onPrintError={this.printErrorHandler}
          removeAfterPrint
          trigger={this.reactToPrintTrigger}
        />
        <ComponentToPrint ref={this.setComponentRef} text={"This prints automatically and silently"}/>
      </div>
    );
  }
}
