import type { Font } from "../types/font";
import type { UseReactToPrintOptions } from "../types/UseReactToPrintOptions";
import { logMessages } from "./logMessage";
import { startPrint } from "./startPrint";

export function getMarkedLoaded(
    options: UseReactToPrintOptions,
    numResourcesToLoad: number,
    printWindow: HTMLIFrameElement,
) {
    const {
        suppressErrors,
    } = options;

    const resourcesLoaded: (Element | Font | FontFace)[] = [];
    const resourcesErrored: (Element | Font | FontFace)[] = [];

    /**
     * Keeps track of loaded resources, kicking off the actual print function once all
     * resources have been marked (loaded or failed)
     */
    return function markLoaded(resource: Element | Font | FontFace, errorMessages?: unknown[]) {
        if (resourcesLoaded.includes(resource)) {
            logMessages({
                level: "debug",
                messages: ["Tried to mark a resource that has already been handled", resource],
                suppressErrors,
            });
            return;
        }

        if (!errorMessages) {
            resourcesLoaded.push(resource);
        } else {
            logMessages({
                messages: [
                    '"react-to-print" was unable to load a resource but will continue attempting to print the page',
                    ...errorMessages
                ],
                suppressErrors,
            });
            resourcesErrored.push(resource);
        }

        // We may have errors, but attempt to print anyways - maybe they are trivial and the
        // user will be ok ignoring them
        const numResourcesManaged = resourcesLoaded.length + resourcesErrored.length;

        if (numResourcesManaged === numResourcesToLoad) {
            startPrint(printWindow, options);
        }
    };
}