import { findDOMNode } from 'react-dom';

/**
 * Given a target indicated by a React ref, remove it.
 *
 * TODO: is the setTimeout here actually needed? It's the only reason we wrap this with a promise
 *
 * @param {String|Function} target The target to remove
 * @returns {Promise} The removal Promise chain
 */
const removePrintTarget = (target) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(target.parentNode.removeChild(target));
    }, 500);
  });
};

/**
 * Executes the print command against a given window
 * @param {String|Function} target The React ref to print
 * @param {Object} [options={}] The set of options for printing
 * @param {Function} [options.onBeforePrint] A method to run prior to printing
 * @param {Function} [options.onAfterPrint] A method to run after to printing
 * @returns {Promise} The printing Promise chain
 */
const printTarget = (target, options = {}) => {
  // Ensure whatever is returned by `onAfterPrint` is available as a Promise so that we can .then it
  const onBeforePrintPromise = Promise.resolve(
    options.onBeforePrint ? options.onBeforePrint() : undefined,
  );

  return onBeforePrintPromise
    .then(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          target.contentWindow.focus();
          target.contentWindow.print();

          resolve(
            removePrintTarget(target)
              .then(() => {
                if (options.onAfterPrint) {
                  return options.onAfterPrint();
                }
              }),
          );
        }, 500);
      });
    });
};

/**
 * Given a React ref, print the content of the Ref
 * @param {Function | RefObject} contentEl The React ref to print
 * @param {Object} [options={}] The set of options for printing
 * @param {Function} [options.onBeforePrint] A method to run prior to printing. May return a Promise
 * @param {Function} [options.onAfterPrint] A method to run after to printing. May return a Promise
 * @param {String} [options.bodyClass] Optional class to pass to the print window body
 * @param {Boolean} [options.copyStyles=true] Copy styles over into print window
 * @param {String} [options.pageStyle] Override default print window styling
 * @returns {Promise} The printing Promise chain, which may include waiting for resources to load
 * @throws {Error} If the DOM is not available
 * @throws {TypeError} If trying to print a functional component
 */
const print = (contentEl, options = {}) => {
  if (!document || !window) {
    throw new Error("'react-to-print' requires access to the DOM to work. You seem to be running in a DOM-less environment (potentially a server) where `document` and/or `window` are not available");
  }

  if (contentEl === undefined) {
    throw new TypeError("Refs are not available for functional components. This is a limitation of the React framework (https://reactjs.org/docs/refs-and-the-dom.html). For 'react-to-print' to work only Class based components can be the primary printing target");
  }

  // Create an iFrame which will be used to inject everything we want to print
  const printWindow = document.createElement('iframe');
  printWindow.style.position = 'absolute';
  printWindow.style.top = '-1000px';
  printWindow.style.left = '-1000px';

  const loadingPromises = [];

  const copyStyles = options.copyStyles ? options.copyStyles : true;

  return new Promise((resolvePrint) => {
    printWindow.onload = () => {
      /* IE11 support */
      if (window.navigator && window.navigator.userAgent.indexOf('Trident/7.0') > -1) {
        printWindow.onload = null;
      }

      const contentNodes = findDOMNode(contentEl);
      const domDoc = printWindow.contentDocument || printWindow.contentWindow.document;
      const srcCanvasEls = [...contentNodes.querySelectorAll('canvas')];

      domDoc.open();
      domDoc.write(contentNodes.outerHTML);
      domDoc.close();

      /* Remove date/time from top */
      const defaultPageStyle = options.pageStyle === undefined ?
        '@page { size: auto;  margin: 0mm; } @media print { body { -webkit-print-color-adjust: exact; } }' :
        options.pageStyle;

      const styleEl = domDoc.createElement('style');
      styleEl.appendChild(domDoc.createTextNode(defaultPageStyle));
      domDoc.head.appendChild(styleEl);

      if (options.bodyClass) {
        domDoc.body.classList.add(options.bodyClass);
      }

      const canvasEls = domDoc.querySelectorAll('canvas');
      [...canvasEls].forEach((node, index) => {
        node.getContext('2d').drawImage(srcCanvasEls[index], 0, 0);
      });

      if (copyStyles) {
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

              loadingPromises.push(new Promise((resolve) => {
                newHeadEl.onload = resolve;
                newHeadEl.onerror = () => {
                  console.error("'react-to-print' was unable to load a link. It may be invalid. 'react-to-print' will continue attempting to print the page. The link that errored was:", newHeadEl); // eslint-disable-line no-console
                  resolve();
                };
              }));

              domDoc.head.appendChild(newHeadEl);
            } else {
              console.warn("'react-to-print' encountered a <link> tag with an empty 'href' attribute. In addition to being invalid HTML, this can cause problems in many browsers, and so the <link> was not loaded. The <link> is:", node); // eslint-disable-line no-console
            }
          }
        });
      }

      // We may have errors, but attempt to print anyways - maybe they are trivial and the user will
      // be ok ignoring them
      resolvePrint(Promise.all(loadingPromises).then(() => printTarget(printWindow)));
    };

    document.body.appendChild(printWindow);
  });
};

export default print;
