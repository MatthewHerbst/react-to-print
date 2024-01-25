import * as React from "react";
import { findDOMNode } from "react-dom";

const contextEnabled = Object.prototype.hasOwnProperty.call(React, "createContext");
const hooksEnabled = Object.prototype.hasOwnProperty.call(React, "useMemo") && Object.prototype.hasOwnProperty.call(React, "useCallback");

export interface IPrintContextProps {
    handlePrint: (event: React.MouseEvent, content?: (() => React.ReactInstance | null)) => void,
}
const PrintContext = contextEnabled ? React.createContext({} as IPrintContextProps) : null;
export const PrintContextConsumer = PrintContext ? PrintContext.Consumer : () => null;

export interface ITriggerProps<T> {
    onClick: (event?: React.MouseEvent) => void;
    ref: (v: T) => void;
}

// https://developer.mozilla.org/en-US/docs/Web/API/FontFace/FontFace
type Font = {
    family: string;
    source: string;
    weight?: string;
    style?: string;
};

type PropertyFunction<T> = () => T;

/**
 * This function helps to curry arguments to a bound function
 * and partially apply them at the end of the argument list. 
 * 
 * @param {Object} thisArg 
 * @param {Function} callback 
 * @param {Array.<*>} predefinedArgs
 * 
 * @returns {*}
 */
function wrapCallbackWithArgs<CallbackReturnValue, BoundObject>(
    thisArg: BoundObject,
    callback: (...curryArgs: any[]) => CallbackReturnValue,
    ...predefinedArgs: unknown[]
) {
    return function (...args: unknown[]) {
      return callback.apply(thisArg, [...args, ...predefinedArgs]);
    };
}

// NOTE: https://github.com/Microsoft/TypeScript/issues/23812
const defaultProps = {
    copyStyles: true,
    pageStyle: `
        @page {
            /* Remove browser default header (title) and footer (url) */
            margin: 0;
        }
        @media print {
            body {
                /* Tell browsers to print background colors */
                -webkit-print-color-adjust: exact; /* Chrome/Safari/Edge/Opera */
                color-adjust: exact; /* Firefox */
            }
        }
    `,
    removeAfterPrint: false,
    suppressErrors: false,
};

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
    /**
     * Remove the iframe after printing.
     * NOTE: `onAfterPrint` will run before the iframe is removed
     */
    removeAfterPrint?: boolean;
    /** Suppress error messages */
    suppressErrors?: boolean;
    /** Trigger action used to open browser print */
    trigger?: <T>() => React.ReactElement<ITriggerProps<T>>;
    /** Set the nonce attribute for whitelisting script and style -elements for CSP (content security policy) */
    nonce?: string;
}

export default class ReactToPrint extends React.Component<IReactToPrintProps> {
    private numResourcesToLoad!: number;
    private resourcesLoaded!: (Element | Font | FontFace)[];
    private resourcesErrored!: (Element | Font | FontFace)[];

    static defaultProps = defaultProps;

