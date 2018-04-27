import React from "react";
import ReactDOM from "react-dom";
import ReactToPrint from "../src/";

class ComponentToPrint extends React.Component {
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
              <td>6</td>
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
