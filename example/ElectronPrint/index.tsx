import * as React from "react";

import {ComponentToPrint} from "../ComponentToPrint";
import ReactToPrint from "../../src/index";

export class ElectronPrint extends React.PureComponent<{}, { isLoading: boolean, text: string }> {
  componentRef: ComponentToPrint | null = null;

  constructor(props: Readonly<{}>) {
    super(props);

    this.state = {
      isLoading: false,
      text: "old boring text",
    };
  }

  handleOnBeforeGetContent = () => {
    console.log("`onBeforeGetContent` called"); // tslint:disable-line no-console
    this.setState({text: "Loading new text...", isLoading: true});

    return new Promise((resolve: any) => {
      setTimeout(() => {
        this.setState({text: "New, Updated Text!", isLoading: false}, resolve);
      }, 2000);
    });
  };

  setComponentRef = (ref: ComponentToPrint) => {
    this.componentRef = ref;
  }

  reactToPrintContent = () => {
    return this.componentRef;
  }

  reactToPrintTrigger = () => {
    return <a href="#">Print (silently) using Electron printing (WILL PRINT WITHOUT CONFIRMATION WITH DEFAULT PRINTER)</a>;
  }

  printWithElectron = (target: HTMLIFrameElement) => {
    // TODO: window.electron.printSilently() is not declared
    //  in TS because it is set by the Electron preloader
    // @ts-ignore
    return target.contentWindow.electron.printSilently();
  };

  render() {
    return (
      <div>
        <ReactToPrint
          content={this.reactToPrintContent}
          print={this.printWithElectron}
          onBeforeGetContent={this.handleOnBeforeGetContent}
          trigger={this.reactToPrintTrigger}
        />
        {this.state.isLoading && <p className="indicator">Loading...</p>}
        <ComponentToPrint ref={this.setComponentRef} text={this.state.text}/>
      </div>
    );
  }
}
