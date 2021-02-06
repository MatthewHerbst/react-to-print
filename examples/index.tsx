import * as React from "react";
import * as ReactDOM from "react-dom";

import { ClassComponent } from "./ClassComponent";
import { ClassComponentContextConsumer } from "./ClassComponentContextConsumer";
import { FunctionalComponent } from "./FunctionalComponent";
import { FunctionalComponentWithHook } from "./FunctionalComponentWithHook";
import { ClassComponentText } from "./ClassComponentText";
import "./relativecss/test.css";

type Props = Record<string, unknown>;
type State = {
  text: string;
  isLoading: boolean;
}

class Example extends React.Component<Props, State> {
  render() {
    return (
      <>
        <ClassComponent />
        <ClassComponentContextConsumer />
        <FunctionalComponent />
        <FunctionalComponentWithHook />
        <ClassComponentText />
      </>
    );
  }
}

ReactDOM.render(<Example/>, document.getElementById("app-root"));
