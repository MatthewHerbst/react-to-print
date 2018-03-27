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

  triggerPrint(target) {
    setTimeout(() => {
      target.print();
      target.close();
    }, 500);
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
        this.triggerPrint(printWindow);
      }
    };

    [...imageNodes].forEach((child) => {
      child.setAttribute('src', child.src);
      child.onload = markLoaded;
      child.onerror = markLoaded;
    });

    /*
     * IE does not seem to allow appendChild from different window contexts correctly.  They seem to come back
     * as plain objects. In order to get around this each tag is re-created into the printWindow
     * https://stackoverflow.com/questions/38708840/calling-adoptnode-and-importnode-on-a-child-window-fails-in-ie-and-edge
     */
    if (copyStyles !== false) {

      const headEls = document.querySelectorAll('style, link[rel="stylesheet"]');
      [...headEls].forEach(node => { 
      
        let newHeadEl = printWindow.document.createElement(node.tagName);

        if (node.textContent)
          newHeadEl.textContent = node.textContent;
        else if (node.innerText)
          newHeadEl.innerText = node.innerText;
  
        let attributes = [...node.attributes];
        attributes.forEach(attr => {

          let nodeValue = attr.nodeValue;

          if (attr.nodeName === 'href' && /^https?:\/\//.test(attr.nodeValue) === false) {
            nodeValue = document.location.protocol + '//' + document.location.host + nodeValue;
          }

          newHeadEl.setAttribute(attr.nodeName, nodeValue);
        });

        printWindow.document.head.appendChild(newHeadEl);

      });

    }

    if (document.body.className) {
      const bodyClasses = document.body.className.split(" ");
      bodyClasses.map(item => printWindow.document.body.classList.add(item));
    }

    /* remove date/time from top */
    let styleEl = printWindow.document.createElement('style');
    styleEl.appendChild(printWindow.document.createTextNode("@page { size: auto;  margin: 0mm; } @media print { body { -webkit-print-color-adjust: exact; } }"));

    printWindow.document.head.appendChild(styleEl);
    printWindow.document.body.innerHTML = contentNodes.outerHTML;

    if (this.imageTotal === 0) {
      this.triggerPrint(printWindow);
    }

  }

  render() {

    return React.cloneElement(this.props.trigger(), {
     ref: (el) => this.triggerRef = el,
     onClick: this.handlePrint
    });

  }

}

export default ReactToPrint;
