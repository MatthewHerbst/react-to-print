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

  constructor() {
    super();
    this.imageTotal = 0;
    this.imageLoaded = 0;
  }

  handlePrint = () => {
  
    const {
      content,
      copyStyles
    } = this.props;

    let printWindow = window.open("", "Print", "status=no, toolbar=no, scrollbars=yes", "false");

    const contentEl = content();
    const contentNodes = findDOMNode(contentEl);
    const imageNodes = [...contentNodes.getElementsByTagName("img")];

    this.imageTotal = imageNodes.length;
    this.imageLoaded = 0;

    const markLoaded = () => {
      this.imageLoaded++;
      if (this.imageLoaded === this.imageTotal) {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 200);
      }
    };

    imageNodes.forEach((child) => {
      child.setAttribute('src', child.src);
      child.onload = markLoaded;
      child.onerror = markLoaded;
    });

    if (copyStyles !== false) {
      const headEls = document.head.querySelectorAll('link, style');
      headEls.forEach(node => printWindow.document.head.appendChild(node.cloneNode(true)));
    }

    /* remove date/time from top */
    let style = document.createElement('style');
    style.appendChild(document.createTextNode("@page { size: auto;  margin: 0mm; }"));

    printWindow.document.head.appendChild(style);
    printWindow.document.body.innerHTML = contentNodes.outerHTML;

  }

  render() {

    return React.cloneElement(this.props.trigger(), {
     ref: (el) => this.triggerRef = el,
     onClick: this.handlePrint
    });

  }

}

export default ReactToPrint;