import * as React from "react";

const contextEnabled = Object.prototype.hasOwnProperty.call(React, "createContext");

export interface IPrintContextProps {
    handlePrint: (event?: unknown, content?: (() => React.ReactInstance | null)) => void,
}

export const PrintContext = contextEnabled ? React.createContext({} as IPrintContextProps) : null;
export const PrintContextConsumer = PrintContext ? PrintContext.Consumer : () => null;