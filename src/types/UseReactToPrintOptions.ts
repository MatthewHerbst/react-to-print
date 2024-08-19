import { RefObject } from "react";
import type { Font } from "./font";

/** Options for `useReactToPrint` */
export interface UseReactToPrintOptions {
    /** One or more class names to pass to the print window, separated by spaces */
    bodyClass?: string;
    /**
     * The ref pointing to the content to be printed. Alternatively, pass the ref directly to the
     * callback returned by `useReactToPrint`
     */
    contentRef?: RefObject<Element | Text>;
    /** Set the title for printing when saving as a file. Ignored when passing a custom `print` option */
    documentTitle?: string;
    /** A list of fonts to load into the printing iframe. This is useful if you are using custom fonts */
    fonts?: Font[];
    /** Ignore all `<style>` and `<link type="stylesheet" />` tags from `<head>` */
    ignoreGlobalStyles?: boolean;
    /**
     * Set the [`nonce`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/nonce)
     * attribute for allow-listing script and style elements for Content Security Policy (CSP)
     */
    nonce?: string;
    /**
     * Callback function that triggers after the print dialog is closed _regardless of if the user
     * selected to print or cancel_
     */
    onAfterPrint?: () => void;
    /**
     * Callback function that triggers before print. This can be used to change the content on the
     * page before printing as an alternative to, or in conjunction with `@media print` queries. Is
     * run prior to the print iframe being mounted.
     */
    onBeforePrint?: () => Promise<void>;
    /**
     * Called if there is a printing error serious enough that printing cannot continue. Currently
     * limited to Promise rejections in `onBeforePrint`, and `print`. Use this to attempt to print
     * again. `errorLocation` will tell you where the Promise was rejected
     */
    onPrintError?: (errorLocation: "onBeforePrint" | "print", error: Error) => void;
    /**
     * `react-to-print` sets some basic styles to help improve page printing, notably, removing the
     * header and footer that most browsers add. Use this to override these styles and provide your own
     */
    pageStyle?: string;
    /**
     * Preserve the print iframe after printing. This can be useful for debugging by inspecting the
     * print iframe
     */
    preserveAfterPrint?: boolean;
    /**
     * If passed, this function will be used instead of `window.print` to print the content. Use
     * this to print in non-browser environments such as Electron
     */
    print?: (target: HTMLIFrameElement) => Promise<any>;
    /** When passed, prevents `console` logging of errors */
    suppressErrors?: boolean;
    /** When passed, shadow root content will be copied */
    copyShadowRoots?: boolean;
}
