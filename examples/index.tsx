import * as React from "react";
import * as ReactDOM from "react-dom";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

import { ClassComponent } from "./ClassComponent";
import { ClassComponentContextConsumer } from "./ClassComponentContextConsumer";
import { ClassComponentText } from "./ClassComponentText";
import { FunctionalComponent } from "./FunctionalComponent";
import { FunctionalComponentWithHook } from "./FunctionalComponentWithHook";
import { FunctionalComponentWithFunctionalComponentToPrint } from './FunctionalComponentWithFunctionalComponentToPrint';
import "./relativecss/test.css";

type Props = Record<string, unknown>;
type State = {
  text: string;
  isLoading: boolean;
}

class Example extends React.Component<Props, State> {
  render() {
    return (
      <Tabs>
        <TabList>
          <Tab>Class Component</Tab>
          <Tab>Functional Component</Tab>
          <Tab>Raw Values</Tab>
        </TabList>
        <TabPanel>
          <Tabs>
            <TabList>
              <Tab>Standard</Tab>
              <Tab>With ContextConsumer</Tab>
            </TabList>
            <TabPanel><ClassComponent /></TabPanel>
            <TabPanel><ClassComponentContextConsumer /></TabPanel>
          </Tabs>
        </TabPanel>
        <TabPanel>
          <Tabs>
            <TabList>
              <Tab>Standard</Tab>
              <Tab>With Hook</Tab>
              <Tab>With a functional ComponentToPrint</Tab>
            </TabList>
            <TabPanel><FunctionalComponent /></TabPanel>
            <TabPanel><FunctionalComponentWithHook /></TabPanel>
            <TabPanel><FunctionalComponentWithFunctionalComponentToPrint /></TabPanel>
          </Tabs>
        </TabPanel>
        <TabPanel>
          <Tabs>
            <TabList>
              <Tab>Text</Tab>
            </TabList>
            <TabPanel><ClassComponentText /></TabPanel>
          </Tabs>
        </TabPanel>
      </Tabs>
    );
  }
}

ReactDOM.render(<Example/>, document.getElementById("app-root"));
