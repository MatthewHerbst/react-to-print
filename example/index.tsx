import * as React from 'react';
import * as ReactDOM from 'react-dom';

import ReactToPrint from '../src/index';
import ComponentToPrint from './ComponentToPrint';

interface State {
    text: string;
}

interface Props {

}

class Example extends React.Component<Props, State> {
    componentRef: ComponentToPrint;

    constructor(props: Props) {
        super(props);
        this.state = {
            text: "000000000";
        };
    }

    handleAfterPrint = () => console.log('after print!');
    handleBeforePrint = () => console.log('before print!');
    renderContent = () => this.componentRef;
    renderTrigger = () => <button type="button">Print this out!</button>;
    onBeforeGetContent = () => new Promise((resolve, reject) => {
        this.setState({text: "text changed"}, () => resolve);
        //if something goes wrong, regect the promise:
        //reject();
    }));

    setRef = ref => this.componentRef = ref;

    render() {
        return (
            <div>
                <ReactToPrint
                    trigger={this.renderTrigger}
                    content={this.renderContent}
                    onBeforeGetContent={this.onBeforeGetContent}
                    onBeforePrint={this.handleBeforePrint}
                    onAfterPrint={this.handleAfterPrint}
                    removeAfterPrint
                />
                <ComponentToPrint ref={this.setRef} text={this.state.text}/>
            </div>
        );
    }
}

ReactDOM.render(<Example/>, document.getElementById('app-root'));
