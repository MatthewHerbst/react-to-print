<div align="center">
  <img src="https://user-images.githubusercontent.com/19170080/33672781-14f1b03e-da79-11e7-95fe-4ce15f170230.png" />
</div>

# ReactToPrint - Print React components in the browser

[![Build Status](https://travis-ci.org/gregnb/react-to-print.svg?branch=master)](https://travis-ci.org/gregnb/react-to-print)
[![dependencies Status](https://david-dm.org/gregnb/react-to-print/status.svg)](https://david-dm.org/gregnb/react-to-print)
[![npm version](https://badge.fury.io/js/react-to-print.svg)](https://badge.fury.io/js/react-to-print)

So you've created a React component but would love to give end users the ability to print out the contents of that component. This package aims to solve that by popping up a new print window with CSS styles copied over as well.

## Install

`npm install react-to-print --save-dev`

## Demo

[![Edit react-to-print](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/kmmw7l39y7)

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

## API

#### &lt;ReactToPrint />

The component accepts the following props:

|         Name          | Type     | Description                                                                                                                         |
| :-------------------: | :------- | :---------------------------------------------------------------------------------------------------------------------------------- |
|     **`trigger`**     | function | A function that returns a React Component or HTML element                                                                           |
|     **`content`**     | function | A function that returns a component reference value. The content of this reference value is then used for print                     |
|   **`copyStyles`**    | boolean  | Copies all &lt;style> and &lt;link type="stylesheet" /> from <head> inside the parent window into the print window. (default: true) |
|  **`onBeforePrint`**  | function | A callback function that triggers before print                                                                                      |
|  **`onAfterPrint`**   | function | A callback function that triggers after print                                                                                       |
| **`closeAfterPrint`** | boolean  | Close the print window after action                                                                                                 |
|    **`pageStyle`**    | string   | Override default print window styling                                                                                               |
|    **`bodyClass`**    | string   | Optional class to pass to the print window body                                                                                     |

## FAQ

**Why does `react-to-print` skip `<link rel="stylesheet" href="">` tags?**
`<link>`s with empty `href` attributes are [INVALID HTML](https://www.w3.org/TR/html50/document-metadata.html#attr-link-href). In addition, they can cause all sorts of [undesirable behavior](https://gtmetrix.com/avoid-empty-src-or-href.html). For example, many browsers - including modern ones, when presented with `<link href="">` will attempt to load the current page. Some even attempt to load the current page's parent directory.
