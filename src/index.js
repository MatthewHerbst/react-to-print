import React from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';

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
    onAfterPrint: false,
    onBeforePrint: false,
    pageStyle: undefined,
  };

  removeWindow = (target) => {
    setTimeout(() => {
      target.parentNode.removeChild(target);
    }, 500);
  }

  triggerPrint = (target) => {
    const { onBeforePrint, onAfterPrint } = this.props;

    if (onBeforePrint) {
      onBeforePrint();
    }

    setTimeout(() => {
      target.contentWindow.focus();
      target.contentWindow.print();
      this.removeWindow(target);

      if (onAfterPrint) {
        onAfterPrint();
      }
    }, 500);
  }

  handlePrint = () => {

    const {
      bodyClass,
      content,
      copyStyles,
      pageStyle,
    } = this.props;

    const contentEl = content();

    if (contentEl === undefined) {
      console.error("Refs are not available for stateless components. For 'react-to-print' to work only Class based components can be printed"); // eslint-disable-line no-console
      return;
    }

    const printWindow = document.createElement('iframe');
    printWindow.style.position = 'absolute';
    printWindow.style.top = '-1000px';
    printWindow.style.left = '-1000px';

    const contentNodes = findDOMNode(contentEl);
    const linkNodes = document.querySelectorAll('link[rel="stylesheet"]');

    this.linkTotal = linkNodes.length || 0;
    this.linksLoaded = [];
    this.linksErrored = [];

    const markLoaded = (linkNode, loaded) => {
      if (loaded) {
        this.linksLoaded.push(linkNode);
      } else {
        console.error("'react-to-print' was unable to load a link. It may be invalid. 'react-to-print' will continue attempting to print the page. The link the errored was:", linkNode); // eslint-disable-line no-console
        this.linksErrored.push(linkNode);
      }

      // We may have errors, but attempt to print anyways - maybe they are trivial and the user will
      // be ok ignoring them
      if (this.linksLoaded.length + this.linksErrored.length === this.linkTotal) {
        this.triggerPrint(printWindow);
      }
    };

    printWindow.onload = () => {
      /* IE11 support */
      if (window.navigator && window.navigator.userAgent.indexOf('Trident/7.0') > -1) {
        printWindow.onload = null;
      }

      const domDoc = printWindow.contentDocument || printWindow.contentWindow.document;
      const srcCanvasEls = [...contentNodes.querySelectorAll('canvas')];

      domDoc.open();
      domDoc.write(contentNodes.outerHTML);
      domDoc.close();

      /* remove date/time from top */
      const defaultPageStyle = pageStyle === undefined
        ? '@page { size: auto;  margin: 0mm; } @media print { body { -webkit-print-color-adjust: exact; } }'
        : pageStyle;

      const styleEl = domDoc.createElement('style');
      styleEl.appendChild(domDoc.createTextNode(defaultPageStyle));
      domDoc.head.appendChild(styleEl);

      if (bodyClass.length) {
        domDoc.body.classList.add(bodyClass);
      }

      const canvasEls = domDoc.querySelectorAll('canvas');
      [...canvasEls].forEach((node, index) => {
        node.getContext('2d').drawImage(srcCanvasEls[index], 0, 0);
      });

      if (copyStyles !== false) {
        const headEls = document.querySelectorAll('style, link[rel="stylesheet"]');

        [...headEls].forEach((node, index) => {
          if (node.tagName === 'STYLE') {
            const newHeadEl = domDoc.createElement(node.tagName);

            if (node.sheet) {
              let styleCSS = '';

              for (let i = 0; i < node.sheet.cssRules.length; i++) {
                styleCSS += `${node.sheet.cssRules[i].cssText}\r\n`;
              }

              newHeadEl.setAttribute('id', `react-to-print-${index}`);
              newHeadEl.appendChild(domDoc.createTextNode(styleCSS));
              domDoc.head.appendChild(newHeadEl);
            }
          } else {
            const attributes = [...node.attributes];

            const hrefAttr = attributes.filter(attr => attr.nodeName === 'href');
            const hasHref = hrefAttr.length ? !!hrefAttr[0].nodeValue : false;

            // Many browsers will do all sorts of weird things if they encounter an empty `href`
            // tag (which is invalid HTML). Some will attempt to load the current page. Some will
            // attempt to load the page's parent directory. These problems can cause
            // `react-to-print` to stop  without any error being thrown. To avoid such problems we
            // simply do not attempt to load these links.
            if (hasHref) {
              const newHeadEl = domDoc.createElement(node.tagName);

              attributes.forEach((attr) => {
                newHeadEl.setAttribute(attr.nodeName, attr.nodeValue);
              });

              newHeadEl.onload = markLoaded.bind(null, newHeadEl, true);
              newHeadEl.onerror = markLoaded.bind(null, newHeadEl, false);
              domDoc.head.appendChild(newHeadEl);
            } else {
              console.warn("'react-to-print' encountered a <link> tag with an empty 'href' attribute. In addition to being invalid HTML, this can cause problems in many browsers, and so the <link> was not loaded. The <link> is:", node); // eslint-disable-line no-console
              markLoaded(node, true); // `true` because we've already shown a warning for this
            }
          }
        });
      }

      if (this.linkTotal === 0 || copyStyles === false) {
        this.triggerPrint(printWindow);
      }
    };

    
    

    document.body.appendChild(printWindow);
  }

  setRef = (ref) => {
    this.triggerRef = ref;
  }

  render() {
    const {
      trigger,
    } = this.props;

    if(this.props.useState === true){
      
      if(this.props.statePrint === true){
        this.handlePrint()
      } 

      return (
        <div></div>
      )     
    }else{
      
      return React.cloneElement(trigger(), {
        onClick: this.handlePrint, 
        ref: this.setRef,
      });
    }


  }
  componentDidUpdate(prevProps) {
    // Typical usage (don't forget to compare props):
    if (this.props.statePrint !== prevProps.statePrint) {
      this.props.handleStatePrintOff();
      console.log("TURN OFF MOUNT")
    }
  }
}

export default ReactToPrint;
