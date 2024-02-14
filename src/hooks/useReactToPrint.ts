import * as React from "react";

import { ReactToPrint } from "../components/ReactToPrint";
import { defaultProps } from "../consts/defaultProps";
import type { IReactToPrintProps } from "../types/reactToPrintProps";
import { wrapCallbackWithArgs } from "../utils/wrapCallbackWithArgs";

type UseReactToPrintHookReturn = (
    event?: unknown,
    content?: (() => React.ReactInstance | null)
) => void;

const hooksEnabled = Object.prototype.hasOwnProperty.call(React, "useMemo") && Object.prototype.hasOwnProperty.call(React, "useCallback");

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
        (event?: unknown, content?: (() => React.ReactInstance | null)) => {
        /* eslint-disable-next-line @typescript-eslint/unbound-method */
        const triggerPrint = wrapCallbackWithArgs(reactToPrint, reactToPrint.handleClick, content);
        // NOTE: `event` is an unused argument, necessary for backward compatibility with older versions
        return triggerPrint(event);
    }, [reactToPrint]);
};