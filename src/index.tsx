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
    /** Callback function to trigger before print */
    onBeforePrint?: () => void;
    /** Callback function to trigger after print */
    onAfterPrint?: () => void;
    /** Override default print window styling */
    pageStyle?: string;
    /** Optional class to pass to the print window body */
    bodyClass?: string;
}

export default class ReactToPrint extends React.Component<IReactToPrintProps> {
    triggerRef: React.RefObject<HTMLElement>;
    linkTotal: number;
    linksLoaded: Element[];
    linksErrored: Element[];

    triggerPrint = (target) => {
        const { onBeforePrint, onAfterPrint } = this.props;

        if (onBeforePrint) {
            onBeforePrint();
        }

        setTimeout(() => {
            target.contentWindow.focus();
            target.contentWindow.print();
            
            if (onAfterPrint) {
                onAfterPrint();
            }
        }, 500);
    };

    handlePrint = () => {
        const {
            bodyClass = "",
            content,
            copyStyles = true,
            pageStyle,
        } = this.props;

        const contentEl = content();

        if (contentEl === undefined) {
            console.error(`Refs are not available for stateless components. For "react-to-print" to work only Class based components can be printed`);
            return;
        }

        const printWindow = document.createElement("iframe");
        printWindow.style.position = "absolute";
        printWindow.style.top = "-1000px";
        printWindow.style.left = "-1000px";
        printWindow.id = "printWindow";

        const contentNodes = findDOMNode(contentEl);
        const linkNodes = document.querySelectorAll("link[rel='stylesheet']");

        this.linkTotal = linkNodes.length || 0;
        this.linksLoaded = [];
        this.linksErrored = [];

        const markLoaded = (linkNode, loaded) => {
            if (loaded) {
                this.linksLoaded.push(linkNode);
            } else {
                console.error(`"react-to-print" was unable to load a link. It may be invalid. "react-to-print" will continue attempting to print the page. The link the errored was:`, linkNode);
                this.linksErrored.push(linkNode);
            }

            // We may have errors, but attempt to print anyways - maybe they are trivial and the user will
            // be ok ignoring them
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

            domDoc.open();
            domDoc.write((contentNodes as HTMLCanvasElement).outerHTML);
            domDoc.close();

            /* remove date/time from top */
            const defaultPageStyle = pageStyle === undefined
                ? "@page { size: auto;  margin: 0mm; } @media print { body { -webkit-print-color-adjust: exact; } }"
                : pageStyle;

            const styleEl = domDoc.createElement("style");
            styleEl.appendChild(domDoc.createTextNode(defaultPageStyle));
            domDoc.head.appendChild(styleEl);

            if (bodyClass.length) {
                domDoc.body.classList.add(bodyClass);
            }

            const canvasEls = domDoc.querySelectorAll("canvas");
            for (let index = 0, l = canvasEls.length; index < l; ++index) {
                const node = canvasEls[index];
                node.getContext("2d").drawImage(srcCanvasEls[index] as HTMLCanvasElement, 0, 0);
            }

            if (copyStyles !== false) {
                const headEls = document.querySelectorAll("style, link[rel='stylesheet']");

                for (let index = 0, l = headEls.length; index < l; ++index) {
                    const node = headEls[index];
                    if (node.tagName === "STYLE") {
                        const newHeadEl = domDoc.createElement(node.tagName);
                        const sheet = (node as HTMLStyleElement).sheet as CSSStyleSheet;

                        if (sheet) {
                            let styleCSS = "";
                            for (let i = 0; i < sheet.cssRules.length; i++) {
                                if (typeof sheet.cssRules[i].cssText === "string") {
                                    styleCSS += `${sheet.cssRules[i].cssText}\r\n`;
                                }
                            }
                            newHeadEl.setAttribute("id", `react-to-print-${index}`);
                            newHeadEl.appendChild(domDoc.createTextNode(styleCSS));
                            domDoc.head.appendChild(newHeadEl);
                        }
                    } else {
                        // Many browsers will do all sorts of weird things if they encounter an empty `href`
                        // tag (which is invalid HTML). Some will attempt to load the current page. Some will
                        // attempt to load the page"s parent directory. These problems can cause
                        // `react-to-print` to stop  without any error being thrown. To avoid such problems we
                        // simply do not attempt to load these links.
                        if (node.hasAttribute("href") && !!node.getAttribute("href")) {
                            const newHeadEl = domDoc.createElement(node.tagName);

                            // node.attributes has NamedNodeMap type that not Array and can be iterated only via direct [i] access
                            for (let i = 0, l = node.attributes.length; i < l; ++i) {
                                const attr = node.attributes[i];
                                newHeadEl.setAttribute(attr.nodeName, attr.nodeValue);
                            }

                            newHeadEl.onload = markLoaded.bind(null, newHeadEl, true);
                            newHeadEl.onerror = markLoaded.bind(null, newHeadEl, false);
                            domDoc.head.appendChild(newHeadEl);
                        } else {
                            console.warn(`"react-to-print" encountered a <link> tag with an empty "href" attribute. In addition to being invalid HTML, this can cause problems in many browsers, and so the <link> was not loaded. The <link> is:`, node); // eslint-disable-line no-console
                            markLoaded(node, true); // `true` because we"ve already shown a warning for this
                        }
                    }
                }
            }

            if (this.linkTotal === 0 || copyStyles === false) {
                this.triggerPrint(printWindow);
            }
        };


        if (document.getElementById("printWindow")) {
            document.body.removeChild(document.getElementById("printWindow"));
        }
        document.body.appendChild(printWindow);
    };

    setRef = (ref) => {
        this.triggerRef = ref;
    };

    render() {
        const {
            trigger,
        } = this.props;

        return React.cloneElement(trigger(), {
            onClick: this.handlePrint,
            ref: this.setRef,
        });
    }
}