    public startPrint = (target: HTMLIFrameElement) => {
        const {
            onAfterPrint,
            onPrintError,
            print,
            documentTitle,
        } = this.props;

        // Some browsers such as Safari don't always behave well without this timeout
        setTimeout(() => {
            if (target.contentWindow) {
                target.contentWindow.focus(); // Needed for IE 11

                if (print) {
                    print(target)
                        .then(() => onAfterPrint?.())
                        .then(() => this.handleRemoveIframe())
                        .catch((error: Error) => {
                            if (onPrintError) {
                                onPrintError('print', error);
                            } else {
                                this.logMessages(["An error was thrown by the specified `print` function"]);
                            }
                        });
                } else {
                    if (target.contentWindow.print) {
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
                    } else {
                        // Some browsers, such as Firefox Android, do not support printing at all
                        // https://developer.mozilla.org/en-US/docs/Web/API/Window/print
                        this.logMessages(["Printing for this browser is not currently possible: the browser does not have a `print` method available for iframes."]);
                    }

                    onAfterPrint?.();
                    this.handleRemoveIframe();
                }
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

    public handleClick (event?: React.MouseEvent, content?: (() => React.ReactInstance | null)) {
        const {
            onBeforeGetContent,
            onPrintError,
        } = this.props;

        // NOTE: `event` is a no-use argument (necessary for backward compatibility with older versions)
        const __handlePrint = wrapCallbackWithArgs(this, this.handlePrint, event);

        if (onBeforeGetContent) {
            const onBeforeGetContentOutput = onBeforeGetContent();
            if (onBeforeGetContentOutput && typeof onBeforeGetContentOutput.then === "function") {
                onBeforeGetContentOutput
                    .then(() => __handlePrint(content))
                    .catch((error: Error) => {
                        if (onPrintError) {
                            onPrintError("onBeforeGetContent", error);
                        }
                    });
            } else {
                __handlePrint(content);
            }
        } else {
            __handlePrint(content);
        }
    }

    public handlePrint = (optionalContent?: (() => React.ReactInstance | null)) => {
        const {
            bodyClass,
            content,
            copyStyles,
            fonts,
            pageStyle,
            nonce,
        } = this.props;

        let contentEl = typeof optionalContent === "function" ? optionalContent() : null;
        
        if (!contentEl && typeof content === "function") {
            contentEl = content();
        }

        if (contentEl === undefined) {
            this.logMessages(['To print a functional component ensure it is wrapped with `React.forwardRef`, and ensure the forwarded ref is used. See the README for an example: https://github.com/gregnb/react-to-print#examples']);
            return;
        }

        if (contentEl === null) {
            this.logMessages(['There is nothing to print because the "content" prop returned "null". Please ensure "content" is renderable before allowing "react-to-print" to be called.']);
            return;
        }

        const printWindow = document.createElement("iframe");
        printWindow.width = `${document.documentElement.clientWidth}px`;
        printWindow.height = `${document.documentElement.clientHeight}px`;
        printWindow.style.position = "absolute";
        printWindow.style.top = `-${document.documentElement.clientHeight + 100}px`;
        printWindow.style.left = `-${document.documentElement.clientWidth + 100}px`;
        printWindow.id = "printWindow";
        // Ensure we set a DOCTYPE on the iframe's document
        // https://github.com/gregnb/react-to-print/issues/459
        printWindow.srcdoc = "<!DOCTYPE html>";

        const contentNodes = findDOMNode(contentEl);

        if (!contentNodes) {
            this.logMessages(['"react-to-print" could not locate the DOM node corresponding with the `content` prop']);
            return;
        }

        // React components can return a bare string as a valid JSX response
        const clonedContentNodes = contentNodes.cloneNode(true);
        const isText = clonedContentNodes instanceof Text;

        const globalLinkNodes = document.querySelectorAll("link[rel~='stylesheet'], link[as='style']");
        const renderComponentImgNodes = isText ? [] : (clonedContentNodes as Element).querySelectorAll("img");
        const renderComponentVideoNodes = isText ? [] : (clonedContentNodes as Element).querySelectorAll("video");

        const numFonts = fonts ? fonts.length : 0;

        this.numResourcesToLoad =
            globalLinkNodes.length +
            renderComponentImgNodes.length +
            renderComponentVideoNodes.length +
            numFonts;
        this.resourcesLoaded = [];
        this.resourcesErrored = [];

        const markLoaded = (resource: Element | Font | FontFace, errorMessages?: unknown[]) => {
            if (this.resourcesLoaded.includes(resource)) {
                this.logMessages(["Tried to mark a resource that has already been handled", resource], "debug");
                return;
            }

            if (!errorMessages) {
                this.resourcesLoaded.push(resource);
            } else {
                this.logMessages([
                    '"react-to-print" was unable to load a resource but will continue attempting to print the page',
                    ...errorMessages
                ]);
                this.resourcesErrored.push(resource);
            }

            // We may have errors, but attempt to print anyways - maybe they are trivial and the
            // user will be ok ignoring them
            const numResourcesManaged = this.resourcesLoaded.length + this.resourcesErrored.length;

            if (numResourcesManaged === this.numResourcesToLoad) {
                this.triggerPrint(printWindow);
            }
        };

        printWindow.onload = () => {
            // Some agents, such as IE11 and Enzyme (as of 2 Jun 2020) continuously call the
            // `onload` callback. This ensures that it is only called once.
            printWindow.onload = null;

            const domDoc = printWindow.contentDocument || printWindow.contentWindow?.document;

            if (domDoc) {
                domDoc.body.appendChild(clonedContentNodes);

                if (fonts) {
                    if (printWindow.contentDocument?.fonts && printWindow.contentWindow?.FontFace) {
                        fonts.forEach((font) => {
                            const fontFace = new FontFace(
                                font.family,
                                font.source,
                                { weight: font.weight, style: font.style }
                            );
                            printWindow.contentDocument!.fonts.add(fontFace);
                            fontFace.loaded
                                .then(() => {
                                    markLoaded(fontFace);
                                })
                                .catch((error: Error) => {
                                    markLoaded(fontFace, ['Failed loading the font:', fontFace, 'Load error:', error]);
                                });
                        });
                    } else {
                        fonts.forEach(font => markLoaded(font)); // Pretend we loaded the fonts to allow printing to continue
                        this.logMessages(['"react-to-print" is not able to load custom fonts because the browser does not support the FontFace API but will continue attempting to print the page']);
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
                    // Copy canvases
                    // NOTE: must use data from `contentNodes` here as the canvass elements in
                    // `clonedContentNodes` will not have been redrawn properly yet
                    const srcCanvasEls = isText ? [] : (contentNodes as Element).querySelectorAll("canvas");
                    const targetCanvasEls = domDoc.querySelectorAll("canvas");

                    for (let i = 0; i < srcCanvasEls.length; ++i) {
                        const sourceCanvas = srcCanvasEls[i];

                        const targetCanvas = targetCanvasEls[i];
                        const targetCanvasContext = targetCanvas.getContext("2d");

                        if (targetCanvasContext) {
                            targetCanvasContext.drawImage(sourceCanvas, 0, 0);
                        }
                    }

                    // Pre-load images
                    for (let i = 0; i < renderComponentImgNodes.length; i++) {
                        const imgNode = renderComponentImgNodes[i];
                        const imgSrc = imgNode.getAttribute("src");

                        if (!imgSrc) {
                            markLoaded(imgNode, ['Found an <img> tag with an empty "src" attribute. This prevents pre-loading it. The <img> is:', imgNode]);
                        } else {
                            // https://stackoverflow.com/questions/10240110/how-do-you-cache-an-image-in-javascript
                            const img = new Image();
                            img.onload = () => markLoaded(imgNode);
                            img.onerror = (_event, _source, _lineno, _colno, error) => markLoaded(imgNode, ["Error loading <img>", imgNode, "Error", error]);
                            img.src = imgSrc;
                        }
                    }

                    // Pre-load videos
                    for (let i = 0; i < renderComponentVideoNodes.length; i++) {
                        const videoNode = renderComponentVideoNodes[i];
                        videoNode.preload = 'auto'; // Hint to the browser that it should load this resource

                        const videoPoster = videoNode.getAttribute('poster')
                        if (videoPoster) {
                            // If the video has a poster, pre-load the poster image
                            // https://stackoverflow.com/questions/10240110/how-do-you-cache-an-image-in-javascript
                            const img = new Image();
                            img.onload = () => markLoaded(videoNode);
                            img.onerror = (_event, _source, _lineno, _colno, error) => markLoaded(videoNode, ["Error loading video poster", videoPoster, "for video", videoNode, "Error:", error]);
                            img.src = videoPoster;
                        } else {
                            if (videoNode.readyState >= 2) { // Check if the video has already loaded a frame
                                markLoaded(videoNode);
                            } else {
                                videoNode.onloadeddata = () => markLoaded(videoNode);

                                // TODO: why do `onabort` and `onstalled` seem to fire all the time even if there is no issue?
                                // videoNode.onabort = () => markLoaded(videoNode, ["Loading video aborted", videoNode]);
                                videoNode.onerror = (_event, _source, _lineno, _colno, error) => markLoaded(videoNode, ["Error loading video", videoNode, "Error", error]);
                                // videoNode.onemptied = () => markLoaded(videoNode, ["Loading video emptied, skipping", videoNode]);
                                videoNode.onstalled = () => markLoaded(videoNode, ["Loading video stalled, skipping", videoNode]);
                            }
                        }
                    }

                    // Copy input values
                    // This covers most input types, though some need additional work (further down)
                    const inputSelector = 'input';
                    const originalInputs = (contentNodes as HTMLElement).querySelectorAll(inputSelector);
                    const copiedInputs = domDoc.querySelectorAll(inputSelector);
                    for (let i = 0; i < originalInputs.length; i++) {
                        copiedInputs[i].value = originalInputs[i].value;
                    }

                    // Copy checkbox, radio checks
                    const checkedSelector = 'input[type=checkbox],input[type=radio]';
                    const originalCRs = (contentNodes as HTMLElement).querySelectorAll(checkedSelector);
                    const copiedCRs = domDoc.querySelectorAll(checkedSelector);
                    for (let i = 0; i < originalCRs.length; i++) {
                        (copiedCRs[i] as HTMLInputElement).checked =
                        (originalCRs[i] as HTMLInputElement).checked;
                    }

                    // Copy select states
                    const selectSelector = 'select';
                    const originalSelects = (contentNodes as HTMLElement).querySelectorAll(selectSelector);
                    const copiedSelects = domDoc.querySelectorAll(selectSelector);
                    for (let i = 0; i < originalSelects.length; i++) {
                        copiedSelects[i].value = originalSelects[i].value;
                    }
                }

                if (copyStyles) {
                    const styleAndLinkNodes = document.querySelectorAll("style, link[rel~='stylesheet'], link[as='style']");

                    for (let i = 0, styleAndLinkNodesLen = styleAndLinkNodes.length; i < styleAndLinkNodesLen; ++i) {
                        const node = styleAndLinkNodes[i];
                        
                        if (node.tagName.toLowerCase() === 'style') { // <style> nodes
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
                                // Browser's don't display `disabled` `link` nodes, so we need to filter them out
                                // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-disabled
                                // https://caniuse.com/mdn-html_elements_link_disabled
                                // TODO: ideally we could just filter these out on selection using
                                // a selector such as: `link[rel='stylesheet']:not([disabled])`
                                // https://stackoverflow.com/questions/27733826/css-selectors-for-excluding-by-attribute-presence
                                // However, that doesn't seem to work. Why?
                                if (!node.hasAttribute("disabled")) {
                                    const newHeadEl = domDoc.createElement(node.tagName);

                                    // Manually re-create the node
                                    // TODO: document why cloning the node won't work? I don't recall
                                    // the reasoning behind why we do it this way
                                    // NOTE: node.attributes has NamedNodeMap type that is not an Array
                                    // and can be iterated only via direct [i] access
                                    for (let j = 0, attrLen = node.attributes.length; j < attrLen; ++j) {
                                        const attr = node.attributes[j];
                                        if (attr) {
                                            newHeadEl.setAttribute(attr.nodeName, attr.nodeValue || "");
                                        }
                                    }
    
                                    newHeadEl.onload = () => markLoaded(newHeadEl);
                                    newHeadEl.onerror = (_event, _source, _lineno, _colno, error) => markLoaded(newHeadEl, ["Failed to load", newHeadEl, "Error:", error]);
                                    if (nonce) {
                                        newHeadEl.setAttribute("nonce", nonce);
                                    }
                                    domDoc.head.appendChild(newHeadEl);
                                } else {
                                    this.logMessages(['`react-to-print` encountered a <link> tag with a `disabled` attribute and will ignore it. Note that the `disabled` attribute is deprecated, and some browsers ignore it. You should stop using it. https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-disabled. The <link> is:', node], 'warning');
                                    // `true` because this isn't an error: we are intentionally skipping this node
                                    markLoaded(node);
                                }
                            } else {
                                this.logMessages(['`react-to-print` encountered a <link> tag with an empty `href` attribute. In addition to being invalid HTML, this can cause problems in many browsers, and so the <link> was not loaded. The <link> is:', node], 'warning');
                                // `true` because we"ve already shown a warning for this
                                markLoaded(node);
                            }
                        }
                    }
                }
            }

            if (this.numResourcesToLoad === 0 || !copyStyles) {
                this.triggerPrint(printWindow);
            }
        };

        // Ensure we remove any pre-existing print windows before adding a new one
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

    public logMessages = (messages: unknown[], level: 'error' | 'warning' | 'debug' = 'error') => {
        const {
            suppressErrors,
        } = this.props;

        if (!suppressErrors) {
            if (level === 'error') {
                console.error(messages); // eslint-disable-line no-console
            } else if (level === 'warning') {
                console.warn(messages); // eslint-disable-line no-console
            } else if (level === 'debug') {
                console.debug(messages); // eslint-disable-line no-console
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
                onClick: this.handleClick.bind(this),
            });
        } else {
            if (!PrintContext) {
                this.logMessages(['"react-to-print" requires React ^16.3.0 to be able to use "PrintContext"']);

                return null;
            }

            const value = { 
                handlePrint: (
                    event: React.MouseEvent,
                    content: (() => React.ReactInstance | null)
                ) => {
                    /* eslint-disable-next-line @typescript-eslint/unbound-method */
                    const __handlePrint = wrapCallbackWithArgs(this, this.handleClick, content);
                    // NOTE: `event` is a no-use argument (necessary for backward compatibility with older versions)
                    return __handlePrint(event);
                }
            };

            return (
                <PrintContext.Provider value={value as IPrintContextProps}>
                    {children}
                </PrintContext.Provider>
            );
        }
    }
}

type UseReactToPrintHookReturn = (
    event?: React.MouseEvent,
    lazyOption?: { content: (() => React.ReactInstance | null) }
) => void;

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

    return React.useCallback(
        (event?: React.MouseEvent, lazyOption?: { content: (() => React.ReactInstance | null) }) => {
        /* eslint-disable-next-line @typescript-eslint/unbound-method */
        const triggerPrint = wrapCallbackWithArgs(reactToPrint, reactToPrint.handleClick, lazyOption);
        // NOTE: `event` is a no-use argument
        // (necessary for backward compatibility with older versions)
        return triggerPrint(event);
    }, [reactToPrint]);
};
