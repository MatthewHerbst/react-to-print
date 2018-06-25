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
    content: PropTypes.func.isRequired,
    /** Callback function to trigger before print */
    onBeforePrint: PropTypes.func,
    /** Callback function to trigger after print */
    onAfterPrint: PropTypes.func,
    /** Optional class to pass to the print window body */
    bodyClass: PropTypes.string,
    /** Debug Mode */
    debug: PropTypes.bool
  };

  static defaultProps = {
    copyStyles: true,
    closeAfterPrint: true,
    bodyClass: '',
    debug: false
  };

  triggerPrint(target) {
    if (this.props.onBeforePrint) {
      this.props.onBeforePrint();
    }
    setTimeout(() => {
      if (!this.props.debug) {
        target.focus();
        target.print();
        if (this.props.closeAfterPrint) {
          target.close();
        }
      }
    }, 500);
  }

  handlePrint = () => {
  
    const {
      content,
      copyStyles,
      onAfterPrint
    } = this.props;

    let printWindow = document.createElement('iframe');
    printWindow.style.position = 'absolute';
    printWindow.style.top = '-1000px';
    printWindow.style.left = '-1000px';

    const contentEl = content();
    const contentNodes = findDOMNode(contentEl);

    const linkNodes = document.querySelectorAll('link[rel="stylesheet"]');

    this.linkTotal = linkNodes.length;
    this.linkLoaded = 0;

    const markLoaded = (type) => {

      this.linkLoaded++;

      if (this.linkLoaded === this.linkTotal) {       
        this.triggerPrint(printWindow.contentWindow);
      }

    };

    printWindow.onload = function() {

      let domDoc = printWindow.contentDocument || printWindow.contentWindow.document;

      domDoc.open();
      domDoc.write(contentNodes.outerHTML);
      domDoc.close();

      let styleEl = domDoc.createElement('style');
      styleEl.appendChild(domDoc.createTextNode("@page { size: auto;  margin: 0mm; } @media print { body { -webkit-print-color-adjust: exact; } }"));
      domDoc.head.appendChild(styleEl);

      if (copyStyles !== false) {

        const headEls = document.querySelectorAll('style, link[rel="stylesheet"]');

        [...headEls].forEach(node => { 
        
          const doc = printWindow.contentDocument || printWindow.document;
          let newHeadEl = doc.createElement(node.tagName);

          if (node.textContent)
            newHeadEl.textContent = node.textContent;
          else if (node.innerText)
            newHeadEl.innerText = node.innerText;
    
          let attributes = [...node.attributes];
          attributes.forEach(attr => {
            newHeadEl.setAttribute(attr.nodeName, attr.nodeValue);
          });

          if (node.tagName === 'LINK') {
            newHeadEl.onload = markLoaded.bind(null, 'link');
            newHeadEl.onerror = markLoaded.bind(null, 'link');          
          }

          domDoc.head.appendChild(newHeadEl);

        });

      }

    }

    document.body.appendChild(printWindow);

    if (this.props.debug) {
      console.log("** DEBUG MODE **");
      console.log(printWindow.document);
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
