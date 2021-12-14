import * as React from "react";
import { findDOMNode } from "react-dom";

const contextEnabled = Object.prototype.hasOwnProperty.call(React, "createContext");
const hooksEnabled = Object.prototype.hasOwnProperty.call(React, "useMemo") && Object.prototype.hasOwnProperty.call(React, "useCallback");

export interface IPrintContextProps {
    handlePrint: () => void,
}
const PrintContext = contextEnabled ? React.createContext({} as IPrintContextProps) : null;
export const PrintContextConsumer = PrintContext ? PrintContext.Consumer : () => null;

export interface ITriggerProps<T> {
    onClick: () => void;
    ref: (v: T) => void;
}

// https://developer.mozilla.org/en-US/docs/Web/API/FontFace/FontFace
type Font = {
    family: string;
    source: string;
};

type PropertyFunction<T> = () => T;

// NOTE: https://github.com/Microsoft/TypeScript/issues/23812
const defaultProps = {
    copyStyles: true,
    pageStyle: "@page { size: auto;  margin: 0mm; } @media print { body { -webkit-print-color-adjust: exact; } }", // remove date/time from top
    removeAfterPrint: false,
    suppressErrors: false,
};

export interface IReactToPrintProps {
    /** Class to pass to the print window body */
    bodyClass?: string;
    /** Content to be printed */
    content: () => React.ReactInstance | null;
    /** Copy styles over into print window. default: true */
    copyStyles?: boolean;
    /** Set the title for printing when saving as a file */
    documentTitle?: string;
    /** */
    fonts?: Font[];
    /** Callback function to trigger after print */
    onAfterPrint?: () => void;
    /** Callback function to trigger before page content is retrieved for printing */
    onBeforeGetContent?: () => void | Promise<any>;
    /** Callback function to trigger before print */
    onBeforePrint?: () => void | Promise<any>;
    /** Callback function to listen for printing errors */
    onPrintError?: (errorLocation: "onBeforeGetContent" | "onBeforePrint" | "print", error: Error) => void;
    /** Override default print window styling */
    pageStyle?: string | PropertyFunction<string>;
    /** Override the default `window.print` method that is used for printing */
    print?: (target: HTMLIFrameElement) => Promise<any>;
    /** Remove the iframe after printing. */
    removeAfterPrint?: boolean;
    /** Suppress error messages */
    suppressErrors?: boolean;
    /** Trigger action used to open browser print */
    trigger?: <T>() => React.ReactElement<ITriggerProps<T>>;
    /** Set the nonce attribute for whitelisting script and style -elements for CSP (content security policy) */
    nonce?: string;
}

export default class ReactToPrint extends React.Component<IReactToPrintProps> {
    private linkTotal!: number;
    private linksLoaded!: Element[];
    private linksErrored!: Element[];
    private fontsLoaded!: FontFace[];
    private fontsErrored!: FontFace[];

    static defaultProps = defaultProps;

