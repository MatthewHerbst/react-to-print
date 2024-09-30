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

        // This check allows passing the callback from `useReactToPrint` directly into event
        // handlers without having to wrap it in another function to capture the event
        // See [#742](https://github.com/MatthewHerbst/react-to-print/issues/742) and [#724](https://github.com/MatthewHerbst/react-to-print/issues/724)
        if (typeof optionalContent === "function")   {
            return optionalContent();
        }
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