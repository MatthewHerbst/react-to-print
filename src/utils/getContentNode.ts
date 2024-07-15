import { logMessages } from "./logMessage";
import { ContentNode } from "../types/ContentNode";
import type { UseReactToPrintOptions } from "../types/UseReactToPrintOptions";
import { UseReactToPrintHookContent } from "../types/UseReactToPrintHookContent";

type GetContentNodesArgs = {
    contentRef?: UseReactToPrintOptions["contentRef"];
    optionalContent?: UseReactToPrintHookContent;
    suppressErrors?: boolean;
}

export function getContentNode({ contentRef, optionalContent, suppressErrors }: GetContentNodesArgs): ContentNode {
    if (optionalContent) {
        if (contentRef) {
            logMessages({
                level: "warning",
                messages: ['"react-to-print" received a `contentRef` option and a optional-content param passed to its callback. The `contentRef` option will be ignored.'],
            });
        }

        return optionalContent();
    }

    if (contentRef) {
        return contentRef.current
    }

    logMessages({
        messages: ['"react-to-print" did not receive a `contentRef` option or a optional-content param pass to its callback.'],
        suppressErrors,
    });
    return;
}