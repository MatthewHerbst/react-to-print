import * as React from 'react';
import * as ReactDOM from 'react-dom';

import ReactToPrint from '../src/index';
import ComponentToPrint from './ComponentToPrint';

class Example extends React.Component {
    componentRef: ComponentToPrint;

    handleAfterPrint = () => console.log('after print!');
    handleBeforePrint = () => console.log('before print!');
    renderContent = () => this.componentRef;
    renderTrigger = () => <button type="button">Print this out!</button>;

    setRef = ref => this.componentRef = ref;

    render() {
        return (
            <div>
                <ReactToPrint
                    trigger={this.renderTrigger}
                    content={this.renderContent}
                    onBeforePrint={this.handleBeforePrint}
                    onAfterPrint={this.handleAfterPrint}
                />
                <ComponentToPrint ref={this.setRef}/>
            </div>
        );
    }
}

ReactDOM.render(<Example/>, document.getElementById('app-root'));
