import * as React from "react";

type Props = { // tslint:disable-line interface-over-type-literal
  text: string,
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

  private handleCheckboxOnClick = () => this.setState({ checked: !this.state.checked });

  private setRef = (ref: HTMLCanvasElement) => this.canvasEl = ref;

  public render() {
    return (
      <div className="relativeCSS">
        <div className="flash" />
        <img alt="A test image" src="example/test_image.png" />
        <table className="testclass">
          <thead>
          <tr>
            <th style={{ color: "#FF0000" }}>Column One</th>
            <th className="testth">Column Two</th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <td>{this.props.text}</td>
            <td>
              <input
                checked={this.state.checked}
                onClick={this.handleCheckboxOnClick}
                type="checkbox"
              />
            </td>
          </tr>
          <tr>
            <td>3</td>
            <td>4</td>
          </tr>
          <tr>
            <td>5</td>
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
          <div className="container">
            <div>
              <img alt="Swan" src="https://free-images.com/or/a31c/swan_flying_bird_fly.jpg" width="300px"/>
            </div>
          </div>
      </div>
    );
  }
}
