// TODO: why does the dev build not pick this up automatically?
// https://github.com/microsoft/TypeScript-React-Starter/issues/12#issuecomment-369113072
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path='../index.d.ts'/>

import * as React from "react";

import image from '../test_image.png';

type Props = {
  text?: string,
};

type State = {
  checked: boolean,
};

export class ComponentToPrint extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { checked: false };
  }

  private canvasEl!: HTMLCanvasElement;

  public componentDidMount() {
    const ctx = this.canvasEl.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.arc(95, 50, 40, 0, 2 * Math.PI);
      ctx.stroke();
    }
  }

  private handleCheckboxOnChange = () => this.setState({ checked: !this.state.checked });

  private setRef = (ref: HTMLCanvasElement) => this.canvasEl = ref;

  public render() {
    const {
      text,
    } = this.props;

    return (
      <div className="relativeCSS">
        <div className="flash" />
        <img alt="A test image" src={image as string} />
        <img alt="This will warn but not block printing" />
        <table className="testClass">
          <thead>
          <tr>
            <th className="column1">Column One</th>
            <th>Column Two</th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <td>{text ?? 'Custom Text Here'}</td>
            <td>
              <input
                checked={this.state.checked}
                onChange={this.handleCheckboxOnChange}
                type="checkbox"
              />
            </td>
          </tr>
          <tr>
            <td>
              <select name="cars" id="cars">
                <option value="volvo">Volvo</option>
                <option value="saab">Saab</option>
                <option value="mercedes">Mercedes</option>
                <option value="audi">Audi</option>
              </select>
            </td>
            <td>
              Blue
              <input type="radio" id="blue" name="color" value="blue" />
              Red
              <input type="radio" id="red" name="color" value="red" />
            </td>
          </tr>
          <tr>
            <td>
              <input type="date" />
            </td>
            <td>
              Test Date
            </td>
          </tr>
          <tr>
            <td>
              <input />
            </td>
            <td>
              <img
                alt="Google logo"
                src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png"
                width="50"
              />
            </td>
          </tr>
          <tr>
            <td>svg</td>
            <td>
              <svg height="100" width="100">
                <circle cx="50" cy="50" fill="yellow" r="40" stroke="green" strokeWidth="4" />
              </svg>
            </td>
          </tr>
          <tr>
            <td>canvas</td>
            <td>
              <canvas height="100" id="myCanvas" ref={this.setRef} width="200">
                Your browser does not support the HTML5 canvas tag.
              </canvas>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

export const FunctionalComponentToPrint = React.forwardRef<ComponentToPrint | null, Props>((props, ref) => { // eslint-disable-line max-len
  return <ComponentToPrint ref={ref} text={props.text} />;
});
