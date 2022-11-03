import * as React from "react";
import * as ReactDomClient from 'react-dom/client';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

import { ClassComponent } from "./ClassComponent";
import { ClassComponentContextConsumer } from "./ClassComponentContextConsumer";
import { ClassComponentText } from "./ClassComponentText";
import { FunctionalComponent } from "./FunctionalComponent";
import { FunctionalComponentWithHook } from "./FunctionalComponentWithHook";
import { FunctionalComponentWithFunctionalComponentToPrint } from './FunctionalComponentWithFunctionalComponentToPrint';
import "./styles/index.css";

type Props = Record<string, unknown>;
type State = {
  text: string;
  isLoading: boolean;
}

class Example extends React.Component<Props, State> {
  render() {
    return (
      <div>
        <span className="title">Open the developer console to see lifecycle method logging</span>
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
      </div>
    );
  }
}

const container = document.getElementById("app-root");
const root = ReactDomClient.createRoot(container!);
root.render(<Example/>);
