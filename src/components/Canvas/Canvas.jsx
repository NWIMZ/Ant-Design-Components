import React from 'react';
export default class Canvas extends React.Component {
    ref = React.createRef();
    componentDidMount() {
        this.canvas = this.ref.current;
        this.ctx = this.canvas.getContext('2d');
        
    }
    render() {
        return <canvas ref={this.ref}></canvas>
    }
}