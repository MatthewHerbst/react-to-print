<p align="center">
  <img width="300" height="300" src="./logo.png" alt="react-to-print logo">
</p>

# ReactToPrint - Print React components in the browser

[![NPM Downloads](https://img.shields.io/npm/dt/react-to-print.svg?style=flat)](https://npmcharts.com/compare/react-to-print?minimal=true)
[![npm version](https://badge.fury.io/js/react-to-print.svg)](https://badge.fury.io/js/react-to-print)

Print the content of a React component.

`npm install --save react-to-print`

## Demo

[![Run react-to-print](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/rzdhd)

## Usage

```tsx
import { useReactToPrint } from "react-to-print";
import { useRef } from "react";

const contentRef = useRef<HTMLDivElement>(null);
const reactToPrintFn = useReactToPrint({ contentRef });

return (
  <div>
    <button onClick={reactToPrintFn}>Print</button>
    <div ref={contentRef}>Content to print</div>
  </div>
);
```

It is also possible to lazy set the ref if your content being printed is dynamic. See the [`LazyContent`](https://github.com/MatthewHerbst/react-to-print/blob/master/examples/LazyContent/index.tsx) example for more. This can also be useful for setting the ref in non-React code, such as util functions.

## API

| Option | Type | Description |
| :-------------------: | :------- | :---------------------------------------------------------------------------------------------------------------------------------- |
| **`bodyClass`** | `string` | One or more class names to pass to the print window, separated by spaces |
| **`contentRef`** | `React.RefObject<Element \| Text>` | The ref pointing to the content to be printed. Alternatively, pass the ref directly to the callback returned by `useReactToPrint` |
| **`copyShadowRoots`** | `boolean` | Copy shadow root content into the print window. Warning: Use with care if you print large documents as traversing these can be slow. |
| **`documentTitle`** | `string` | Set the title for printing when saving as a file |
| **`fonts`** | `{ family: string, source: string; weight?: string; style?: string; }[]` | A list of fonts to load into the printing iframe. This is useful if you are using custom fonts |
| **`ignoreGlobalStyles`** | `boolean` | Ignore all `<style>` and `<link type="stylesheet" />` tags |
| **`nonce`** | `string` | Set the [`nonce`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/nonce) attribute for allow-listing script and style elements for Content Security Policy (CSP) |
| **`onAfterPrint`** | `() => void` | Callback function that triggers after the print dialog is closed _regardless of if the user selected to print or cancel_ |
| **`onBeforePrint`** | `() => Promise<void>` | Callback function that triggers before print. This can be used to change the content on the page before printing as an alternative to, or in conjunction with, `@media print` queries |
| **`onPrintError`** | `(errorLocation: 'onBeforePrint' \| 'print', error: Error) => void` | Called if there is a printing error serious enough that printing cannot continue. Currently limited to Promise rejections in `onBeforePrint`, and `print`. |
| **`pageStyle`** | `string` | `react-to-print` sets some basic styles to help improve page printing, notably, removing the header and footer that most browsers add. Use this to override these styles and provide your own |
| **`preserveAfterPrint`** | `boolean` | Preserve the print iframe after printing. This can be useful for debugging by inspecting the print iframe |
| **`print`** | `(iframe: HTMLIFrameElement) => Promise<void>` | If passed, this function will be used instead of `window.print` to print the content. Use this to print in non-browser environments such as Electron |
| **`printIframeProps`** | `{ allow?: string, referrerPolicy?: HTMLAttributeReferrerPolicy, sandbox?: string }` | Allows setting certain properties of the print iframe, primarily for privacy and security policies |
| **`suppressErrors`** | `boolean` | When passed, prevents `console` logging of errors |

## Compatibility

`react-to-print` should be compatible with most modern browsers.

### Mobile Browsers in WebView

While printing on mobile browsers generally works, printing within a WebView (when your page is opened by an app such as Facebook or Slack, but not by the full browser itself) is known to generally not work. Some WebViews don't make the correct API available. Others make it available but cause printing to no-op.

We are actively researching resolutions to this issue, but it likely requires changes by Google/Chromium and Apple/WebKit. See [#384](https://github.com/MatthewHerbst/react-to-print/issues/384) for more information. If you know of a way we can solve this your help would be greatly appreciated.

### Known Incompatible Browsers

- Firefox Android (does not support [`window.print`](https://developer.mozilla.org/en-US/docs/Web/API/Window/print))

## Known Issues

- Some mobile browser may, instead of printing, open the native Share action instead
- `onAfterPrint` may fire immediately (before the print dialog is closed) on newer versions of Safari where [`window.print`](https://developer.mozilla.org/en-US/docs/Web/API/Window/print) does not block
- ([401](https://github.com/MatthewHerbst/react-to-print/issues/401)): TypeScript errors such as `Type 'undefined' is not assignable to type 'ReactInstance | null'.`. You likely need to set your ref to initially be `null`: `useRef(null)`

## Common Pitfalls

- `documentTitle` will not work if `react-to-print` is run within an `iframe`. If `react-to-print` is run within an `iframe` and your script has access to the parent document, you may be able to manually set and then restore the parent document's `title` during the print. This can be done by leveraging the `onBeforePrint` and `onAfterPrint` callbacks.

- When printing, only styles that directly target the printed nodes will be applied as the parent nodes of the printed nodes will not exist in the print DOM. For example, in the code below, if the `<p>` tag is the root of the `ComponentToPrint` then the red styling will *not* be applied. Be sure to target all printed content directly and not from unprinted parents.

  ```jsx
  <div className="parent">
    <p>Hello</p>
  </div>
  ```

  ```css
  div.parent p { color:red; }
  ```

- The `connect` method from `react-redux` returns a functional component that cannot be assigned a reference to be used within the `contentRef`. To use a component wrapped in `connect` within `contentRef`, create an intermediate component that simply renders your component wrapped in `connect`. See [280](https://github.com/MatthewHerbst/react-to-print/issues/280) for more.

- When rendering multiple components to print, ensure each is passed a unique ref. Then, either use a unique `useReactToPrint` call for each component, or, using a single `useReactToPrint` call pass the refs at print-time to the printing function returned by the hook. If you share refs across components only the last component will be printed. See [323](https://github.com/MatthewHerbst/react-to-print/issues/323) for more.

## FAQ

### How can content be hidden/shown during printing?

The simplest way to hide or show content during printing is to use a [CSS Media Query](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries/Using_media_queries).

```css
.printContent {
  display: none;

  @media print {
    display: block;
  }
}
```

```tsx
const contentRef = useRef<HTMLDivElement>(null);
const reactToPrintFn = useReactToPrint({ contentRef });

return (
  <div>
    <button onClick={reactToPrintFn}>Print</button>
    <div className="printContent" ref={contentRef}>Content to print</div>
  </div>
);
```

### Can `react-to-print` be used to download a PDF without using the Print Preview window?

Not directly. We aren't able to print a PDF as we lose control once the print preview window opens. However, it is possible to use `react-to-print` to gather the content you want to print and pass it to a library that can generate a PDF.

```tsx
const handlePrint = useReactToPrint({
  ...,
  print: async (printIframe: HTMLIframeElement) => {
    // Do whatever you want here, including asynchronous work
    await generateAndSavePDF(printIframe);
  },
});
```

For examples of how others have done this, see [#484](https://github.com/MatthewHerbst/react-to-print/issues/484)

### Can `react-to-print` be used to change the settings within the print preview dialog?

No. The [`window.print`](https://developer.mozilla.org/en-US/docs/Web/API/Window/print) API does not provide a way to change these settings. Only various CSS hints can be provided, with each browser potentially treating them differently.

### Can the `ComponentToPrint` be a Class component?

Not directly. To print a Class based component you will need to manually forward the `contentRef` as a prop:

```tsx
class ComponentToPrint extends Component {
  render() {
    return (
      <div ref={this.props.innerRef}>
        Print content
      </div>
    )
  }
}

function App {
  const contentRef = useRef(null);
  const handlePrint = useReactToPrint({ contentRef });

  return (
    <div>
      <button onClick={handlePrint}>Print</button>
      <ComponentToPrint innerRef={contentRef} />
    </div>
  );
}
```

### Why does `onAfterPrint` fire even if the user cancels printing

`onAfterPrint` fires when the print dialog closes, regardless of why it closes. This is the behavior of the [`onafterprint` browser event](https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onafterprint).

### Why does `react-to-print` skip `<link rel="stylesheet" href="">` tags

`<link>`s with empty `href` attributes are [invalid HTML](https://www.w3.org/TR/html50/document-metadata.html#attr-link-href). In addition, they can cause all sorts of [undesirable behavior](https://gtmetrix.com/avoid-empty-src-or-href.html). For example, many browsers - including modern ones, when presented with `<link href="">` will attempt to load the current page. Some even attempt to load the current page's parent directory.

*Note*: related to the above, `img` tags with empty `src` attributes are also invalid, and we may not attempt to load them.

### How do you make `ComponentToPrint` show only while printing

If you've created a component that is intended only for printing and should not render in the parent component, wrap that component in a `div` with style set to `{ display: "none" }`, like so:

```jsx
<div style={{ display: "none" }}><ComponentToPrint ref={componentRef} /></div>
```

This will hide `ComponentToPrint` but keep it in the DOM so that it can be copied for printing.

### Setting state in `onBeforePrint`

Recall that setting state is asynchronous. As such, you need to pass a `Promise` and wait for the state to update.

```tsx
const [isPrinting, setIsPrinting] = useState(false);
const contentRef = useRef(null);

// We store the resolve Promise being used in `onBeforePrint` here
const promiseResolveRef = useRef(null);

// We watch for the state to change here, and for the Promise resolve to be available
useEffect(() => {
  if (isPrinting && promiseResolveRef.current) {
    // Resolves the Promise, letting `react-to-print` know that the DOM updates are completed
    promiseResolveRef.current();
  }
}, [isPrinting]);

const handlePrint = useReactToPrint({
  contentRef,
  onBeforePrint: () => {
    return new Promise((resolve) => {
      promiseResolveRef.current = resolve;
      setIsPrinting(true);
    });
  },
  onAfterPrint: () => {
    // Reset the Promise resolve so we can print again
    promiseResolveRef.current = null;
    setIsPrinting(false);
  }
});
```

Note: for Class components, pass the Promise `resolve` to the callback for `this.setState`: `this.setState({ isPrinting: false }, resolve)`

### Changing print settings in the print dialog

Unfortunately there is no standard browser API for interacting with the print dialog. All `react-to-print` is able to do is open the dialog and give it the desired content to print. We cannot modify settings such as the default paper size, if the user has background graphics selected or not, etc.

### Printing `video` elements

`react-to-print` tries to wait for `video` elements to load before printing but a large part of this is up to the browser. Further, the image displayed will usually be the first frame of the video, which might not be what you expect to show. To ensure the proper image is displayed in the print we highly recommend setting the [`poster`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video#attr-poster) attribute of the `video`, which allows specifying an image to be a placeholder for the video until the video loads.

### Electron

`react-to-print` can be used for printing in Electron, but you will need to provide your own `print` method since Electron does not natively support the `window.print` method. Please see [this answer on StackOverflow](https://stackoverflow.com/a/70534565/2518231) for how to do this.

There is a fully-working example of how to use `react-to-print` with Electron available [here](https://github.com/MatthewHerbst/electron-react-to-print-demo).

### `link` elements not displaying styles properly

Some frameworks such as Ruby on Rails will set `media="screen"` on `<link>` elements that don't have `screen` set. This can cause styles to appear incorrectly when printing. To fix, explicitly set `media="screen"` on your `<link>` elements. For `<link>` elements meant to apply only when printing, set `media="print"`.

## Helpful Style Tips

### Set the page orientation

While you should be able to place these styles anywhere, sometimes the browser doesn't always pick them up. To force orientation of the page you can include the following in the component being printed:

```jsx
<style type="text/css" media="print">{"\
  @page {\ size: landscape;\ }\
"}</style>
```

### Set the page size

The default page size is usually A4. Most browsers do not allow JavaScript or CSS to set the page size. For the browsers that do, it is usually done using the CSS page [`size`](https://developer.mozilla.org/en-US/docs/Web/CSS/@page/size) property. Check [`caniuse`](https://caniuse.com/mdn-css_at-rules_page_size) to see if the browsers you develop against support this.

```css
@media print {
  @page {
    size: 50mm 150mm;
  }
}
```

### Set custom margin to the page ([29](https://github.com/MatthewHerbst/react-to-print/issues/29))

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

### Set landscape printing ([240](https://github.com/MatthewHerbst/react-to-print/issues/240))

In the component that is passed in as the content ref, add the following:

```css
@media print {
  @page { size: landscape; }
}
```

### Printing elements that are not displayed ([159](https://github.com/MatthewHerbst/react-to-print/issues/159))

Instead of using `{ display: 'none'; }`, try using `{ overflow: hidden; height: 0; }`

### Using `pageStyle`

`pageStyle` should be a CSS string. For example: `".divider { break-after: always; }"`

### Getting a blank page when printing

Many have found setting the following CSS helpful. See [#26](https://github.com/MatthewHerbst/react-to-print/issues/26) for more.

```css
@media print {
  html, body {
    height: 100vh; /* Use 100% here to support printing more than a single page*/
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden;
  }
}
```

Another thing to try, especially if you are seeing this issue on mobile browsers, is to set `preserveAfterPrint: true` as it's possible the browser is causing the print iframe to be removed before printing has completed.

### Styles incorrect in print dialog when using grid system

We often ([#327](https://github.com/MatthewHerbst/react-to-print/issues/327), [#343](https://github.com/MatthewHerbst/react-to-print/issues/343), [#382](https://github.com/MatthewHerbst/react-to-print/issues/382)) see issues reported where the developer is using Bootstrap or a similar grid system, and everything works great until the user goes to print and suddenly it seems the styles are off. We've found that often the issue is the grid library uses the smallest sized columns during printing, such as the `xs` size on Bootstrap's grid, a size developers often don't plan for. The simplest solution is to ensure your grid will adapt to this size appropriately, though this may not be acceptable since you may want the large view to print rather than the smaller view. Another solution is to [override the grid column definition](https://stackoverflow.com/questions/22199429/bootstrap-grid-for-printing/28152320). Some newer versions of libraries have specific tools for dealing with printing, for example, [Bootstrap 4's Display property](https://getbootstrap.com/docs/4.3/utilities/display/).

### Page Breaks

What to know:

- [`break-inside`](https://developer.mozilla.org/en-US/docs/Web/CSS/break-inside) (replaces [`page-break-inside`](https://developer.mozilla.org/en-US/docs/Web/CSS/page-break-inside))
- [`break-before`](https://developer.mozilla.org/en-US/docs/Web/CSS/break-before) (replaces [`page-break-before`](https://developer.mozilla.org/en-US/docs/Web/CSS/page-break-before))
- [`break-after`](https://developer.mozilla.org/en-US/docs/Web/CSS/break-after) (replaces [`page-break-after`](https://developer.mozilla.org/en-US/docs/Web/CSS/page-break-after))

#### Pattern for Page-Breaking Dynamic Content

Define a page-break class to apply to elements which could be sensibly split into a page.

```html
<div className="print-container" style={{ margin: "0", padding: "0" }}>
  {listOfContent.map(yourContent => (
    <>
      <div className="page-break" />
      <div>{yourContent}</div>
    </>
  ))}
</div>
```

In your styles, define your `@media print` styles, which should include setting your preference for CSS `page-break-` (see [w3's reference](https://www.w3schools.com/cssref/pr_print_pageba.asp) for options) to `auto`, and ensuring that your `page-break` element does not affect non-print styles.

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

- Style incompatibilities with print media rendering
- A need to assign `CSS page-break-` properties to define how your document should behave when printed

#### Common Page Break Pitfalls

- A style of `overflow: scroll`, when rendered to print, will result in cut off content instead of page breaks to include the content
- A style of `position: absolute`, when rendered to print, may result in reformatted, rotated, or re-scaled content, causing unintended affects to print page layout and page breaks
- Using `flex` may interfere with page breaks, try using `display: block`

### Handling Scrolling ([603](https://github.com/MatthewHerbst/react-to-print/issues/603))

[![Edit react-to-print (Handling Scrolling)](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/react-to-print-handling-scrolling-n4mxyj?fontsize=14&hidenavigation=1&theme=dark)

If you need to print the content of a scrolling container, you may encounter the following issues:

- [Unable to control the scroll position](https://github.com/MatthewHerbst/react-to-print/issues/603#issue-1647664811), so the printed content may not be what you want.
- [Overflow content is truncated](https://github.com/MatthewHerbst/react-to-print/issues/603#issuecomment-1649604330), resulting in missing printed content.

To solve these problems, you need to modify the properties of the scrolling container when printing. You can pass a function to the `print` property, which will be called when printing. In this function, you can use the DOM API to query the scrolling container that needs to be modified, and then modify its properties to **control the scroll position**.

```javascript
const customToPrint = (printWindow) => {
  const printContent = printWindow.contentDocument || printWindow.contentWindow?.document;
  const printedScrollContainer = printContent.querySelector('.scroll-container');

  const originScrollContainer = document.querySelector('.scroll-container');

  // Set the scroll position of the printed container to match the origin container
  printedScrollContainer.scrollTop = originScrollContainer.scrollTop;

  // You can also set the `overflow` and `height` properties of the printed container to show all content.
  // printedScrollContainer.style.overflow = "visible";
  // printedScrollContainer.style.height = "fit-content";

  printWindow.contentWindow.print();
}

const handlePrint = useReactToPrint({
  // ...
  print: customToPrint,
});
```

#### Simple Show All Content

In addition to the methods in the above example, you can also simply add a CSS class name to the scrolling container when printing to **show all content**.

Set the container to `overflow: visible; height: fit-content` when printing, cancel the scrolling behavior when the content overflows, and make the height adapt to the content.

```css
@media print {
  .scroll-container {
    overflow: visible;
    height: fit-content;
  }
}
```

> Note:
> 
> - If the styles do not take effect, you can try using the `!important` modifier.
> - The styles provided in the above instructions are for reference only. Complex situations may require more styles to achieve the desired result.

## Running locally

*NOTE*: The library is built and tested locally using Node ^20.

- Clone the repo
- `npm ci`
- `npm start`

## Related Packages

- [vue-to-print](https://github.com/siaikin/vue-to-print): vue3 version of react-to-print
