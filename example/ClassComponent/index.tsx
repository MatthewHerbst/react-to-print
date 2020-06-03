import * as React from "react";

import { ComponentToPrint } from "../ComponentToPrint";
import ReactToPrint from "../../src/index";

export class ClassComponent extends React.PureComponent<{}, { isLoading: boolean, text: string }> {
  componentRef: ComponentToPrint | null = null;

  constructor(props: Readonly<{}>) {
    super(props);

    this.state = {
      isLoading: false,
      text: "old boring text",
    };
  }

  handleAfterPrint = () => {
    console.log("`onAfterPrint` called"); // tslint:disable-line no-console
  }

  handleBeforePrint = () => {
    console.log("`onBeforePrint` called"); // tslint:disable-line no-console
  }

  handleOnBeforeGetContent = () => {
    console.log("`onBeforeGetContent` called"); // tslint:disable-line no-console
    this.setState({ text: "Loading new text...", isLoading: true });

    return new Promise((resolve: any) => {
      setTimeout(() => {
        this.setState({ text: "New, Updated Text!", isLoading: false }, resolve);
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
    // NOTE: could just as easily return <SomeComponent />. Do NOT pass an `onClick` prop
    // to the root node of the returned component as it will be overwritten.

    // Bad: the `onClick` here will be overwritten by `react-to-print`
    // return <a href="#" onClick={() => alert('This will not work')}>Print this out!</a>;

    // Good
    return <a href="#">Print using a Class Component</a>;
  }

  render() {
    return (
      <div>
        <ReactToPrint
          content={this.reactToPrintContent}
          documentTitle="AwesomeFileName"
          onAfterPrint={this.handleAfterPrint}
          onBeforeGetContent={this.handleOnBeforeGetContent}
          onBeforePrint={this.handleBeforePrint}
          removeAfterPrint
          trigger={this.reactToPrintTrigger}
        />
        {this.state.isLoading && <p className="indicator">Loading...</p>}
        <ComponentToPrint ref={this.setComponentRef} text={this.state.text} />
      </div>
    );
  }
}
