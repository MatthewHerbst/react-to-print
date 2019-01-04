import React from 'react';
import PropTypes from 'prop-types';

import print from './print';

class ReactToPrint extends React.Component {
  static propTypes = {
    /** Copy styles over into print window. default: true */
    copyStyles: PropTypes.bool,
    /** Trigger action used to open browser print */
    trigger: PropTypes.func.isRequired,
    /** Content to be printed */
    content: PropTypes.func.isRequired,
    /** Callback function to trigger before print */
    onBeforePrint: PropTypes.func,
    /** Callback function to trigger after print */
    onAfterPrint: PropTypes.func,
    /** Override default print window styling */
    pageStyle: PropTypes.string,
    /** Optional class to pass to the print window body */
    bodyClass: PropTypes.string,
  };

  static defaultProps = {
    bodyClass: '',
    copyStyles: true,
    onAfterPrint: undefined,
    onBeforePrint: undefined,
    pageStyle: undefined,
  };


  handlePrint = () => {
    const {
      bodyClass,
      content,
      copyStyles,
      onAfterPrint,
      onBeforePrint,
      pageStyle,
    } = this.props;

    print(
      content(),
      {
        bodyClass,
        copyStyles,
        onAfterPrint,
        onBeforePrint,
        pageStyle,
      },
    );
  }

  render() {
    const {
      trigger,
    } = this.props;

    return React.cloneElement(trigger(), {
      onClick: this.handlePrint,
    });
  }
}

export default ReactToPrint;
export { print };
