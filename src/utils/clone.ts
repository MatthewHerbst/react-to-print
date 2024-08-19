export function cloneShadowRoots(sourceNode: Node, targetNode: Node) {
    if (sourceNode instanceof Element && targetNode instanceof Element) {
        const shadowRoot = sourceNode.shadowRoot;
        if (shadowRoot !== null) {
            // Create a new Shadow Root for the target element
            const copiedShadowRoot = targetNode.attachShadow({ mode: shadowRoot.mode. });

            // Clone the contents of the original ShadowRoot manually
            const originalShadowContent = shadowRoot.innerHTML;

            // Create a temporary container to hold the content to copy
            const tempContainer = targetNode.ownerDocument.createElement(shadowRoot.children[0].tagName);
            tempContainer.innerHTML = originalShadowContent;

            // Clone and append the Shadow DOM content
            copiedShadowRoot.appendChild(tempContainer);

            // Recursively clone any nested Shadow DOMs within this Shadow DOM content
            const shadowChildren = copiedShadowRoot.children;
            for (let i = 0; i < shadowChildren.length; i++) {
                cloneShadowRoots(shadowRoot.children[i], shadowChildren[i]);
            }
        }

        // Now, recursively check each child node for Shadow DOMs
        const children = sourceNode.children;
        for (let i = 0; i < children.length; i++) {
            targetNode.children[i] && cloneShadowRoots(children[i], targetNode.children[i]);
        }
    }
}
