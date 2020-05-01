<div align="center">
  <img src="https://user-images.githubusercontent.com/19170080/33672781-14f1b03e-da79-11e7-95fe-4ce15f170230.png" />
</div>

# ReactToPrint - Print React components in the browser

[![Build Status](https://travis-ci.org/gregnb/react-to-print.svg?branch=master)](https://travis-ci.org/gregnb/react-to-print)
[![NPM Downloads](https://img.shields.io/npm/dt/react-to-print.svg?style=flat)](https://npmcharts.com/compare/react-to-print?minimal=true)
[![dependencies Status](https://david-dm.org/gregnb/react-to-print/status.svg)](https://david-dm.org/gregnb/react-to-print)
[![npm version](https://badge.fury.io/js/react-to-print.svg)](https://badge.fury.io/js/react-to-print)

So you've created a React component and would love to give end users the ability to print out the contents of that component. This package aims to solve that by popping up a print window with CSS styles copied over as well.

## Demo

[![Edit react-to-print](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/rzdhd)

## Compatibility

`react-to-print` should be compatible with most major browsers. We also do our best to support IE11.

### Known Incompatible Browsers

- Firefox Android (does not support [`window.print`](https://developer.mozilla.org/en-US/docs/Web/API/Window/print))

## Known Issues

- `onAfterPrint` may fire immediately (before the print dialog is closed) on newer versions of Safari where [`window.print`](https://developer.mozilla.org/en-US/docs/Web/API/Window/print) does not block

## Install

`npm install --save react-to-print`

## API

### &lt;ReactToPrint />

The component accepts the following props:

|         Name          | Type     | Description                                                                                                                         |
| :-------------------: | :------- | :---------------------------------------------------------------------------------------------------------------------------------- |
|     **`trigger`**     | `function` | A function that returns a React Component or HTML element                                                                           |
|     **`content`**     | `function` | A function that returns a component reference value. The content of this reference value is then used for print                     |
|   **`copyStyles?`**    | `boolean`  | Copy all `<style>` and `<link type="stylesheet" />` tags from `<head>` inside the parent window into the print window. (default: `true`) |
| **`onBeforeGetContent?`** | `function` | Callback function that triggers before the library gathers the page's content. Either returns void or a Promise. This can be used to change the content on the page before printing.
|  **`onBeforePrint?`**  | `function` | Callback function that triggers before print. Either returns void or a Promise. Note: this function is run immediately prior to printing, but after the page's content has been gathered. To modify content before printing, use `onBeforeGetContent` instead.                                                                                     |
|  **`onAfterPrint?`**   | `function` | Callback function that triggers after print                                                                                       |
|  **`onPrintError?`**   | `function` | Callback function (signature: `function(errorLocation: 'onBeforePrint' | 'onBeforeGetContent', error: Error)`) that will be called if there is a printing error serious enough that printing cannot continue. Currently limited to Promise rejections in `onBeforeGetContent` or `onBeforePrint`. Use this to attempt to print again. `errorLocation` will tell you in which callback the Promise was rejected.                                                                                     |
| **`removeAfterPrint?`** | `boolean`  | Remove the print iframe after action. Defaults to `false`.                                                                                                 |
|    **`pageStyle?`**    | `string | function`   | We set some basic styles to help improve page printing. Use this to override them and provide your own. If given as a function, it must return a `string`                                                                                               |
|    **`bodyClass`**    | `string?`   | Class to pass to the print window body                                                                                     |
|    **`suppressErrors`**    | `boolean?`   | When passed, prevents `console` logging of errors

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

*NOTE*: Node ^10 is required to build the library locally. We use Node ^10 for our CLI checks.

## FAQ

### Why does `onAfterPrint` fire even if the user cancels printing

`onAfterPrint` fires when the print dialog closes, regardless of why it closes. This is the behavior of the [`onafterprint` browser event](https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onafterprint).

### Why does `react-to-print` skip `<link rel="stylesheet" href="">` tags

`<link>`s with empty `href` attributes are [INVALID HTML](https://www.w3.org/TR/html50/document-metadata.html#attr-link-href). In addition, they can cause all sorts of [undesirable behavior](https://gtmetrix.com/avoid-empty-src-or-href.html). For example, many browsers - including modern ones, when presented with `<link href="">` will attempt to load the current page. Some even attempt to load the current page's parent directory.

*Note*: related to the above, `img` tags with empty `src` attributes are also invalid, and we may not attempt to load them.

### How do you make `ComponentToPrint` show only while printing

If you've created a component that is intended only for printing and should not render in the parent component, wrap that component in a `div` with style set to `{ display: "none" }`, like so:

```jsx
<div style={{ display: "none" }}><ComponentToPrint ref={componentRef} /></div>
```

This will hide `ComponentToPrint` but keep it in the DOM so that it can be copied for printing.
