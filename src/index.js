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
    /** Close the print window after action */
    closeAfterPrint: PropTypes.bool,
    /** Optional class to pass to the print window body */
    bodyClass: PropTypes.string,
    /** Options to pass to the third argument of window.open() */
    printWindowOptions: PropTypes.shape({}),
    /** Debug Mode */
    debug: PropTypes.bool
  };

  static defaultProps = {
    copyStyles: true,
    closeAfterPrint: true,
    bodyClass: '',
    printWindowOptions: {
      status: 'no',
      toolbar: 'no',
      scrollbars: 'yes',
    },
    debug: false
  };

  triggerPrint(target) {
    if (this.props.onBeforePrint) {
      this.props.onBeforePrint();
    }
    setTimeout(() => {
      if (!this.props.debug) {
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
      onAfterPrint,
      printWindowOptions
    } = this.props;
    
    const mappedPrintWindowOptions = Object.keys(printWindowOptions).map(m => `${m}=${printWindowOptions[m]}`).join(', ');

    let printWindow = window.open('', 'Print', mappedPrintWindowOptions, 'false');
    
    if (onAfterPrint) {
      printWindow.onbeforeunload = onAfterPrint;
    }

    const contentEl = content();
    const contentNodes = findDOMNode(contentEl);

    const imageNodes = [...contentNodes.getElementsByTagName("img")];
    const linkNodes = document.querySelectorAll('link[rel="stylesheet"]');

    this.imageTotal = imageNodes.length;
    this.imageLoaded = 0;

    this.linkTotal = linkNodes.length;
    this.linkLoaded = 0;

    const markLoaded = (type) => {

      if (type === 'image')
        this.imageLoaded++;
      else if (type === 'link')
        this.linkLoaded++;

      if (this.imageLoaded === this.imageTotal && this.linkLoaded === this.linkTotal) {
        this.triggerPrint(printWindow);
      }

    };

    [...imageNodes].forEach((child) => {
      /** Workaround for Safari if the image has base64 data as a source */
      if (/^data:/.test(child.src)) {
        child.crossOrigin = 'anonymous';
      }
      child.setAttribute('src', child.src);
      child.onload = markLoaded.bind(null, 'image');
      child.onerror = markLoaded.bind(null, 'image');
      child.crossOrigin = 'use-credentials';
    });

    /*
     * IE does not seem to allow appendChild from different window contexts correctly.  They seem to come back
     * as plain objects. In order to get around this each tag is re-created into the printWindow
     * https://stackoverflow.com/questions/38708840/calling-adoptnode-and-importnode-on-a-child-window-fails-in-ie-and-edge
     */
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

          let nodeValue = attr.nodeValue;

          if (
            attr.nodeName === 'href' && 
            /^https?:\/\//.test(attr.nodeValue) === false && 
            /^blob:/.test(attr.nodeValue) === false
          ) {
            
            const relPath = attr.nodeValue.substr(0, 3) === "../" 
              ? document.location.pathname.replace(/[^/]*$/, '') 
              : "/";

            nodeValue = nodeValue.replace(/\/+/, '');
            nodeValue = document.location.protocol + '//' + document.location.host + relPath + nodeValue;
            
          }

          newHeadEl.setAttribute(attr.nodeName, nodeValue);
        });

        if (node.tagName === 'LINK') {
          newHeadEl.onload = markLoaded.bind(null, 'link');
          newHeadEl.onerror = markLoaded.bind(null, 'link');          
        }

        printWindow.document.head.appendChild(newHeadEl);

      });

    }

    if (document.body.className) {
      const bodyClasses = document.body.className.split(" ");
      bodyClasses
          .filter(item => item)
          .map(item => printWindow.document.body.classList.add(item));
    }
    
    if (this.props.bodyClass.length) {
      printWindow.document.body.classList.add(this.props.bodyClass);
    }

    /* remove date/time from top */
    let styleEl = printWindow.document.createElement('style');
    styleEl.appendChild(printWindow.document.createTextNode("@page { size: auto;  margin: 0mm; } @media print { body { -webkit-print-color-adjust: exact; } }"));

    printWindow.document.head.appendChild(styleEl);
    printWindow.document.body.innerHTML = contentNodes.outerHTML;

    if (this.imageTotal === 0 || copyStyles === false) {
      this.triggerPrint(printWindow);
    }

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
