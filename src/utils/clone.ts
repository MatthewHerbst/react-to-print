import {logMessages} from "./logMessage";
import {getErrorFromUnknown} from "./getErrorMessage";

/**
 * Copies constructable stylesheets (`adoptedStyleSheets`) from a source shadow root to a cloned
 * shadow root. These sheets are not represented in `innerHTML`, so without this any styles applied
 * via `adoptedStyleSheets` - common with web component frameworks such as Lit - would be missing
 * from the print output. See #770.
 *
 * The source sheets belong to the main document and cannot be adopted directly by the print
 * iframe's document (browsers throw "Sharing constructed stylesheets in multiple documents is not
 * allowed"). We therefore reconstruct each sheet in the target document from its serialized rules.
 */
function copyAdoptedStyleSheets(
    sourceRoot: ShadowRoot,
    targetRoot: ShadowRoot,
    suppressErrors: boolean,
): void {
    // `adoptedStyleSheets` is not supported in all browsers, hence the guard
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!sourceRoot.adoptedStyleSheets || sourceRoot.adoptedStyleSheets.length === 0) {
        return;
    }

    const targetDoc = targetRoot.ownerDocument;
    // Some browsers that expose `adoptedStyleSheets` may still not support constructing a
    // `CSSStyleSheet` directly. Guard against that so we degrade gracefully rather than throw.
    const targetWindow = targetDoc.defaultView;
    if (!targetWindow?.CSSStyleSheet) {
        return;
    }

    const reconstructedSheets: CSSStyleSheet[] = [];

    for (const sourceSheet of sourceRoot.adoptedStyleSheets) {
        try {
            let cssText = "";
            const cssRules = sourceSheet.cssRules;
            for (let i = 0; i < cssRules.length; i++) {
                cssText += `${cssRules[i].cssText}\r\n`;
            }

            const newSheet = new targetWindow.CSSStyleSheet();
            newSheet.replaceSync(cssText);
            reconstructedSheets.push(newSheet);
        } catch (error: unknown) {
            logMessages({
                messages: [
                    "`react-to-print` was unable to copy a constructable stylesheet from a shadow root and will skip it. The shadow root's `adoptedStyleSheets` may include a cross-origin sheet.",
                    sourceSheet,
                    `Original error: ${getErrorFromUnknown(error).message}`,
                ],
                level: "warning",
                suppressErrors,
            });
        }
    }

    targetRoot.adoptedStyleSheets = reconstructedSheets;
}

function collectElements(root: HTMLElement): HTMLElement[] {
    const elements: HTMLElement[] = [];
    const walker: TreeWalker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null);

    let element: Node | null = walker.nextNode();
    while (element) {
        elements.push(element as HTMLElement);
        element = walker.nextNode();
    }

    return elements;
}

export function cloneShadowRoots(sourceNode: Node, targetNode: Node, suppressErrors: boolean): void {

    const sourceElements = collectElements(sourceNode as HTMLElement);
    const targetElements = collectElements(targetNode as HTMLElement);

    if (sourceElements.length !== targetElements.length) {
        logMessages({
            messages: ["When cloning shadow root content, source and target elements have different size. `onBeforePrint` likely resolved too early.", sourceNode, targetNode],
            suppressErrors,
        });
        return;
    }

    for (let i = 0; i < sourceElements.length; i++) {
        const sourceElement = sourceElements[i];
        const targetElement = targetElements[i];

        const shadowRoot = sourceElement.shadowRoot;
        if (shadowRoot !== null) {
            const copiedShadowRoot = targetElement.attachShadow({mode: shadowRoot.mode});

            copiedShadowRoot.innerHTML = shadowRoot.innerHTML;

            copyAdoptedStyleSheets(shadowRoot, copiedShadowRoot, suppressErrors);

            // Recursively clone any nested Shadow DOMs within this Shadow DOM content
            cloneShadowRoots(shadowRoot, copiedShadowRoot, suppressErrors);
        }
    }
}
