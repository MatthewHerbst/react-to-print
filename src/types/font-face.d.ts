// Lightly modified from: https://github.com/Microsoft/TypeScript/issues/30984#issuecomment-631991019
// NOTE: TypeScript 4.4 added partial support for FontFace. As such, only a few missing items now
// need to be manually specified
// https://github.com/microsoft/TypeScript-DOM-lib-generator/issues/1029#issuecomment-869224737
export {}

declare global {
  interface Document {
    fonts: FontFaceSet; // https://developer.mozilla.org/en-US/docs/Web/API/Document/fonts
  }

  interface Window {
    FontFace: FontFace; // https://developer.mozilla.org/en-US/docs/Web/API/FontFace
  }

  interface FontFaceSet extends Iterable<FontFace> {
    add(font: FontFace): void; // https://developer.mozilla.org/en-US/docs/Web/API/FontFaceSet/add
  }
}
