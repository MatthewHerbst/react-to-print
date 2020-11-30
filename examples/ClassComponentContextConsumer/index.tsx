import * as React from "react";

import { ComponentToPrint } from "../ComponentToPrint";
import ReactToPrint, { PrintContextConsumer } from "../../src/index";

type Props = Record<string, unknown>;
type State = {
  isLoading: boolean;
  text: string;
};

export class ClassComponentContextConsumer extends React.PureComponent<Props, State> {
  componentRef: ComponentToPrint | null = null;

  constructor(props: Props) {
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
        >
          <PrintContextConsumer>
            {({ handlePrint }) => (
              <button onClick={handlePrint}>
                Print using a Class Component with PrintContextConsumer
              </button>
            )}
          </PrintContextConsumer>
        </ReactToPrint>
        {this.state.isLoading && <p className="indicator">onBeforeGetContent: Loading...</p>}
        <ComponentToPrint ref={this.setComponentRef} text={this.state.text} />
      </div>
    );
  }
}
