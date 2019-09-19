import * as React from "react";
import * as ReactDOM from "react-dom";

import ReactToPrint from "../src/index";
import ComponentToPrint from "./ComponentToPrint";

interface State {
    text: string;
}

interface Props {

}

class Example extends React.Component<Props, State> {
    private componentRef: ComponentToPrint;

    constructor(props: Props) {
        super(props);
        this.state = {
            text: "000000000",
        };
    }

    private handleAfterPrint = () => console.log('after print!');
    private handleBeforePrint = () => console.log('before print!');
    private renderContent = () => this.componentRef;
    private renderTrigger = () => <button type="button">Print this out!</button>;
    private onBeforeGetContent = () => this.setState({text: "text changed"});

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
