import * as React from "react";
import { findDOMNode } from "react-dom";

export interface ITriggerProps<T> {
    onClick: () => void;
    ref: (v: T) => void;
}

export interface IReactToPrintProps {
    /** Trigger action used to open browser print */
    trigger: <T>() => React.ReactElement<ITriggerProps<T>>;
    /** Content to be printed */
    content: () => React.ReactInstance;
    /** Copy styles over into print window. default: true */
    copyStyles?: boolean;
    /** Callback function to trigger before page content is retrieved for printing */
    onBeforeGetContent?: () => void | Promise<any>;
    /** Callback function to trigger before print */
    onBeforePrint?: () => void | Promise<any>;
    /** Callback function to trigger after print */
    onAfterPrint?: () => void;
    /** Callback function to listen for printing errors */
    onPrintError?: (errorLocation: string, error: Error) => void;
    /** Override default print window styling */
    pageStyle?: string;
    /** Optional class to pass to the print window body */
    bodyClass?: string;
    /** Optional - remove the iframe after printing. */
    removeAfterPrint?: boolean;
    /** Optional - suppress error messages */
    suppressErrors?: boolean;
}

export default class ReactToPrint extends React.Component<IReactToPrintProps> {
    private linkTotal: number;
    private linksLoaded: Element[];
    private linksErrored: Element[];

    public startPrint = (target: any, onAfterPrint: any) => {
        const { removeAfterPrint } = this.props;

        setTimeout(() => {
            target.contentWindow.focus();
            target.contentWindow.print();
            if (onAfterPrint) {
                onAfterPrint();
            }
            if (removeAfterPrint) {
                // The user may have removed the iframe in `onAfterPrint`
                const documentPrintWindow = document.getElementById("printWindow");
                if (documentPrintWindow) {
                    document.body.removeChild(documentPrintWindow);
                }
            }
        }, 500);
    }

    public triggerPrint = (target: any) => {
        const {
            onAfterPrint,
            onBeforePrint,
            onPrintError,
        } = this.props;

        if (onBeforePrint) {
            const onBeforePrintOutput = onBeforePrint();
            if (onBeforePrintOutput && typeof onBeforePrintOutput.then === "function") {
                onBeforePrintOutput
                    .then(() => {
                        this.startPrint(target, onAfterPrint);
                    })
                    .catch((error) => {
                        if (onPrintError) {
                            onPrintError("onBeforePrint", error);
                        }
                    });
            } else {
                this.startPrint(target, onAfterPrint);
            }
        } else {
            this.startPrint(target, onAfterPrint);
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
            bodyClass = "",
            content,
            copyStyles = true,
            pageStyle,
            suppressErrors,
        } = this.props;

        const contentEl = content();

        if (contentEl === undefined) {
            if (!suppressErrors) {
                console.error('Refs are not available for stateless components. For "react-to-print" to work only Class based components can be printed'); // tslint:disable-line max-line-length no-console
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
        const linkNodes = document.querySelectorAll("link[rel='stylesheet'], img");

        this.linkTotal = linkNodes.length || 0;
        this.linksLoaded = [];
        this.linksErrored = [];

        const markLoaded = (linkNode: any, loaded: boolean) => {
            if (loaded) {
                this.linksLoaded.push(linkNode);
            } else {
                if (!suppressErrors) {
                    console.error('"react-to-print" was unable to load a link. It may be invalid. "react-to-print" will continue attempting to print the page. The link the errored was:', linkNode); // tslint:disable-line max-line-length no-console
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
            /* IE11 support */
            if (window.navigator && window.navigator.userAgent.indexOf("Trident/7.0") > -1) {
                printWindow.onload = null;
            }

            const domDoc = printWindow.contentDocument || printWindow.contentWindow.document;
            const srcCanvasEls = (contentNodes as HTMLCanvasElement).querySelectorAll("canvas");
            if (domDoc) {
                domDoc.open();
                domDoc.write((contentNodes as HTMLCanvasElement).outerHTML);
                domDoc.close();

                /* remove date/time from top */
                const defaultPageStyle = pageStyle === undefined
                    ? "@page { size: auto;  margin: 0mm; } @media print { body { -webkit-print-color-adjust: exact; } }" // tslint:disable-line max-line-length
                    : pageStyle;

                const styleEl = domDoc.createElement("style");
                styleEl.appendChild(domDoc.createTextNode(defaultPageStyle));
                domDoc.head.appendChild(styleEl);

                if (bodyClass.length) {
                    domDoc.body.classList.add(bodyClass);
                }

                const canvasEls = domDoc.querySelectorAll("canvas");
                for (let i = 0, canvasElsLen = canvasEls.length; i < canvasElsLen; ++i) {
                    const node = canvasEls[i];
                    const contentDrawImage = node.getContext("2d");
                    if (contentDrawImage) {
                        contentDrawImage.drawImage(srcCanvasEls[i] as HTMLCanvasElement, 0, 0);
                    }
                }

                if (copyStyles !== false) {
                    const headEls = document.querySelectorAll("style, link[rel='stylesheet'], img");

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
                            // attempt to load these links. `img` tags with empty `src` attributes
                            // are also invalid, so we do not attempt to load them.
                            if (node.hasAttribute("href") && !!node.getAttribute("href") ||
                                (node.hasAttribute("src") && !!node.getAttribute("src"))
                            ) {
                                const newHeadEl = domDoc.createElement(node.tagName);

                                // node.attributes has NamedNodeMap type that is not an Array and
                                // can be iterated only via direct [i] access
                                for (let j = 0, attrLen = node.attributes.length; j < attrLen; ++j) { // tslint:disable-line max-line-length
                                    const attr = node.attributes[j];
                                    if (attr) {
                                        newHeadEl.setAttribute(attr.nodeName, attr.nodeValue || "");
                                    }
                                }

                                newHeadEl.onload = markLoaded.bind(null, newHeadEl, true);
                                newHeadEl.onerror = markLoaded.bind(null, newHeadEl, false);
                                domDoc.head.appendChild(newHeadEl);
                            } else {
                                console.warn('"react-to-print" encountered a <link> tag with an empty "href" attribute. In addition to being invalid HTML, this can cause problems in many browsers, and so the <link> was not loaded. The <link> is:', node); // tslint:disable-line max-line-length no-console
                                // `true` because we"ve already shown a warning for this
                                markLoaded(node, true);
                            }
                        }
                    }
                }
            }

            if (this.linkTotal === 0 || copyStyles === false) {
                this.triggerPrint(printWindow);
            }
        };

        const documentPrintWindow = document.getElementById("printWindow");
        if (documentPrintWindow) {
            document.body.removeChild(documentPrintWindow);
        }

        document.body.appendChild(printWindow);
    }

    public render() {
        const {
            trigger,
        } = this.props;

        return React.cloneElement(trigger(), {
            onClick: this.handleClick,
        });
    }
}
