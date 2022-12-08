import * as React from "react";

import ReactToPrint from "../../src/index";
import { CUSTOM_FONTS } from "../fonts";

type Props = Record<string, unknown>;
type State = {
  isLoading: boolean;
  text: string;
};

class TextComponent extends React.PureComponent {
  render() {
    return 'This is bare text';
  }
}

export class ClassComponentText extends React.PureComponent<Props, State> {
  componentRef: TextComponent | null = null;

  constructor(props: Props) {
    super(props);

    this.state = {
      isLoading: false,
      text: "Some cool text from the parent",
    };
  }

  setComponentRef = (ref: TextComponent) => {
    this.componentRef = ref;
  }

  reactToPrintContent = () => {
    return this.componentRef;
  }

  reactToPrintTrigger = () => {
    // NOTE: could just as easily return <SomeComponent />. Do NOT pass an `onClick` prop
    // to the root node of the returned component as it will be overwritten.

    // Bad: the `onClick` here will be overwritten by `react-to-print`
    // return <button onClick={() => alert('This will not work')}>Print this out!</button>;

    // Good
    return <button>Print pure text using a Class Component</button>;
  }

  render() {
    return (
      <div>
        <ReactToPrint
          content={this.reactToPrintContent}
          documentTitle="AwesomeFileName"
          removeAfterPrint
          trigger={this.reactToPrintTrigger}
          fonts={CUSTOM_FONTS}
        />
        {this.state.isLoading && <p className="indicator">onBeforeGetContent: Loading...</p>}
        <TextComponent ref={this.setComponentRef} />
      </div>
    );
  }
}