    public startPrint = (target: HTMLIFrameElement) => {
        const {
            onAfterPrint,
            onPrintError,
            print,
            documentTitle,
        } = this.props;

        setTimeout(() => {
            if (target.contentWindow) {
                target.contentWindow.focus(); // Needed for IE 11

                if (print) {
                    print(target)
                        .then(this.handleRemoveIframe)
                        .catch((error: Error) => {
                            if (onPrintError) {
                                onPrintError('print', error);
                            } else {
                                this.logMessages(["An error was thrown by the specified `print` function"]);
                            }
                        });
                } else if (target.contentWindow.print) {
                    const tempContentDocumentTitle = target.contentDocument?.title ?? '';
                    const tempOwnerDocumentTitle = target.ownerDocument.title;

                    // Override page and various target content titles during print
                    // NOTE: some browsers seem to take the print title from the highest level
                    // title, while others take it from the lowest level title. So, we set the title
                    // in a few places and hope the current browser takes one of them :pray:
                    if (documentTitle) {
                        // Print filename in Chrome
                        target.ownerDocument.title = documentTitle;

                        // Print filename in Firefox, Safari
                        if (target.contentDocument) {
                            target.contentDocument.title = documentTitle;
                        }
                    }

                    target.contentWindow.print();

                    // Restore the page's original title information
                    if (documentTitle) {
                        target.ownerDocument.title = tempOwnerDocumentTitle;

                        if (target.contentDocument) {
                            target.contentDocument.title = tempContentDocumentTitle;
                        }
                    }

                    if (onAfterPrint) {
                        onAfterPrint();
                    }
                } else {
                    // Some browsers, such as Firefox Android, do not support printing at all
                    // https://developer.mozilla.org/en-US/docs/Web/API/Window/print
                    this.logMessages(["Printing for this browser is not currently possible: the browser does not have a `print` method available for iframes."]);
                }

                this.handleRemoveIframe();
            } else {
                this.logMessages(["Printing failed because the `contentWindow` of the print iframe did not load. This is possibly an error with `react-to-print`. Please file an issue: https://github.com/gregnb/react-to-print/issues/"]);
            }
        }, 500);
    }

    public triggerPrint = (target: HTMLIFrameElement) => {
        const {
            onBeforePrint,
            onPrintError,
        } = this.props;

        if (onBeforePrint) {
            const onBeforePrintOutput = onBeforePrint();
            if (onBeforePrintOutput && typeof onBeforePrintOutput.then === "function") {
                onBeforePrintOutput
                    .then(() => {
                        this.startPrint(target);
                    })
                    .catch((error: Error) => {
                        if (onPrintError) {
                            onPrintError("onBeforePrint", error);
                        }
                    });
            } else {
                this.startPrint(target);
            }
        } else {
            this.startPrint(target);
        }
    }

    public handleClick = () => {
        const {
            onBeforeGetContent,
            onPrintError,
        } = this.props;

        if (onBeforeGetContent) {
            const onBeforeGetContentOutput = onBeforeGetContent();
            if (onBeforeGetContentOutput && typeof onBeforeGetContentOutput.then === "function") {
                onBeforeGetContentOutput
                    .then(this.handlePrint)
                    .catch((error: Error) => {
                        if (onPrintError) {
                            onPrintError("onBeforeGetContent", error);
                        }
                    });
            } else {
                this.handlePrint();
            }
        } else {
            this.handlePrint();
        }
    }

