import * as React from 'react';
import * as ReactDOM from 'react-dom';

import ReactToPrint from '../src/index';
import ComponentToPrint from './ComponentToPrint';

interface State {
    texto: string;
}

interface Props {

}

class Example extends React.Component<Props, State> {
    componentRef: ComponentToPrint;

    constructor(props: Props) {
        super(props);
        this.state = {
            texto: "000000000";
        };
    }

    handleAfterPrint = () => console.log('after print!');
    handleBeforePrint = () => console.log('before print!');
    renderContent = () => this.componentRef;
    renderTrigger = () => <button type="button">Print this out!</button>;
    onBeforeGetContent = () => {
        this.setState({texto: "aaaaaaaaaaaaaa"};
        Promise.resolve(() => true);
    });

    setRef = ref => this.componentRef = ref;

    render() {
        return (
            <div>
                <ReactToPrint
                    trigger={this.renderTrigger}
                    content={this.renderContent}
                    onBeforePrint={this.handleBeforePrint}
                    onAfterPrint={this.handleAfterPrint}
                    onBeforeGetContent={this.onBeforeGetContent}
                    removeAfterPrint
                />
                <ComponentToPrint ref={this.setRef} texto={this.state.texto}/>
            </div>
        );
    }
}

ReactDOM.render(<Example/>, document.getElementById('app-root'));
