# CHANGELOG

## 2.12.4 (April 10th, 2021)

- CHORE: Upgraded all `devDependencies`
- DOCS: Added a section to the README about workarounds for functional components as the `ComponentToPrint`

## 2.12.3 (February 5th, 2021)

- FIX [344](https://github.com/gregnb/react-to-print/pull/344): Remove the single use of [`ParentNode.append`](https://developer.mozilla.org/en-US/docs/Web/API/ParentNode/append) in favor of [`Node.appendChild`](https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild). `append` is not supported by IE11, and polyfilling it within the context of an iframe can be difficult
- FIX [344](https://github.com/gregnb/react-to-print/pull/344): While testing the above I realized that trying to print out a bare string didn't work. This has been fixed
- CHORE: Upgraded all `devDependencies`

## 2.12.2 (January 1st, 2021)

Happy new years!

- FIX [196](https://github.com/gregnb/react-to-print/issues/196): For a long time various inputs/select did not properly copy their value over into the print window. This has been corrected!
- FIX [292](https://github.com/gregnb/react-to-print/issues/292): Removed usage of `document.write`
- FIX: Edge case where passing a function to the `pageStyle` prop that did not return a string could cause problems
- CHORE: Upgraded all `devDependencies`
- CHORE: Minor README updates

## 2.12.1 (December 14th, 2020)

- FIX [329](https://github.com/gregnb/react-to-print/pull/329): v2.12.0 upgraded Webpack from 4 -> 5 which broke the package for environments that didn't support ES6 as Webpack now requires finer grained controls to output pure ES5 code. These changes have been made.
- CHORE: upgraded all devDependencies

## 2.12.0 (November 27th, 2020)

- CHORE: added React/ReactDOM ^17 to allowed peerDependencies. Library still supports React >= 15, though expect a major release in the near-future that drops React 15 support, which will clear the way to removing the restriction that the top-level component being printed must be a class component
- CHORE: upgraded all devDependencies. Big changes here include updating Typescript from 3 -> 4 and Webpack from 4 -> 5. While upgrading Webpack the minifier was changed from UglifyJS to Terser, resulting in a 5.7% reduced file size (14.1kb -> 13.3kb)
- CHORE: Use Node ^14 for CLI tests
- DOCUMENTATION: small improvements to the examples, including renaming them from `example` -> `examples`
- DOCUMENTATION: added a note about finding the [`examples`](https://github.com/gregnb/react-to-print/tree/master/examples) folder
- DOCUMENTATION [311](https://github.com/gregnb/react-to-print/issues/311): small type fix, thanks [nealeu](https://github.com/nealeu)
- DOCUMENTATION: added a "Common Pitfalls" section to the README, starting with a note on using the library with a component wrapped in `connect` from `react-redux`

## 2.11.0 (October 30th, 2020)

- FIX/FEATURE [285](https://github.com/gregnb/react-to-print/pull/285): Adds a new `fonts` prop which allows the passing of custom fonts. Previously custom fonts were not loaded into the print window
- CHORE: update patch and minor `devDependencies`, `dedupe`, and `audit fix`

## 2.10.3 (October 16th, 2020)

- FIX [301](https://github.com/gregnb/react-to-print/pull/301): Ensures the library works with modules that have a `null` prototype such as ES modules and SystemJS modules. Thanks [joeldenning](https://github.com/joeldenning)

## 2.10.2 (October 16th, 2020)

- FIX [298](https://github.com/gregnb/react-to-print/pull/298): Fixes a long-standing issue of checkbox state not always copying properly into the print window. Thanks [aviklai](https://github.com/aviklai)
- CHORE: update patch and minor `devDependencies`, `dedupe`, and `audit fix`

## 2.10.1 (October 15th, 2020)

- FIX [296](https://github.com/gregnb/react-to-print/pull/296): Ensure `bodyClass` can handle multiple class names instead of just a single class name. Thanks [seanblonien](https://github.com/seanblonien)
- CHORE: update patch and minor `devDependencies`, `dedupe`, and `audit fix`

## 2.10.0 (August 23rd, 2020)

- FEATURE [272](https://github.com/gregnb/react-to-print/pull/272): a new prop `print` has been added. This can be used to override the default browser [`Window.print`](https://developer.mozilla.org/en-US/docs/Web/API/Window/print). This can be useful if you want to print in an alternative environment such as Electron. As part of this change, `onPrintError` will now report if an error occurs in a passed in `print` method. Thanks to [Ririshi](https://github.com/Ririshi) for this idea
- DOCS [269](https://github.com/gregnb/react-to-print/pull/269): added guidelines for how to achieve nice page breaks. Thanks [hbrannan](https://github.com/hbrannan)
- CHORE [273](https://github.com/gregnb/react-to-print/pull/273): updated `devDependencies`, `npm dedupe`, `npm audit fix`

## 2.9.0 (June 2nd, 2020)

- FEATURE [255](https://github.com/gregnb/react-to-print/pull/255): updated local development examples so that every use case is covered
- FIX [255](https://github.com/gregnb/react-to-print/pull/255): `onload` event listener is now cleared after being called
- FIX [255](https://github.com/gregnb/react-to-print/pull/255): `useReactToPrint` now properly sets `defaultProps`
- CHORE [256](https://github.com/gregnb/react-to-print/pull/256): updated `devDependencies` to latest. This clears a high severity `npm audit` issue

## 2.8.0 (May 19th, 2020)

- FEATURE [245](https://github.com/gregnb/react-to-print/pull/245): `documentTitle` prop can now be passed to set a default filename when the user is saving as a PDF. Thanks [zb2oby](https://github.com/zb2oby)
- FEATURE [244](https://github.com/gregnb/react-to-print/pull/244): `trigger` is now an optional prop. To print without it we now offer two new options.

  `PrintContextConsumer` with a render-props pattern:

  ```js
  import { PrintContextConsumer } from 'react-to-print';

  <ReactToPrint content={() => this.componentRef}>
    <PrintContextConsumer>
      {({ handlePrint }) => <button onClick={handlePrint}>Print this out!</button>}
    </PrintContextConsumer>
  </ReactToPrint>
  ```

  `useReactToPrint` for hook-based printing

  ```js
  import { useReactToPrint } from 'react-to-print';

  const Example = () => {
    const componentRef = useRef();
    const handlePrint = useReactToPrint({ content: () => componentRef.current });

    return (
      <div>
        <ComponentToPrint ref={componentRef} />
        <button onClick={handlePrint}>Print this out!</button>
      </div>
    );
  };
  ```

  Huge thanks to [vtsybulin](https://github.com/vtsybulin) for these fantastic additions.

- CHORE: upgrade `devDependencies` to latest

## 2.7.0 (May 1st, 2020)

- FEATURE [198](https://github.com/gregnb/react-to-print/pull/198): `pageStyle` prop can now be passed as a function. Thanks [sergeyshmakov](https://github.com/sergeyshmakov)
- FIX [218](https://github.com/gregnb/react-to-print/issues/218): Image duplication in Edge and IE. This should also fix [211](https://github.com/gregnb/react-to-print/issues/211) (slow performance with many images on the page). Thank you [dioscarey](https://github.com/dioscarey) for helping to get this pushed through
- Fix [93](https://github.com/gregnb/react-to-print/issues/93): Check for existence of `target.contentWindow.print`
- CHORE: updated an error message (see [96](https://github.com/gregnb/react-to-print/issues/96))
- CHORE: updated all `devDependencies` to latest
- CHORE: slightly decreased size of the build by better using UglifyJS
- CHORE: enabled TypeScript strict mode
- CHORE: added a "Compatibility" section to the README. Also moved some sections around and shortened the example
- CHORE: improved browser built targets based on `browserslist` best practices

## 2.6.3 (March 9th, 2020)

- FIX [227](https://github.com/gregnb/react-to-print/pull/227) Add a `title` to the print iframe to improve accessibility. Thanks [invious](https://github.com/invious)

## 2.6.2 (March 8th, 2020)

- FIX [224](https://github.com/gregnb/react-to-print/pull/224) Handle the `content` prop returning `null`. This is required for proper usage in TypeScript strict mode. Thanks [a-sync](https://github.com/a-sync)

## 2.6.1 (March 3rd, 2020)

- CHORE [220](https://github.com/gregnb/react-to-print/pull/222) Added `suppressErrors` documentation to the README

## 2.6.0 (March 3rd, 2020)

- FEATURE [220](https://github.com/gregnb/react-to-print/pull/220) Adds a `suppressErrors` prop. When passed, console logging of errors is disabled. Thanks [invious](https://github.com/invious)

## 2.5.1 (January 9th, 2020)

- CHORE [208](https://github.com/gregnb/react-to-print/pull/208) Minor improvements to code comments, linting, and README

- CHORE [207](https://github.com/gregnb/react-to-print/pull/207) Updated `devDependencies`

- FIX [204](https://github.com/gregnb/react-to-print/pull/204): Ensure images are fully loaded before printing. Previously long-loading images might not be included in the print. This ensures that we wait for them to load, similar to how we wait for style sheets to load. Thanks [nhanhuynh-agilityio](https://github.com/nhanhuynh-agilityio)

## 2.5.0 (October 16th, 2019)

- FEATURE [172](https://github.com/gregnb/react-to-print/pull/172): Allow the `trigger` component to be a functional component. Previously, only class based components were allowed here. Thanks [idanhaviv](https://github.com/idanhaviv)

- FEATURE [172](https://github.com/gregnb/react-to-print/pull/172): Enable CSS HMR when running the local example build. Thanks [idanhaviv](https://github.com/idanhaviv)

## 2.4.0 (August 27th, 2019)

- FEATURE [161](https://github.com/gregnb/react-to-print/pull/161): add a new callback method `onPrintError`. This method is called when `react-to-print` catches a Promise rejection in either `onBeforeGetContent` or `onBeforePrint`. The API docs were also cleaned up to better explain which method to use when.

- FEATURE [158](https://github.com/gregnb/react-to-print/pull/158)/[160](https://github.com/gregnb/react-to-print/pull/160): add new callback method `onBeforeGetContent`. Currently, `onBeforePrint` is called before the print window is opened but after `react-to-print` has gathered the content of the page. This new method is fired before `react-to-print` gathers the content of the page, meaning it can be used to change the content of the page before printing. It can optionally return a `Promise`. Thanks [@andfs](https://github.com/andfs)

## 2.3.2 (August 6th, 2019)

- CHORE [156](https://github.com/gregnb/react-to-print/pull/156): dependency upgrades. All listed dependencies were manually upgraded to their latest versions. `npm audit fix` was then run to give us a clean audit. Finally, `npm dedupe` was run to reduce package bloat.

- FIX [156](https://github.com/gregnb/react-to-print/pull/156): a stylesheet that no longer exists but that was being required by the local example has been removed

*NOTE*: To build the library locally, Node ^8.6 is now required

## 2.3.1 (August 6th, 2019)

- FIX [154](https://github.com/gregnb/react-to-print/pull/154): TSLint was not working properly for the project. A configuration was added, and linting errors were fixed. While fixing linting errors, a bug was discovered whereby if a stylesheet was found that did not have tag type `STYLE` it was possible that `react-to-print` would not include all stylesheets from the page into the print window

- FIX: [154](https://github.com/gregnb/react-to-print/pull/154) (meant to be a different PR, was included by mistake in 154): When passing `removeAfterPrint` some users were getting the error `TypeError: Object doesn't support property or method 'remove'`. This was due to using an incorrect way to remove the iframe

## 2.3.0 (July 30th, 2019)

- FEATURE [152](https://github.com/gregnb/react-to-print/pull/152): Previously, this library used a window rather than an `iframe` to handle printing. That was changed some time ago, however, the `closeAfterPrint` prop was never removed from the documentation (though it was removed from the code). This release restores similar functionality, in a new `removeAfterPrint` prop. Passing this prop will ensure that `react-to-print` removes the `iframe` it uses to print from the DOM after printing (something that it currently does not do). NOTE: the `iframe` is removed after the call to `onAfterPrint` (if provided) has completed. We will likely make this the default functionality in version 3, but are keeping it like this for now to ensure anyone relying on the `iframe` does not face issues. Thanks [aviklai](https://github.com/aviklai)

## 2.2.1 (July 22nd, 2019)

- FIX [149](https://github.com/gregnb/react-to-print/pull/149): Print window would not open if `onBeforePrint` was not given. Thanks [aviklai](https://github.com/aviklai)

## 2.2.0 (July 19th, 2019)

- FEATURE [140](https://github.com/gregnb/react-to-print/issues/140): `onBeforePrint` can now optionally return a Promise. If a Promise is returned, `react-to-print` will wait for it to resolve before continuing with the print. NOTE: `react-to-print` does not handle if the Promise rejects, so this must be accounted for when using this option. Thanks [aviklai](https://github.com/aviklai)

## 2.1.3 (June 22nd, 2019)

- FIX [134](https://github.com/gregnb/react-to-print/pull/134): Solve print window issues in Safari (especially Mobile Safari), thanks [Ellenergic](https://github.com/Ellenergic)
- CHORE: Updated the README to contain a link to a fully updated demo

## 2.1.2 (May 3rd, 2019)

- FIX [118](https://github.com/gregnb/react-to-print/issues/118): Ensure fonts have time to load before printing, thanks [aviklai](https://github.com/aviklai)

## 2.1.1 (April 13th, 2019)

- FIX: Ensure we build the package as UMD instead of CommonJS ([#116](https://github.com/gregnb/react-to-print/pull/116), thanks [@aviklai](https://github.com/aviklai))
- CHORE: Added a CHANGELOG

## 2.1.0 (April 2nd, 2019)

- CHORE: Convert the package to TypeScript ([#111](https://github.com/gregnb/react-to-print/pull/111), thanks [@sergeyshmakov](https://github.com/sergeyshmakov))
