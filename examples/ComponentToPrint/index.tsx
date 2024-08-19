// TODO: why does the dev build not pick this up automatically?
// https://github.com/microsoft/TypeScript-React-Starter/issues/12#issuecomment-369113072
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path='../extensions.d.ts'/>

import * as React from 'react';

import image from '../test_image.png';

interface ComponentToPrintProps {
  text?: string;
}

export const ComponentToPrint = React.forwardRef<HTMLDivElement | null, ComponentToPrintProps>((props, ref) => {
  const { text } = props;

  const canvasEl = React.useRef<HTMLCanvasElement>(null);
  const shadowRootHostEl = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const ctx = canvasEl.current?.getContext("2d");

    if (ctx) {
      ctx.beginPath();
      ctx.arc(95, 50, 40, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.fillStyle = 'rgb(200, 0, 0)';
      ctx.fillRect(85, 40, 20, 20);
      ctx.save();
    }
  }, []);

  React.useEffect(() => {
    const shadowRoot = shadowRootHostEl.current?.attachShadow({ mode: 'open' });
    if (shadowRoot) {
      const div = document.createElement('div');
      div.innerHTML = 'Shadow DOM Content';
      shadowRoot.appendChild(div);
    }
  }, []);

  return (
    <div className="relativeCSS" ref={ref}>
      <link
        // This tests that we properly ignore disabled nodes
        // Learn more: https://github.com/MatthewHerbst/react-to-print/pull/537
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        disabled
        rel="stylesheet"
        href="../disabled.css"
      />
      <style type="text/css" media="print">{"@page { size: landscape; }"}</style>
      <link href="./as-style.css" rel="stylesheet" />
      <div className="flash" />
      <table className="testClass">
        <thead>
          <tr>
            <th className="column1">Test Name</th>
            <th>Test</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              Test loading {"<link>"}s with multi-value `rel`
            </td>
            <td>
              <div className="multi-rel">Purple Background</div>
            </td>
          </tr>
          <tr>
            <td>
              Test loading {"<link>"}s with `as="style"`
            </td>
            <td>
              <div className="as-style">Blue Background</div>
            </td>
          </tr>
          <tr>
            <td>Canvass</td>
            <td>
              <canvas height="100" ref={canvasEl} width="200">
                Your browser does not support the HTML5 canvas tag.
              </canvas>
            </td>
          </tr>
          <tr>
            <td>Dynamic Content From Prop</td>
            <td>{text ?? 'Custom Text Here'}</td>
          </tr>
          <tr>
            <td>Fonts</td>
            <td>
              <div className="externalCustomFont">Some Cool Font Text</div>
              <div className="internalCustomFontInterThin">123456789</div>
              <div className="internalCustomFrontInterBlackItalic">
                Some Cool Font Text
              </div>
            </td>
          </tr>
          <tr>
            <td>Image: Local Import</td>
            <td><img alt="A test image" src={image as string} width="200" /></td>
          </tr>
          <tr>
            <td>Image: URL</td>
            <td>
              <img
                alt="Google logo"
                src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png"
                width="200"
              />
            </td>
          </tr>
          <tr>
            <td>Input</td>
            <td><input /></td>
          </tr>
          <tr>
            <td>Input: Checkbox</td>
            <td>
              <input type="checkbox" />
            </td>
          </tr>
          <tr>
            <td>Input: Date</td>
            <td><input type="date" /></td>
          </tr>
          <tr>
            <td>Input: Radio</td>
            <td>
              Blue <input type="radio" id="blue" name="color" value="blue" />
              Red <input type="radio" id="red" name="color" value="red" />
            </td>
          </tr>
          <tr>
            <td>Select</td>
            <td>
              <select name="cars" id="cars">
                <option value="volvo">Volvo</option>
                <option value="saab">Saab</option>
                <option value="mercedes">Mercedes</option>
                <option value="audi">Audi</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>TextArea</td>
            <td>
              <textarea />
            </td>
          </tr>
          <tr>
            <td>SVG</td>
            <td>
              <svg height="100" width="100">
                <circle cx="50" cy="50" fill="yellow" r="40" stroke="green" strokeWidth="4" />
              </svg>
            </td>
          </tr>
          <tr>
            <td>Video</td>
            <td><video src="https://www.w3schools.com/html/mov_bbb.mp4" width="200" /></td>
          </tr>
          <tr>
            <td>Video: With Poster</td>
            <td>
              <video
                poster="https://images.freeimages.com/images/large-previews/9a9/tuscany-landscape-4-1500765.jpg"
                src="https://www.w3schools.com/html/mov_bbb.mp4"
                width="200"
              />
            </td>
          </tr>
        </tbody>
      </table>
      <div ref={shadowRootHostEl}/>
    </div>
  );
});