    public handlePrint = () => {
        const {
            bodyClass,
            content,
            copyStyles,
            fonts,
            pageStyle,
            nonce,
        } = this.props;

        const contentEl = content();

        if (contentEl === undefined) {
            this.logMessages(['To print a functional component ensure it is wrapped with `React.forwardRef`, and ensure the forwarded ref is used. See the README for an example: https://github.com/gregnb/react-to-print#examples']); // eslint-disable-line max-len
            return;
        }

        if (contentEl === null) {
            this.logMessages(['There is nothing to print because the "content" prop returned "null". Please ensure "content" is renderable before allowing "react-to-print" to be called.']); // eslint-disable-line max-len
            return;
        }

        const printWindow = document.createElement("iframe");
        printWindow.style.position = "absolute";
        printWindow.style.top = "-1000px";
        printWindow.style.left = "-1000px";
        printWindow.id = "printWindow";

        const contentNodes = findDOMNode(contentEl);

        if (!contentNodes) {
            this.logMessages(['"react-to-print" could not locate the DOM node corresponding with the `content` prop']); // eslint-disable-line max-len
            return;
        }

        // React components can return a bare string as a valid JSX response
        const isText = contentNodes instanceof Text;

        const globalStyleLinkNodes = document.querySelectorAll("link[rel='stylesheet']");
        const renderComponentImgNodes = isText ? [] : contentNodes.querySelectorAll("img")

        this.linkTotal = globalStyleLinkNodes.length + renderComponentImgNodes.length;
        this.linksLoaded = [];
        this.linksErrored = [];
        this.fontsLoaded = [];
        this.fontsErrored = [];

        const markLoaded = (linkNode: Element, loaded: boolean) => {
            if (loaded) {
                this.linksLoaded.push(linkNode);
            } else {
                this.logMessages(['"react-to-print" was unable to load a linked node. It may be invalid. "react-to-print" will continue attempting to print the page. The linked node that errored was:', linkNode]); // eslint-disable-line max-len
                this.linksErrored.push(linkNode);
            }

            // We may have errors, but attempt to print anyways - maybe they are trivial and the
            // user will be ok ignoring them
            const numResourcesManaged =
                this.linksLoaded.length +
                this.linksErrored.length +
                this.fontsLoaded.length +
                this.fontsErrored.length;

            if (numResourcesManaged === this.linkTotal) {
                this.triggerPrint(printWindow);
            }
        };

        printWindow.onload = () => {
            // Some agents, such as IE11 and Enzyme (as of 2 Jun 2020) continuously call the
            // `onload` callback. This ensures that it is only called once.
            printWindow.onload = null;

            const domDoc = printWindow.contentDocument || printWindow.contentWindow?.document;

            if (domDoc) {
                domDoc.body.appendChild(contentNodes.cloneNode(true));

                if (fonts) {
                    if (printWindow.contentDocument?.fonts && printWindow.contentWindow?.FontFace) {
                        fonts.forEach((font) => {
                            const fontFace = new FontFace(font.family, font.source);
                            printWindow.contentDocument!.fonts.add(fontFace);
                            fontFace.loaded
                                .then((loadedFontFace) => {
                                    this.fontsLoaded.push(loadedFontFace);
                                })
                                .catch((error: SyntaxError) => {
                                    this.fontsErrored.push(fontFace);
                                    this.logMessages(['"react-to-print" was unable to load a font. "react-to-print" will continue attempting to print the page. The font that failed to load is:', fontFace, 'The error from loading the font is:', error]); // eslint-disable-line max-len
                                });
                        });
                    } else {
                        this.logMessages(['"react-to-print" is not able to load custom fonts because the browser does not support the FontFace API']); // eslint-disable-line max-len
                    }
                }

                const defaultPageStyle = typeof pageStyle === "function" ? pageStyle() : pageStyle;

                if (typeof defaultPageStyle !== 'string') {
                    this.logMessages([`"react-to-print" expected a "string" from \`pageStyle\` but received "${typeof defaultPageStyle}". Styles from \`pageStyle\` will not be applied.`]); // eslint-disable-line max-len
                } else {
                    const styleEl = domDoc.createElement("style");
                    if (nonce) {
                        styleEl.setAttribute("nonce", nonce);
                        domDoc.head.setAttribute("nonce", nonce);
                    }
                    styleEl.appendChild(domDoc.createTextNode(defaultPageStyle));
                    domDoc.head.appendChild(styleEl);
                }

                if (bodyClass) {
                    domDoc.body.classList.add(...bodyClass.split(" "));
                }

                if (!isText) {
                    // Copy all canvases
                    const canvasEls = domDoc.querySelectorAll("canvas");
                    const srcCanvasEls = (contentNodes as HTMLCanvasElement).querySelectorAll("canvas");
                    for (let i = 0, canvasElsLen = canvasEls.length; i < canvasElsLen; ++i) {
                        const node = canvasEls[i];
                        const contentDrawImage = node.getContext("2d");
                        if (contentDrawImage) {
                            contentDrawImage.drawImage(srcCanvasEls[i], 0, 0);
                        }
                    }

                    // Pre-load all images
                    for (let i = 0; i < renderComponentImgNodes.length; i++) {
                        const imgNode = renderComponentImgNodes[i];
                        const imgSrc = imgNode.getAttribute("src");

                        if (!imgSrc) {
                            this.logMessages(['"react-to-print" encountered an <img> tag with an empty "src" attribute. It will not attempt to pre-load it. The <img> is:', imgNode], 'warning'); // eslint-disable-line
                            markLoaded(imgNode, false);
                        } else {
                            // https://stackoverflow.com/questions/10240110/how-do-you-cache-an-image-in-javascript
                            const img = new Image();
                            img.onload = markLoaded.bind(null, imgNode, true);
                            img.onerror = markLoaded.bind(null, imgNode, false);
                            img.src = imgSrc;
                        }
                    }

                    // Copy input values
                    // This covers most input types, though some need additional work (further down)
                    const inputSelector = 'input';
                    const originalInputs = (contentNodes as HTMLElement).querySelectorAll(inputSelector); // eslint-disable-line max-len
                    const copiedInputs = domDoc.querySelectorAll(inputSelector);
                    for (let i = 0; i < originalInputs.length; i++) {
                        copiedInputs[i].value = originalInputs[i].value;
                    }

                    // Copy checkbox, radio checks
                    const checkedSelector = 'input[type=checkbox],input[type=radio]';
                    const originalCRs = (contentNodes as HTMLElement).querySelectorAll(checkedSelector); // eslint-disable-line max-len
                    const copiedCRs = domDoc.querySelectorAll(checkedSelector);
                    for (let i = 0; i < originalCRs.length; i++) {
                        (copiedCRs[i] as HTMLInputElement).checked =
                        (originalCRs[i] as HTMLInputElement).checked;
                    }

                    // Copy select states
                    const selectSelector = 'select';
                    const originalSelects = (contentNodes as HTMLElement).querySelectorAll(selectSelector); // eslint-disable-line max-len
                    const copiedSelects = domDoc.querySelectorAll(selectSelector);
                    for (let i = 0; i < originalSelects.length; i++) {
                        copiedSelects[i].value = originalSelects[i].value;
                    }
                }

                if (copyStyles) {
                    const headEls = document.querySelectorAll("style, link[rel='stylesheet']");
                    for (let i = 0, headElsLen = headEls.length; i < headElsLen; ++i) {
                        const node = headEls[i];
                        if (node.tagName === "STYLE") { // <style> nodes
                            const newHeadEl = domDoc.createElement(node.tagName);
                            const sheet = (node as HTMLStyleElement).sheet as CSSStyleSheet;
                            if (sheet) {
                                let styleCSS = "";
                                // NOTE: for-of is not supported by IE
                                try {
                                    // Accessing `sheet.cssRules` on cross-origin sheets can throw
                                    // security exceptions in some browsers, notably Firefox
                                    // https://github.com/gregnb/react-to-print/issues/429
                                    const cssLength = sheet.cssRules.length;
                                    for (let j = 0; j < cssLength; ++j) {
                                        if (typeof sheet.cssRules[j].cssText === "string") {
                                            styleCSS += `${sheet.cssRules[j].cssText}\r\n`;
                                        }
                                    }
                                } catch (error) {
                                    this.logMessages([`A stylesheet could not be accessed. This is likely due to the stylesheet having cross-origin imports, and many browsers block script access to cross-origin stylesheets. See https://github.com/gregnb/react-to-print/issues/429 for details. You may be able to load the sheet by both marking the stylesheet with the cross \`crossorigin\` attribute, and setting the \`Access-Control-Allow-Origin\` header on the server serving the stylesheet. Alternatively, host the stylesheet on your domain to avoid this issue entirely.`, node], 'warning');
                                }

                                newHeadEl.setAttribute("id", `react-to-print-${i}`);
                                if (nonce) {
                                    newHeadEl.setAttribute("nonce", nonce);
                                }
                                newHeadEl.appendChild(domDoc.createTextNode(styleCSS));
                                domDoc.head.appendChild(newHeadEl);
                            }
                        } else { // <link> nodes, and any others
                            // Many browsers will do all sorts of weird things if they encounter an
                            // empty `href` tag (which is invalid HTML). Some will attempt to load
                            // the current page. Some will attempt to load the page"s parent
                            // directory. These problems can cause `react-to-print` to stop without
                            // any error being thrown. To avoid such problems we simply do not
                            // attempt to load these links.
                            if (node.getAttribute("href")) {
                                const newHeadEl = domDoc.createElement(node.tagName);

                                // Manually re-create the node
                                // TODO: document why cloning the node won't work? I don't recall
                                // the reasoning behind why we do it this way
                                // NOTE: node.attributes has NamedNodeMap type that is not an Array
                                // and can be iterated only via direct [i] access
                                for (let j = 0, attrLen = node.attributes.length; j < attrLen; ++j) { // eslint-disable-line max-len
                                    const attr = node.attributes[j];
                                    if (attr) {
                                        newHeadEl.setAttribute(attr.nodeName, attr.nodeValue || "");
                                    }
                                }

                                newHeadEl.onload = markLoaded.bind(null, newHeadEl, true);
                                newHeadEl.onerror = markLoaded.bind(null, newHeadEl, false);
                                if (nonce) {
                                    newHeadEl.setAttribute("nonce", nonce);
                                }
                                domDoc.head.appendChild(newHeadEl);
                            } else {
                                this.logMessages(['"react-to-print" encountered a <link> tag with an empty "href" attribute. In addition to being invalid HTML, this can cause problems in many browsers, and so the <link> was not loaded. The <link> is:', node], 'warning')
                                // `true` because we"ve already shown a warning for this
                                markLoaded(node, true);
                            }
                        }
                    }
                }
            }

            if (this.linkTotal === 0 || !copyStyles) {
                this.triggerPrint(printWindow);
            }
        };

        this.handleRemoveIframe(true);
        document.body.appendChild(printWindow);
    }

