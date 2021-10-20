<p align="center">
  <img width="300" height="300" src="./logo.png" alt="react-to-print logo">
</p>

# ReactToPrint - Print React components in the browser

[![Build Status](https://travis-ci.org/gregnb/react-to-print.svg?branch=master)](https://travis-ci.org/gregnb/react-to-print)
[![NPM Downloads](https://img.shields.io/npm/dt/react-to-print.svg?style=flat)](https://npmcharts.com/compare/react-to-print?minimal=true)
[![dependencies Status](https://david-dm.org/gregnb/react-to-print/status.svg)](https://david-dm.org/gregnb/react-to-print)
[![npm version](https://badge.fury.io/js/react-to-print.svg)](https://badge.fury.io/js/react-to-print)

So you've created a React component and would love to give end users the ability to print out the contents of that component. This package aims to solve that by popping up a print window with CSS styles copied over as well.

## Demo

[![Edit react-to-print](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/rzdhd)

## Install

`npm install --save react-to-print`

## API

### &lt;ReactToPrint />

The component accepts the following props:

| Name | Type | Description |
| :-------------------: | :------- | :---------------------------------------------------------------------------------------------------------------------------------- |
| **`bodyClass?`** | `string` | One or more class names to pass to the print window, separated by spaces |
| **`content`** | `function` | A function that returns a component reference value. The content of this reference value is then used for print |
| **`copyStyles?`** | `boolean` | Copy all `<style>` and `<link type="stylesheet" />` tags from `<head>` inside the parent window into the print window. (default: `true`) |
| **`documentTitle?`** | `string` | Set the title for printing when saving as a file |
| **`fonts?`** | `{ family: string, source: string }[]` | You may optionally provide a list of fonts which will be loaded into the printing iframe. This is useful if you are using custom fonts |
| **`onAfterPrint?`** | `function` | Callback function that triggers after the print dialog is closed regardless of if the user selected to print or cancel |
| **`onBeforeGetContent?`** | `function` | Callback function that triggers before the library gathers the page's content. Either returns void or a Promise. This can be used to change the content on the page before printing |
| **`onBeforePrint?`** | `function` | Callback function that triggers before print. Either returns void or a Promise. Note: this function is run immediately prior to printing, but after the page's content has been gathered. To modify content before printing, use `onBeforeGetContent` instead |
| **`onPrintError?`** | `function` | Callback function (signature: `function(errorLocation: 'onBeforePrint' | 'onBeforeGetContent' | 'print', error: Error)`) that will be called if there is a printing error serious enough that printing cannot continue. Currently limited to Promise rejections in `onBeforeGetContent`, `onBeforePrint`, and `print`. Use this to attempt to print again. `errorLocation` will tell you in which callback the Promise was rejected |
| **`pageStyle?`** | `string` or `function` | We set some basic styles to help improve page printing. Use this to override them and provide your own. If given as a function it must return a `string` |
| **`print?`** | `function` | If passed, this function will be used instead of `window.print` to print the content. This function is passed the `HTMLIFrameElement` which is the iframe used internally to gather content for printing. When finished, this function must return a Promise. Use this to print in non-browser environments such as Electron |
| **`removeAfterPrint?`** | `boolean` | Remove the print iframe after action. Defaults to `false` |
| **`suppressErrors?`** | `boolean` | When passed, prevents `console` logging of errors |
| **`trigger?`** | `function` | A function that returns a React Component or Element. Note: under the hood, we inject a custom `onClick` prop into the returned Component/Element. As such, do not provide an `onClick` prop to the root node returned by `trigger`, as it will be overwritten |
| **`nonce?`** | `string` | Set the nonce attribute for whitelisting script and style -elements for CSP (content security policy) |

### `PrintContextConsumer`

If you need extra control over printing and don't want to specify `trigger` directly, `PrintContextConsumer` allows you to gain direct access to the `handlePrint` method which triggers the print action. Requires React ^16.3.0.

### `useReactToPrint`

For functional components, use the `useReactToPrint` hook, which accepts an object with the same configuration props as `<ReactToPrint />` and returns a `handlePrint` function which when called will trigger the print action. Requires React ^16.8.0.

## Compatibility

`react-to-print` should be compatible with most major browsers. We also do our best to support IE11.

### Mobile Browsers in WebView

While printing on mobile browsers should work, printing within a WebView (when your page is opened by another app such as Facebook or Slack, but not by the full browser itself) is known to not work on many if not all mobile browsers. Some browsers don't make the correct API available. Others make it available but cause it to no-op when in WebView.

We are actively researching resolutions to this issue, but it likely requires changes by Google/Chromium and Apple/WebKit. See [#384](https://github.com/gregnb/react-to-print/issues/384) for more information. If you know of a way we can solve this, your help would be greatly appreciated.

### Known Incompatible Browsers

- Firefox Android (does not support [`window.print`](https://developer.mozilla.org/en-US/docs/Web/API/Window/print))

## Examples

For full examples please see the [`examples`](https://github.com/gregnb/react-to-print/tree/master/examples) folder.

```jsx
// Using a class component, everything works without issue
export class ComponentToPrint extends React.PureComponent {
  render() {
    return (
      <div>My cool content here!</div>
    );
  }
}

// Using a functional component, you must wrap it in React.forwardRef, and then forward the ref to
// the node you want to be the root of the print (usually the outer most node in the ComponentToPrint)
// https://reactjs.org/docs/refs-and-the-dom.html#refs-and-function-components
export const ComponentToPrint = React.forwardRef((props, ref) => {
  return (
    <div ref={ref}>My cool content here!</div>
  );
});
```

### Calling from class components

```jsx
import React from 'react';
import ReactToPrint from 'react-to-print';

import { ComponentToPrint } from './ComponentToPrint';

class Example extends React.PureComponent {
  render() {
    return (
      <div>
        <ReactToPrint
          trigger={() => {
            // NOTE: could just as easily return <SomeComponent />. Do NOT pass an `onClick` prop
            // to the root node of the returned component as it will be overwritten.
            return <a href="#">Print this out!</a>;
          }}
          content={() => this.componentRef}
        />
        <ComponentToPrint ref={el => (this.componentRef = el)} />
      </div>
    );
  }
}
```

### Calling from class components with `PrintContextConsumer`

```jsx
import React from 'react';
import ReactToPrint, { PrintContextConsumer } from 'react-to-print';

import { ComponentToPrint } from './ComponentToPrint';

class Example extends React.PureComponent {
  render() {
    return (
      <div>
        <ReactToPrint content={() => this.componentRef}>
          <PrintContextConsumer>
            {({ handlePrint }) => (
              <button onClick={handlePrint}>Print this out!</button>
            )}
          </PrintContextConsumer>
        </ReactToPrint>
        <ComponentToPrint ref={el => (this.componentRef = el)} />
      </div>
    );
  }
}
```

### Calling from functional components

```jsx
import React, { useRef } from 'react';
import ReactToPrint from 'react-to-print';

import { ComponentToPrint } from './ComponentToPrint';

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

### Calling from functional components with [useReactToPrint](https://reactjs.org/docs/hooks-intro.html)

```jsx
import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

import { ComponentToPrint } from './ComponentToPrint';

const Example = () => {
  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  return (
    <div>
      <ComponentToPrint ref={componentRef} />
      <button onClick={handlePrint}>Print this out!</button>
    </div>
  );
};
```

**Note ([401](https://github.com/gregnb/react-to-print/issues/401)):** In TypeScript, if you encounter `componentRef.current` error such as: `Type 'undefined' is not assignable to type 'ReactInstance | null'.`, add `null` inside the `useRef()`:

```ts
const componentRef = useRef(null);
```

## Known Issues

- `onAfterPrint` may fire immediately (before the print dialog is closed) on newer versions of Safari where [`window.print`](https://developer.mozilla.org/en-US/docs/Web/API/Window/print) does not block

## Common Pitfalls

- When printing, only styles that directly target the printed nodes will be applied, since the parent nodes will not exist in the DOM used for the print. For example, in the code below, if the `<p>` tag is the root of the `ComponentToPrint` then the red styling will *not* be applied. Be sure to target all printed content directly and not from unprinted parents.

  ```jsx
  <div className="parent">
    <p>Hello</p>
  </div>
  ```

  ```css
  div.parent p { color:red; }
  ```

- The `connect` method from `react-redux` returns a functional component that cannot be assigned a reference to be used within the `content` props' callback in `react-to-print`. To use a component wrapped in `connect` within `content` create an intermediate class component that simply renders your component wrapped in `connect`. See [280](https://github.com/gregnb/react-to-print/issues/280) for more.

- Using a custom component as the return for the `trigger` props is possible, just ensure you pass along the `onClick` prop. See [248](https://github.com/gregnb/react-to-print/issues/248) for an example.

- When rendering multiple components to print, for example, if you have a list of charts and want each chart to have its own print icon, ideally you will wrap each component to print + print button in its own component, and just render a list of those components. However, if you cannot do that for some reason, in your `.map` ensure that each component gets a unique `ref` value passed to it, otherwise printing any of the components will always print the last component. See [323](https://github.com/gregnb/react-to-print/issues/323) for more.

## FAQ

### Can the `ComponentToPrint` be a functional component?

Yes, but only if you wrap it with [`React.forwardRef`](https://reactjs.org/docs/forwarding-refs.html). `react-to-print` relies on refs to grab the underlying DOM representation of the component, and functional components [cannot take refs by default](https://reactjs.org/docs/refs-and-the-dom.html#accessing-refs).

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

### Changing print settings in the print dialog

Unfortunately there is no standard browser API for interacting with the print dialog. All `react-to-print` is able to do is open the dialog and give it the desired content to print. We cannot modify settings such as the default paper size, if the user has background graphics selected or not, etc.

## Helpful Style Tips

### Set the page orientation

While you should be able to place these styles anywhere, sometimes the browser doesn't always pick them up. To force orientation of the page you can include the following in the component being printed:

```jsx
<style type="text/css" media="print">{"\
  @page {\ size: landscape;\ }\
"}</style>
```

### Set custom margin to the page ([29](https://github.com/gregnb/react-to-print/issues/29))

To set custom margin to the page,

First, create a function to return the page margin,

```js
const getPageMargins = () => {
  return `@page { margin: ${marginTop} ${marginRight} ${marginBottom} ${marginLeft} !important; }`;
};
```

Now, within the JSX call this function within the style tags,

```jsx
<style>{getPageMargins()}</style>
```

PS: This style tag should be inside the component that is being passed in as the content ref.

### Set landscape printing ([240](https://github.com/gregnb/react-to-print/issues/240))

In the component that is passed in as the content ref, add the following:

```css
@media print {
  @page { size: landscape; }
}
```

### Printing elements that are not displayed ([159](https://github.com/gregnb/react-to-print/issues/159))

Instead of using `{ display: 'none'; }`, try using `{ overflow: hidden; height: 0; }`

### Using the `pageStyle` prop

The `pageStyle` prop can be used to set anything from simple to complex styles. For example:

```js
const pageStyle = `
  @page {
    size: 80mm 50mm;
  }

  @media all {
    .pagebreak {
      display: none;
    }
  }

  @media print {
    .pagebreak {
      page-break-before: always;
    }
  }
`;
```

### Styles incorrect in print dialog when using grid system

We often ([#327](https://github.com/gregnb/react-to-print/issues/327), [#343](https://github.com/gregnb/react-to-print/issues/343), [#382](https://github.com/gregnb/react-to-print/issues/382)) see issues reported where the developer is using Bootstrap or a similar grid system, and everything works great until the user goes to print and suddenly it seems the styles are off. We've found that often the issue is the grid library uses the smallest sized columns during printing, such as the `xs` size on Bootstrap's grid, a size developers often don't plan for. The simplest solution is to ensure your grid will adapt to this size appropriately, though this may not be acceptable since you may want the large view to print rather than the smaller view. Another solution is to [override the grid column definition](https://stackoverflow.com/questions/22199429/bootstrap-grid-for-printing/28152320). Some newer versions of libraries have specific tools for dealing with printing, for example, [Bootstrap 4's Display property](https://getbootstrap.com/docs/4.3/utilities/display/).

### Page Breaks

#### Pattern for Page-Breaking Dynamic React Content

Define a page-break class to apply to elements which could be sensibly split into a page.

```html
<div className="print-container" style={{ margin: "0", padding: "0" }}>
  {listOfContent.map(yourContent => (
    <>
      <div className="page-break" />
      <div>{yourContent}</div>
    </>
  )}
</div>
```

In your styles, define your `@media print` styles, which should include setting your preference for CSS `page-break-` (see [w3's reference](https://www.w3schools.com/cssref/pr_print_pageba.asp) for options) to `auto`, and ensuring that your `page-break` element does not affect non-print style.

```css
@media all {
  .page-break {
    display: none;
  }
}

@media print {
  html, body {
    height: initial !important;
    overflow: initial !important;
    -webkit-print-color-adjust: exact;
  }
}

@media print {
  .page-break {
    margin-top: 1rem;
    display: block;
    page-break-before: auto;
  }
}

@page {
  size: auto;
  margin: 20mm;
}
```

#### Troubleshooting Page Breaks

If your content rendered as print media does not automatically break multi-page content into multiple pages, the issue may be
    1) style incompatibilities with print media rendering, **or**
    2) a need to assign `CSS page-break-` properties to define how your document should behave when printed

#### Common Page Break Pitfalls

- A style of `overflow: scroll`, when rendered to print, will result in cut off content instead of page breaks to include the content.
- A style of `position: absolute`, when rendered to print, may result in reformatted, rotated, or re-scaled content, causing unintended affects to print page layout and page breaks.

## Running locally

*NOTE*: Node >=12 is required to build the library locally. We use Node ^14 for our tests.
