import * as React from "react";
import { findDOMNode } from "react-dom";

const contextEnabled = React.hasOwnProperty("createContext");
const hooksEnabled = React.hasOwnProperty("useMemo") && React.hasOwnProperty("useCallback");

export interface IPrintContextProps {
    handlePrint: () => void,
}
const PrintContext = contextEnabled ? React.createContext({} as IPrintContextProps) : null;
export const PrintContextConsumer = PrintContext ? PrintContext.Consumer : () => null;

export interface ITriggerProps<T> {
    onClick: () => void;
    ref: (v: T) => void;
}

type PropertyFunction<T> = () => T;

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
    documentTitle?: string
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
}

export default class ReactToPrint extends React.Component<IReactToPrintProps> {
    private linkTotal!: number;
    private linksLoaded!: Element[];
    private linksErrored!: Element[];

    static defaultProps = defaultProps;

    public startPrint = (target: HTMLIFrameElement) => {
        const {
            onAfterPrint,
            onPrintError,
            print,
            suppressErrors,
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
                            } else if (!suppressErrors) {
                                console.error("An error was thrown by the specified `print` function", error);
                            }
                        });
                } else if (target.contentWindow.print) {
                    // NOTE: Overrides the page's title during the print process
                    const tempTitle = document.title;
                    if (documentTitle) {
                        document.title  = documentTitle;
                    }

                    target.contentWindow.print();

                    if (documentTitle) {
                        document.title = tempTitle;
                    }

                    if (onAfterPrint) {
                        onAfterPrint();
                    }
                } else {
                    // Some browsers, such as Firefox Android, do not support printing at all
                    // https://developer.mozilla.org/en-US/docs/Web/API/Window/print
                    if (!suppressErrors) {
                        console.error("Printing for this browser is not currently possible: the browser does not have a `print` method available for iframes."); // eslint-disable-line no-console
                    }
                }

                this.handleRemoveIframe();
            } else {
                if (!suppressErrors) {
                    console.error("Printing failed because the `contentWindow` of the print iframe did not load. This is possibly an error with `react-to-print`. Please file an issue: https://github.com/gregnb/react-to-print/issues/"); // eslint-disable-line no-console
                }
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
                    .catch((error) => {
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
                    .catch((error) => {
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
            pageStyle,
            suppressErrors,
        } = this.props;

        const contentEl = content();

        if (contentEl === undefined) {
            if (!suppressErrors) {
                console.error('For "react-to-print" to work only Class based components can be printed.'); // eslint-disable-line no-console
            }
            return;
        }

        if (contentEl === null) {
            if (!suppressErrors) {
                console.error('There is nothing to print because the "content" prop returned "null". Please ensure "content" is renderable before allowing "react-to-print" to be called.'); // eslint-disable-line no-console
            }
            return;
        }

        const printWindow = document.createElement("iframe");
        printWindow.style.position = "absolute";
        printWindow.style.top = "-1000px";
        printWindow.style.left = "-1000px";
        printWindow.id = "printWindow";
        printWindow.title = "Print Window";

        const contentNodes = findDOMNode(contentEl);

        if (!contentNodes) {
            if (!suppressErrors) {
                console.error('"react-to-print" could not locate the DOM node corresponding with the `content` prop'); // eslint-disable-line no-console
            }
            return;
        }

        const globalStyleLinkNodes = document.querySelectorAll("link[rel='stylesheet']");
        const renderComponentImgNodes = (contentNodes as Element).querySelectorAll("img")

        this.linkTotal = globalStyleLinkNodes.length + renderComponentImgNodes.length;
        this.linksLoaded = [];
        this.linksErrored = [];

        const markLoaded = (linkNode: Element, loaded: boolean) => {
            if (loaded) {
                this.linksLoaded.push(linkNode);
            } else {
                if (!suppressErrors) {
                    console.error('"react-to-print" was unable to load a linked node. It may be invalid. "react-to-print" will continue attempting to print the page. The linked node that errored was:', linkNode); // eslint-disable-line no-console
                }
                this.linksErrored.push(linkNode);
            }

            // We may have errors, but attempt to print anyways - maybe they are trivial and the
            // user will be ok ignoring them
            if (this.linksLoaded.length + this.linksErrored.length === this.linkTotal) {
                this.triggerPrint(printWindow);
            }
        };

        printWindow.onload = () => {
            // Some agents, such as IE11 and Enzyme (as of 2 Jun 2020) continuously call the
            // `onload` callback. This ensures that it is only called once.
            printWindow.onload = null;

            const domDoc = printWindow.contentDocument || printWindow.contentWindow?.document;
            const srcCanvasEls = (contentNodes as HTMLCanvasElement).querySelectorAll("canvas");
            if (domDoc) {
                domDoc.open();
                domDoc.write((contentNodes as HTMLCanvasElement).outerHTML);
                domDoc.close();

                const defaultPageStyle = typeof pageStyle === "function" ? pageStyle() : pageStyle;

                const styleEl = domDoc.createElement("style");
                // TODO: TS 3 should have removed the need for the `!`, so why is it still needed?
                // https://github.com/Microsoft/TypeScript/issues/23812
                styleEl.appendChild(domDoc.createTextNode(defaultPageStyle!));
                domDoc.head.appendChild(styleEl);

                if (bodyClass) {
                    domDoc.body.classList.add(bodyClass);
                }

                const canvasEls = domDoc.querySelectorAll("canvas");
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
                        if (!suppressErrors) {
                            console.warn('"react-to-print" encountered an <img> tag with an empty "src" attribute. It will not attempt to pre-load it. The <img> is:', imgNode); // eslint-disable-line no-console
                        }
                    } else {
                        // https://stackoverflow.com/questions/10240110/how-do-you-cache-an-image-in-javascript
                        const img = new Image();
                        img.onload = markLoaded.bind(null, imgNode, true);
                        img.onerror = markLoaded.bind(null, imgNode, false);
                        img.src = imgSrc;
                    }
                }

                if (copyStyles) {
                    const headEls = document.querySelectorAll("style, link[rel='stylesheet']");

                    for (let i = 0, headElsLen = headEls.length; i < headElsLen; ++i) {
                        const node = headEls[i];
                        if (node.tagName === "STYLE") {
                            const newHeadEl = domDoc.createElement(node.tagName);
                            const sheet = (node as HTMLStyleElement).sheet as CSSStyleSheet;

                            if (sheet) {
                                let styleCSS = "";
                                // NOTE: for-of is not supported by IE
                                for (let j = 0, cssLen = sheet.cssRules.length; j < cssLen; ++j) {
                                    if (typeof sheet.cssRules[j].cssText === "string") {
                                        styleCSS += `${sheet.cssRules[j].cssText}\r\n`;
                                    }
                                }
                                newHeadEl.setAttribute("id", `react-to-print-${i}`);
                                newHeadEl.appendChild(domDoc.createTextNode(styleCSS));
                                domDoc.head.appendChild(newHeadEl);
                            }
                        } else {
                            // Many browsers will do all sorts of weird things if they encounter an
                            // empty `href` tag (which is invalid HTML). Some will attempt to load
                            // the current page. Some will attempt to load the page"s parent
                            // directory. These problems can cause `react-to-print` to stop without
                            // any error being thrown. To avoid such problems we simply do not
                            // attempt to load these links.
                            if (node.getAttribute("href")) {
                                const newHeadEl = domDoc.createElement(node.tagName);

                                // node.attributes has NamedNodeMap type that is not an Array and
                                // can be iterated only via direct [i] access
                                for (let j = 0, attrLen = node.attributes.length; j < attrLen; ++j) { // eslint-disable-line  max-len
                                    const attr = node.attributes[j];
                                    if (attr) {
                                        newHeadEl.setAttribute(attr.nodeName, attr.nodeValue || "");
                                    }
                                }

                                newHeadEl.onload = markLoaded.bind(null, newHeadEl, true);
                                newHeadEl.onerror = markLoaded.bind(null, newHeadEl, false);
                                domDoc.head.appendChild(newHeadEl);
                            } else {
                                if (!suppressErrors) {
                                    console.warn('"react-to-print" encountered a <link> tag with an empty "href" attribute. In addition to being invalid HTML, this can cause problems in many browsers, and so the <link> was not loaded. The <link> is:', node); // eslint-disable-line no-console
                                }
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

        const documentPrintWindow = document.getElementById("printWindow");
        if (documentPrintWindow) {
            document.body.removeChild(documentPrintWindow);
        }

        document.body.appendChild(printWindow);
    }

    public handleRemoveIframe = () => {
        const {
            removeAfterPrint,
        } = this.props;

        if (removeAfterPrint) {
            // The user may have removed the iframe in `onAfterPrint`
            const documentPrintWindow = document.getElementById("printWindow");
            if (documentPrintWindow) {
                document.body.removeChild(documentPrintWindow);
            }
        }
    }

    public render() {
        const {
            children,
            suppressErrors,
            trigger,
        } = this.props;

        if (trigger) {
            return React.cloneElement(trigger(), {
                onClick: this.handleClick,
            });
        } else {
            const value = {handlePrint: this.handleClick};
            if (!PrintContext) {
                if (!suppressErrors) {
                    console.error('"react-to-print" requires React ^16.3.0 to be able to use "PrintContext"'); // eslint-disable-line no-console
                }
                return null;
            }

            return PrintContext ?
                <PrintContext.Provider value={value as IPrintContextProps}>
                    {children}
                </PrintContext.Provider> :
                <h2>lorem</h2>
        }
    }
}

export const useReactToPrint = hooksEnabled ?
    (props: IReactToPrintProps) => {
        const entity = React.useMemo(
            // TODO: is there a better way of applying the defaultProps?
            () => new ReactToPrint({ ...defaultProps, ...props }),
            [props]
        );

        return React.useCallback(() => entity.handleClick(), [entity]);
    } :
    (props: IReactToPrintProps) => {
        if (!props.suppressErrors) {
            console.warn('"react-to-print" requires React ^16.8.0 to be able to use "useReactToPrint"'); // eslint-disable-line no-console
        }
        return undefined;
    };
