import React from 'react';
import ReactDOM from 'react-dom';

import ReactToPrint from '../src';
import ComponentToPrint from './ComponentToPrint';

class Example extends React.Component {
  
  constructor(props){
    super(props);
    this.state = {
      print:false,
  }
      
  handleAfterPrint = () => {
    console.log('after print!'); // eslint-disable-line no-console
  }

  handleBeforePrint = () => {
    console.log('before print!'); // eslint-disable-line no-console
  }

  renderContent = () => { // eslint-disable-line arrow-body-style
    return this.componentRef;
  }

  renderTrigger = () => { // eslint-disable-line arrow-body-style
    return <button type="button">Print this out!</button>;
  }

  setRef = (ref) => {
    this.componentRef = ref;
  }

  handleStatePrint = (e)=>{
    this.setState({print : true});
    console.log("print-r go")
  }
  handleStatePrintOff = (e)=>{
    this.setState({print : false});
    console.log("print-r stop")
  }



  render() {
    return (
      <div>
        <button onClick={this.handleStatePrint} type="button">Print with state!</button>
        <ReactToPrint
          trigger={this.renderTrigger}
          content={this.renderContent}
          onBeforePrint={this.handleBeforePrint}
          onAfterPrint={this.handleAfterPrint}
          statePrint={this.state.print}
          handleStatePrintOff={this.handleStatePrintOff}
        />
        <ComponentToPrint ref={this.setRef} />
      </div>
    );
  }
}

export default Example;

ReactDOM.render(<Example />, document.getElementById('app-root'));
