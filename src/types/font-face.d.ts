// Lightly modified from: https://github.com/Microsoft/TypeScript/issues/30984#issuecomment-631991019
export {}

declare global {
  const FontFace: FontFace;

  interface Document {
    fonts: FontFaceSet
  }

  interface Window {
    FontFace: FontFace;
  }

  type CSSOMString = string;
  type FontFaceLoadStatus = 'unloaded' | 'loading' | 'loaded' | 'error';
  type FontFaceSetStatus = 'loading' | 'loaded';

  interface FontFace extends FontFaceDescriptors {
    // eslint-disable-next-line @typescript-eslint/no-misused-new
    new(family: string, source: string | ArrayBuffer, descriptors?: FontFaceDescriptors): FontFace;
    readonly status: FontFaceLoadStatus;
    readonly loaded: Promise<FontFace>;
    variationSettings: CSSOMString;
    display: CSSOMString;
    load(): Promise<FontFace>;
  }

  interface FontFaceDescriptors {
    family: CSSOMString;
    style: CSSOMString;
    weight: CSSOMString;
    stretch: CSSOMString;
    unicodeRange: CSSOMString;
    variant: CSSOMString;
    featureSettings: CSSOMString;
  }

  interface FontFaceSet extends Iterable<FontFace> {
    readonly status: FontFaceSetStatus;
    readonly ready: Promise<FontFaceSet>;
    add(font: FontFace): void;
    check(font: string, text?: string): boolean; // throws exception
    load(font: string, text?: string): Promise<FontFace[]>
    delete(font: FontFace): void;
    clear(): void;
  }
}
