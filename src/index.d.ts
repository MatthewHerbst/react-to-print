import React from 'react';
import PropTypes from 'prop-types';
interface ReactToPrintProps {
    /** Copy styles over into print window. default: true */
    copyStyles: boolean;
    /** Trigger action used to open browser print */
    trigger: () => React.CElement<React.ComponentPropsWithRef<any>, React.Component>;
    /** Content to be printed */
    content: () => React.ReactInstance;
    /** Callback function to trigger before print */
    onBeforePrint?: () => void;
    /** Callback function to trigger after print */
    onAfterPrint?: () => void;
    /** Override default print window styling */
    pageStyle: string;
    /** Optional class to pass to the print window body */
    bodyClass: string;
}
declare class ReactToPrint extends React.Component<ReactToPrintProps> {
    static propTypes: {
        /** Copy styles over into print window. default: true */
        copyStyles: PropTypes.Requireable<boolean>;
        /** Trigger action used to open browser print */
        trigger: PropTypes.Validator<(...args: any[]) => any>;
        /** Content to be printed */
        content: PropTypes.Validator<(...args: any[]) => any>;
        /** Callback function to trigger before print */
        onBeforePrint: PropTypes.Requireable<(...args: any[]) => any>;
        /** Callback function to trigger after print */
        onAfterPrint: PropTypes.Requireable<(...args: any[]) => any>;
        /** Override default print window styling */
        pageStyle: PropTypes.Requireable<string>;
        /** Optional class to pass to the print window body */
        bodyClass: PropTypes.Requireable<string>;
    };
    private linkTotal;
    private linksLoaded;
    private linksErrored;
    private triggerRef;
    static defaultProps: Partial<ReactToPrintProps>;
    removeWindow: (target: HTMLIFrameElement) => void;
    triggerPrint: (target: HTMLIFrameElement) => void;
    handlePrint: () => void;
    setRef: (ref: React.LegacyRef<any>) => void;
    render(): React.ReactElement<any>;
}
export default ReactToPrint;
