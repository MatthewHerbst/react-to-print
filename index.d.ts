import React from 'react';
import PropTypes from 'prop-types';

/*~ This declaration specifies that the class constructor function
 *~ is the exported object from the file
 */
export = ReactToPrint;

declare class ReactToPrint extends React.Component<ReactToPrint.ReactToPrintProps> {
  static propTypes: {
    /** Copy styles over into print window. default: true */
    copyStyles: PropTypes.Requireable<boolean>;
    /** Trigger action used to open browser print */
    trigger: PropTypes.Validator<ReactToPrint.TriggerFn>;
    /** Content to be printed */
    content: PropTypes.Validator<ReactToPrint.ContentFn>;
    /** Callback function to trigger before print */
    onBeforePrint: PropTypes.Requireable<ReactToPrint.PrintCallbackFn>;
    /** Callback function to trigger after print */
    onAfterPrint: PropTypes.Requireable<ReactToPrint.PrintCallbackFn>;
    /** Override default print window styling */
    pageStyle: PropTypes.Requireable<string>;
    /** Optional class to pass to the print window body */
    bodyClass: PropTypes.Requireable<string>;
  };
  static defaultProps: Partial<ReactToPrint.ReactToPrintProps>;
  private linkTotal;
  private linksLoaded;
  private linksErrored;
  private triggerRef;
  removeWindow: (target: HTMLIFrameElement) => void;
  triggerPrint: (target: HTMLIFrameElement) => void;
  handlePrint: () => void;
  setRef: (ref: React.LegacyRef<any>) => void;
  render(): React.ReactElement<any>;
}

declare namespace ReactToPrint {
  type TriggerFn = () => React.CElement<React.ComponentPropsWithRef<any>, React.Component>;
  type ContentFn = () => React.ReeactInstance;
  type PrintCallbackFn = () => void;

  export interface ReactToPrintProps {
    /** Copy styles over into print window. default: true */
    copyStyles: boolean;
    /** Trigger action used to open browser print */
    trigger: TriggerFn;
    /** Content to be printed */
    content: ContentFn;
    /** Callback function to trigger before print */
    onBeforePrint?: PrintCallbackFn;
    /** Callback function to trigger after print */
    onAfterPrint?: PrintCallbackFn;
    /** Override default print window styling */
    pageStyle: string;
    /** Optional class to pass to the print window body */
    bodyClass: string;
  }
}