    public handleRemoveIframe = (force?: boolean) => {
        const {
            removeAfterPrint,
        } = this.props;

        if (force || removeAfterPrint) {
            // The user may have removed the iframe in `onAfterPrint`
            const documentPrintWindow = document.getElementById("printWindow");
            if (documentPrintWindow) {
                document.body.removeChild(documentPrintWindow);
            }
        }
    }

    public logMessages = (messages: unknown[], level: 'error' | 'warning' = 'error') => {
        const {
            suppressErrors,
        } = this.props;

        if (!suppressErrors) {
            if (level === 'error') {
                console.error(messages); // eslint-disable-line no-console
            } else if (level === 'warning') {
                console.warn(messages); // eslint-disable-line no-console
            }
        }
    }

    public render() {
        const {
            children,
            trigger,
        } = this.props;

        if (trigger) {
            return React.cloneElement(trigger(), {
                onClick: this.handleClick,
            });
        } else {
            if (!PrintContext) {
                this.logMessages(['"react-to-print" requires React ^16.3.0 to be able to use "PrintContext"']);

                return null;
            }

            const value = { handlePrint: this.handleClick };

            return (
                <PrintContext.Provider value={value as IPrintContextProps}>
                    {children}
                </PrintContext.Provider>
            );
        }
    }
}

type UseReactToPrintHookReturn = () => void;

export const useReactToPrint = (props: IReactToPrintProps): UseReactToPrintHookReturn => {
    if (!hooksEnabled) {
        if (!props.suppressErrors) {
            console.error('"react-to-print" requires React ^16.8.0 to be able to use "useReactToPrint"'); // eslint-disable-line no-console
        }

        return () => {
            throw new Error('"react-to-print" requires React ^16.8.0 to be able to use "useReactToPrint"');
        };
    }

    const reactToPrint = React.useMemo(
        // TODO: is there a better way of applying the defaultProps?
        () => new ReactToPrint({ ...defaultProps, ...props }),
        [props]
    );

    return React.useCallback(() => reactToPrint.handleClick(), [reactToPrint]);
};
