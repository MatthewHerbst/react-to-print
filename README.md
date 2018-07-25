<div align="center">
  <img src="https://user-images.githubusercontent.com/19170080/33672781-14f1b03e-da79-11e7-95fe-4ce15f170230.png" />
</div>

# ReactToPrint - Print React components in the browser

[![Build Status](https://travis-ci.org/gregnb/react-to-print.svg?branch=master)](https://travis-ci.org/gregnb/react-to-print)
[![dependencies Status](https://david-dm.org/gregnb/react-to-print/status.svg)](https://david-dm.org/gregnb/react-to-print)
[![npm version](https://badge.fury.io/js/react-to-print.svg)](https://badge.fury.io/js/react-to-print)

So you've created a React component but would love to give end users the ability to print out the contents of that component. This package aims to solve that by popping up a new print window with CSS styles copied over as well.  

## Install

`npm install react-to-print --save-dev `

## Demo

[![Edit react-to-print](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/kmmw7l39y7)

## Usage


```js

import React from "react";
import ReactToPrint from "react-to-print";

class ComponentToPrint extends React.Component {
  render() {
    return (
      <table>
        <thead>
          <th>column 1</th>
          <th>column 2</th>
          <th>column 3</th>
        </thead>
        <tbody>
          <tr>
            <td>data 1</td>
            <td>data 2</td>
            <td>data 3</td>
          </tr>
          <tr>
            <td>data 1</td>
            <td>data 2</td>
            <td>data 3</td>
          </tr>
          <tr>
            <td>data 1</td>
            <td>data 2</td>
            <td>data 3</td>
          </tr>
        </tbody>
      </table>
    );
  }
}

class Example extends React.Component {
  render() {
    return (
      <div>
        <ReactToPrint
          trigger={() => <a href="#">Print this out!</a>}
          content={() => this.componentRef}
        />
        <ComponentToPrint ref={el => (this.componentRef = el)} />
      </div>
    );
  }
}


```


## API

#### &lt;ReactToPrint />

The component accepts the following props:

|Name|Type|Description
|:--:|:-----|:-----|
|**`trigger`**|function|A function that returns a React Component or HTML element
|**`content`**|function|A function that returns a component reference value. The content of this reference value is then used for print
|**`copyStyles`**|boolean|Copies all &lt;style> and &lt;link type="stylesheet" /> from <head> inside the parent window into the print window. (default: true)
|**`onBeforePrint`**|function|A callback function that triggers before print
|**`onAfterPrint`**|function|A callback function that triggers after print
|**`closeAfterPrint`**|boolean|Close the print window after action
|**`pageStyle`**|string|Override default print window styling 
|**`bodyClass`**|string|Optional class to pass to the print window body
