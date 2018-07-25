import React from "react";
import ReactDOM from "react-dom";
import ReactToPrint from "../src/";

class ComponentToPrint extends React.Component {
  componentDidMount() {

    let ctx = this.canvasEl.getContext("2d");
    ctx.beginPath();
    ctx.arc(95,50,40,0,2*Math.PI);
    ctx.stroke();
  }

  render() {
    return (
      <div className={"relativeCSS"}>
        <div className={"flash"}></div>
        <img src="example/test_image.png" border="0" />
        <table className="testclass">
          <thead>
            <tr>
              <th style={{ color: "#FF0000"}}>Column One</th>
              <th className="testth">Column Two</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>2</td>
            </tr>
            <tr>
              <td>3</td>
              <td>4</td>
            </tr>
            <tr>
              <td>5</td>
              <td><img src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png" width="50" /></td>
            </tr>
            <tr>
              <td>svg</td>
              <td>
                <svg width="100" height="100">
                  <circle cx="50" cy="50" r="40" stroke="green" strokeWidth="4" fill="yellow" />
                </svg>
              </td>
            </tr>
            <tr>
              <td>canvas</td>
              <td>
                <canvas id="myCanvas" ref={el => this.canvasEl = el} width="200" height="100">
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

class Example extends React.Component {

  render() {
    return (
      <div>
         <ReactToPrint
          trigger={() => (
            <a href="#">Print this out!</a>
          )}
          content={() => this.componentRef}
          onBeforePrint={() => {
            console.log("before print!");
          }}
          onAfterPrint={() => {
            console.log("after print!");
          }}
         />               
        <ComponentToPrint ref={(el) => this.componentRef = el} />
      </div>
    );

  }
}

export default Example;

ReactDOM.render(<Example />, document.getElementById("app-root"));
