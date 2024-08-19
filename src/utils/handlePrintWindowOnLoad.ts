import {logMessages} from "./logMessage";
import {startPrint} from "./startPrint";
import {Font} from "../types/font";
import type {UseReactToPrintOptions} from "../types/UseReactToPrintOptions";
import {cloneShadowRoots} from "./clone";

type HandlePrintWindowOnLoadData = {
    clonedContentNode: Node;
    contentNode: Node;
    numResourcesToLoad: number;
    renderComponentImgNodes: never[] | NodeListOf<HTMLImageElement>;
    renderComponentVideoNodes: never[] | NodeListOf<HTMLVideoElement>;
};
type MarkLoaded = (resource: Element | Font | FontFace, errorMessages?: unknown[]) => void;

const DEFAULT_PAGE_STYLE = `
    @page {
        /* Remove browser default header (title) and footer (url) */
        margin: 0;
    }
    @media print {
        body {
            /* Tell browsers to print background colors */
            color-adjust: exact; /* Firefox. This is an older version of "print-color-adjust" */
            print-color-adjust: exact; /* Firefox/Safari */
            -webkit-print-color-adjust: exact; /* Chrome/Safari/Edge/Opera */
        }
    }
`;

/**
 * Handles loading resources into the print window and copying over various DOM elements that
 * require special handling. Continuously checks
 */
export function handlePrintWindowOnLoad(
    printWindow: HTMLIFrameElement,
    markLoaded: MarkLoaded,
    data: HandlePrintWindowOnLoadData,
    options: UseReactToPrintOptions
) {
    const {
        clonedContentNode,
        contentNode,
        numResourcesToLoad,
        renderComponentImgNodes,
        renderComponentVideoNodes,
    } = data;

    const {
        bodyClass,
        fonts,
        ignoreGlobalStyles,
        pageStyle,
        nonce,
        suppressErrors,
        copyShadowRoots
    } = options;

    // Some agents, such as IE11 and Enzyme (as of 2 Jun 2020) continuously call the
    // `onload` callback. This ensures that it is only called once.
    printWindow.onload = null;

    const domDoc = printWindow.contentDocument || printWindow.contentWindow?.document;

    if (domDoc) {
        const appendedContentNode = domDoc.body.appendChild(clonedContentNode);
        if (copyShadowRoots) {
            cloneShadowRoots(contentNode, appendedContentNode, !!suppressErrors);
        }

        if (fonts) {
            if (printWindow.contentDocument?.fonts && printWindow.contentWindow?.FontFace) {
                fonts.forEach((font) => {
                    const fontFace = new FontFace(
                        font.family,
                        font.source,
                        {weight: font.weight, style: font.style}
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
                logMessages({
                    messages: ['"react-to-print" is not able to load custom fonts because the browser does not support the FontFace API but will continue attempting to print the page'],
                    suppressErrors
                });
            }
        }

        const pageStyleToUse = pageStyle ?? DEFAULT_PAGE_STYLE;
        const styleEl = domDoc.createElement("style");

        if (nonce) {
            styleEl.setAttribute("nonce", nonce);
            domDoc.head.setAttribute("nonce", nonce);
        }

        styleEl.appendChild(domDoc.createTextNode(pageStyleToUse));
        domDoc.head.appendChild(styleEl);

        if (bodyClass) {
            domDoc.body.classList.add(...bodyClass.split(" "));
        }

        // Copy canvases
        // NOTE: must use data from `contentNode` here as the canvass elements in
        // `clonedContentNode` will not have been redrawn properly yet
        const srcCanvasEls = (contentNode as Element).querySelectorAll("canvas");
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
                    // videoNode.onabort = () => markLoaded(videoNode, ["Loading video aborted", videoNode], suppressErrors);
                    videoNode.onerror = (_event, _source, _lineno, _colno, error) => markLoaded(videoNode, ["Error loading video", videoNode, "Error", error]);
                    // videoNode.onemptied = () => markLoaded(videoNode, ["Loading video emptied, skipping", videoNode]);
                    videoNode.onstalled = () => markLoaded(videoNode, ["Loading video stalled, skipping", videoNode]);
                }
            }
        }

        // Copy input values
        // This covers most input types, though some need additional work (further down)
        const inputSelector = 'input';
        const originalInputs = (contentNode as HTMLElement).querySelectorAll(inputSelector);
        const copiedInputs = domDoc.querySelectorAll(inputSelector);
        for (let i = 0; i < originalInputs.length; i++) {
            copiedInputs[i].value = originalInputs[i].value;
        }

        // Copy checkbox, radio checks
        const checkedSelector = 'input[type=checkbox],input[type=radio]';
        const originalCRs = (contentNode as HTMLElement).querySelectorAll(checkedSelector);
        const copiedCRs = domDoc.querySelectorAll(checkedSelector);
        for (let i = 0; i < originalCRs.length; i++) {
            (copiedCRs[i] as HTMLInputElement).checked =
                (originalCRs[i] as HTMLInputElement).checked;
        }

        // Copy select states
        const selectSelector = 'select';
        const originalSelects = (contentNode as HTMLElement).querySelectorAll(selectSelector);
        const copiedSelects = domDoc.querySelectorAll(selectSelector);
        for (let i = 0; i < originalSelects.length; i++) {
            copiedSelects[i].value = originalSelects[i].value;
        }

        if (!ignoreGlobalStyles) {
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
                            // https://github.com/MatthewHerbst/react-to-print/issues/429
                            const cssLength = sheet.cssRules.length;
                            for (let j = 0; j < cssLength; ++j) {
                                if (typeof sheet.cssRules[j].cssText === "string") {
                                    styleCSS += `${sheet.cssRules[j].cssText}\r\n`;
                                }
                            }
                        } catch (error) {
                            logMessages({
                                messages: [
                                    `A stylesheet could not be accessed. This is likely due to the stylesheet having cross-origin imports, and many browsers block script access to cross-origin stylesheets. See https://github.com/MatthewHerbst/react-to-print/issues/429 for details. You may be able to load the sheet by both marking the stylesheet with the cross \`crossorigin\` attribute, and setting the \`Access-Control-Allow-Origin\` header on the server serving the stylesheet. Alternatively, host the stylesheet on your domain to avoid this issue entirely.`, // eslint-disable-line max-len
                                    node,
                                ],
                                level: 'warning',
                            });
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
                            logMessages({
                                messages: ['`react-to-print` encountered a <link> tag with a `disabled` attribute and will ignore it. Note that the `disabled` attribute is deprecated, and some browsers ignore it. You should stop using it. https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-disabled. The <link> is:', node],
                                level: 'warning',
                            });
                            // `true` because this isn't an error: we are intentionally skipping this node
                            markLoaded(node);
                        }
                    } else {
                        logMessages({
                            messages: ['`react-to-print` encountered a <link> tag with an empty `href` attribute. In addition to being invalid HTML, this can cause problems in many browsers, and so the <link> was not loaded. The <link> is:', node],
                            level: 'warning',
                        });
                        // `true` because we"ve already shown a warning for this
                        markLoaded(node);
                    }
                }
            }
        }
    }

    if (numResourcesToLoad === 0) {
        startPrint(printWindow, options);
    }
}
