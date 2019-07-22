# CHANGELOG

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
