import * as React from 'react';

type Props = {
    text: string
}
export default class ComponentToPrint<Props> extends React.Component {
    canvasEl: HTMLCanvasElement = null;

    componentDidMount() {
        const ctx = this.canvasEl.getContext('2d');
        ctx.beginPath();
        ctx.arc(95, 50, 40, 0, 2 * Math.PI);
        ctx.stroke();
    }

    setRef = ref => this.canvasEl = ref;

    render() {
        return (
            <div className="relativeCSS">
                <div className="flash"/>
                <img src="example/test_image.png" alt="test"/>
                <table className="testclass">
                    <thead>
                    <tr>
                        <th style={{color: '#FF0000'}}>Column One</th>
                        <th className="testth">Column Two</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>{this.props.text}</td>
                        <td>2</td>
                    </tr>
                    <tr>
                        <td>3</td>
                        <td>4</td>
                    </tr>
                    <tr>
                        <td>5</td>
                        <td><img
                            src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png"
                            width="50" alt="Google logo"/></td>
                    </tr>
                    <tr>
                        <td>svg</td>
                        <td>
                            <svg width="100" height="100">
                                <circle cx="50" cy="50" r="40" stroke="green" strokeWidth="4" fill="yellow"/>
                            </svg>
                        </td>
                    </tr>
                    <tr>
                        <td>canvas</td>
                        <td>
                            <canvas id="myCanvas" ref={this.setRef} width="200" height="100">
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
