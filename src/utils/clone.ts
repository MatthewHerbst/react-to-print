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

export function cloneShadowRoots(sourceNode: Node, targetNode: Node) {

    const sourceElements = collectElements(sourceNode as HTMLElement);
    const targetElements = collectElements(targetNode as HTMLElement);

    for (let i = 0; i < sourceElements.length; i++) {
        const sourceElement = sourceElements[i];
        const targetElement = targetElements[i];

        const shadowRoot = sourceElement.shadowRoot;
        if (shadowRoot !== null) {
            const copiedShadowRoot = targetElement.attachShadow({mode: shadowRoot.mode});

            const originalShadowContent = shadowRoot.innerHTML;
            copiedShadowRoot.innerHTML = originalShadowContent;

            // Recursively clone any nested Shadow DOMs within this Shadow DOM content
            cloneShadowRoots(shadowRoot, copiedShadowRoot);
        }
    }
}
