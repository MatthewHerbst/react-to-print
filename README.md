<div align="center">
  <img src="https://user-images.githubusercontent.com/19170080/33672781-14f1b03e-da79-11e7-95fe-4ce15f170230.png" />
</div>

# ReactToPrint - Print React components in the browser

[![Build Status](https://travis-ci.org/gregnb/react-to-print.svg?branch=master)](https://travis-ci.org/gregnb/react-to-print)
[![NPM Downloads](https://img.shields.io/npm/dt/react-to-print.svg?style=flat)](https://npmcharts.com/compare/react-to-print?minimal=true)
[![dependencies Status](https://david-dm.org/gregnb/react-to-print/status.svg)](https://david-dm.org/gregnb/react-to-print)
[![npm version](https://badge.fury.io/js/react-to-print.svg)](https://badge.fury.io/js/react-to-print)

So you've created a React component but would love to give end users the ability to print out the contents of that component. This package aims to solve that by popping up a new print window with CSS styles copied over as well.

## Install

`npm install react-to-print --save-dev`

## Demo

[![Edit react-to-print](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/rzdhd)

## Example

### Calling from class components

```js
import React from 'react';
import ReactToPrint from 'react-to-print';

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

### Calling from functional components with [hooks](https://reactjs.org/docs/hooks-intro.html)

```js
import React, { useRef } from 'react';
import ReactToPrint from 'react-to-print';

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

const Example = () => {
  const componentRef = useRef();
  return (
    <div>
      <ReactToPrint
        trigger={() => <button>Print this out!</button>}
        content={() => componentRef.current}
      />
      <ComponentToPrint ref={componentRef} />
    </div>
  );
};
```

## Running locally

*NOTE*: Node ^8.6 is required to build the library locally. We use Node ^10 for our CLI checks.

## API

#### &lt;ReactToPrint />

The component accepts the following props:

|         Name          | Type     | Description                                                                                                                         |
| :-------------------: | :------- | :---------------------------------------------------------------------------------------------------------------------------------- |
|     **`trigger`**     | function | A function that returns a React Component or HTML element                                                                           |
|     **`content`**     | function | A function that returns a component reference value. The content of this reference value is then used for print                     |
|   **`copyStyles`**    | boolean  | Copies all &lt;style> and &lt;link type="stylesheet" /> from <head> inside the parent window into the print window. (default: true) |
|  **`onBeforePrint`**  | function | ptional callback function that triggers before print. Either returns void or a Promise. If the function returns a Promise the content will be printed when the Promise is resolved. Users are responsible for catching the Promise rejecting. Note: this function is run immediately prior to printing, but after the page's content has been gathered. To modify content before printing, use onBeforeGetContent instead.                                                                                     |
| **`onBeforeGetContent`** | function | Optional callback function that triggers before lib get content to print. Either returns a Promise with a function. The content will be printed after the function returns. It's useful for manipulate the component to print before printing.
|  **`onAfterPrint`**   | function | Optional callback function that triggers after print                                                                                       |
| **`removeAfterPrint`** | boolean  | Remove the print iframe after action. Defaults to `false`.                                                                                                 |
|    **`pageStyle`**    | string   | Override default print window styling                                                                                               |
|    **`bodyClass`**    | string   | Optional class to pass to the print window body                                                                                     |

## FAQ

**Why does `react-to-print` skip `<link rel="stylesheet" href="">` tags?**
`<link>`s with empty `href` attributes are [INVALID HTML](https://www.w3.org/TR/html50/document-metadata.html#attr-link-href). In addition, they can cause all sorts of [undesirable behavior](https://gtmetrix.com/avoid-empty-src-or-href.html). For example, many browsers - including modern ones, when presented with `<link href="">` will attempt to load the current page. Some even attempt to load the current page's parent directory.
