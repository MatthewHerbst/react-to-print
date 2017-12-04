import React from "react";
import ReactDOM from "react-dom";
import ReactToPrint from "../src/";

class ComponentToPrint extends React.Component {
  render() {
    return (
      <table>
        <thead>
          <tr>
            <th>Column One</th>
            <th>Column Two</th>
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
         />               
        <ComponentToPrint ref={(el) => this.componentRef = el} />
      </div>
    );

  }
}

export default Example;

ReactDOM.render(<Example />, document.getElementById("app-root"));
