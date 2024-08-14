import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

import { BasicComponent } from "./BasicComponent";
import { CustomPrint } from "./CustomPrint";
import { LazyContent } from "./LazyContent/index";
import "./styles/index.css";
import { OnBeforePrint } from './OnBeforePrint';
import {CopyShadowRootContent} from "./CopyShadowRootContent";

function Example() {
  return (
    <div>
      <span className="title">Open the developer console to see lifecycle method logging</span>
      <Tabs>
        <TabList>
          <Tab>Basic Class Component</Tab>
          <Tab>Custom Print</Tab>
          <Tab>Lazy Content</Tab>
          <Tab>On Before Print</Tab>
          <Tab>Copy Shadow Root Content</Tab>
        </TabList>
        <TabPanel><BasicComponent /></TabPanel>
        <TabPanel><CustomPrint /></TabPanel>
        <TabPanel><LazyContent /></TabPanel>
        <TabPanel><OnBeforePrint /></TabPanel>
        <TabPanel><CopyShadowRootContent /></TabPanel>
      </Tabs>
    </div>
  );
}

const container = document.getElementById("app-root");
const root = createRoot(container!);
root.render(<Example/>);
