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
    /** Optional class to pass to the print window body */
    bodyClass: PropTypes.string,
  };

  static defaultProps = {
    copyStyles: true,
    closeAfterPrint: true,
    bodyClass: '',
  };

  triggerPrint(target) {
    if (this.props.onBeforePrint) {
      this.props.onBeforePrint();
    }
    setTimeout(() => {
      target.contentWindow.focus();
      target.contentWindow.print();
      this.removeWindow(target);
    }, 500);
  }

  removeWindow(target) { 
    setTimeout(() => {
      target.parentNode.removeChild(target);
    }, 1500);
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

    this.linkTotal = linkNodes.length || 0;
    this.linkLoaded = 0;

    const markLoaded = (type) => {

      this.linkLoaded++;

      if (this.linkLoaded === this.linkTotal) {       
        this.triggerPrint(printWindow);
      }

    };

    printWindow.onload = () => {

      let domDoc = printWindow.contentDocument || printWindow.contentWindow.document;

      domDoc.open();
      domDoc.write(contentNodes.outerHTML);
      domDoc.close();

      let styleEl = domDoc.createElement('style');
      styleEl.appendChild(domDoc.createTextNode("@page { size: auto;  margin: 0mm; } @media print { body { -webkit-print-color-adjust: exact; } }"));
      domDoc.head.appendChild(styleEl);

      if (copyStyles !== false) {

        const headEls = document.querySelectorAll('style, link[rel="stylesheet"]');
        let styleCSS = "";

        [...headEls].forEach(node => { 
        
          if (node.tagName === 'STYLE') {

            if (node.sheet) {
              for (let i = 0; i < node.sheet.cssRules.length; i++) {
                styleCSS += node.sheet.cssRules[i].cssText + "\r\n";
              }

            }

          } else {

            let newHeadEl = domDoc.createElement(node.tagName);
      
            let attributes = [...node.attributes];
            attributes.forEach(attr => {
              newHeadEl.setAttribute(attr.nodeName, attr.nodeValue);
            });

            newHeadEl.onload = markLoaded.bind(null, 'link');
            newHeadEl.onerror = markLoaded.bind(null, 'link');          
            domDoc.head.appendChild(newHeadEl);

          }


        });

        if (styleCSS.length) {
          let newHeadEl = domDoc.createElement('style');
          newHeadEl.setAttribute('id', 'react-to-print');
          newHeadEl.appendChild(domDoc.createTextNode(styleCSS));
          domDoc.head.appendChild(newHeadEl);
        }

      }

      if (this.linkTotal === 0 || copyStyles === false) {
        this.triggerPrint(printWindow);
      }

    };

    document.body.appendChild(printWindow);

  }

  render() {

    return React.cloneElement(this.props.trigger(), {
     ref: (el) => this.triggerRef = el,
     onClick: this.handlePrint
    });

  }

}

export default ReactToPrint;
