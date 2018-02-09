import React from "react";
import { findDOMNode } from "react-dom";
import PropTypes from "prop-types";

class ReactToPrint extends React.Component {

  static propTypes = {
    /** Copy styles over into print window. default: true */
    copyStyles: PropTypes.bool, 
    /** Trigger action used to open browser print */
    trigger: PropTypes.func.isRequired,
    /** Content to be printed */
    content: PropTypes.func.isRequired
  };

  static defaultProps = {
    copyStyles: true
  };

  handlePrint = () => {
  
    const {
      content,
      copyStyles
    } = this.props;

    const contentEl = content();
    const contentHTML = findDOMNode(contentEl).outerHTML;
    
    let printWindow = window.open("/", "Print", "status=no, toolbar=no, scrollbars=yes", "false");

    if (copyStyles !== false) {
      const headEls = document.head.querySelectorAll('link, style');
      headEls.forEach(node => printWindow.document.head.appendChild(node.cloneNode(true)));
    }

    /* remove date/time from top */
    let style = document.createElement('style');
    style.appendChild(document.createTextNode("@page { size: auto;  margin: 0mm; }"));

    printWindow.document.head.appendChild(style);
    printWindow.document.body.innerHTML = contentHTML;
    console.log(contentHTML);

    setTimeout(function() {
      printWindow.print();
      printWindow.close();
    }, 2250);

  }

  render() {

    return React.cloneElement(this.props.trigger(), {
     ref: (el) => this.triggerRef = el,
     onClick: this.handlePrint
    });

  }

}

export default ReactToPrint;