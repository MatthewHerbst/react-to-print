import { ContentNode } from "./ContentNode";

/**
 * `Event` allowed so that the `useReactToPrint` callback can be passed directly to an event
 * handler rather than needing to be wrapped.
 */
export type UseReactToPrintHookContent = React.UIEvent | (() => ContentNode);