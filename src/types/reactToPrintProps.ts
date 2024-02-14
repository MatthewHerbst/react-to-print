import type { Font } from "./font";

export interface ITriggerProps<T> {
    onClick: (event?: unknown) => void;
    ref: (v: T) => void;
}

export interface IReactToPrintProps {
    /** Class to pass to the print window body */
    bodyClass?: string;
    children?: React.ReactNode;
    /** Content to be printed */
    content?: () => React.ReactInstance | null;
    /** Copy styles over into print window. default: true */
    copyStyles?: boolean;
    /**
     * Set the title for printing when saving as a file.
     * Will result in the calling page's `<title>` being temporarily changed while printing.
     */
    documentTitle?: string;
    /** Pre-load these fonts to ensure availability when printing */
    fonts?: Font[];
    /** Set the nonce attribute for whitelisting script and style -elements for CSP (content security policy) */
    nonce?: string;
    /** Callback function to trigger after print */
    onAfterPrint?: () => void;
    /** Callback function to trigger before page content is retrieved for printing */
    onBeforeGetContent?: () => void | Promise<any>;
    /** Callback function to trigger before print */
    onBeforePrint?: () => void | Promise<any>;
    /** Callback function to listen for printing errors */
    onPrintError?: (errorLocation: "onBeforeGetContent" | "onBeforePrint" | "print", error: Error) => void;
    /** Override default print window styling */
    pageStyle?: string | (() => string);
    /** Override the default `window.print` method that is used for printing */
    print?: (target: HTMLIFrameElement) => Promise<any>;
    /**
     * Remove the iframe after printing.
     * NOTE: `onAfterPrint` will run before the iframe is removed
     */
    removeAfterPrint?: boolean;
    /** Suppress error messages */
    suppressErrors?: boolean;
    /** Trigger action used to open browser print */
    trigger?: <T>() => React.ReactElement<ITriggerProps<T>>;
}