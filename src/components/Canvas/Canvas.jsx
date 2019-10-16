import React from 'react';
// TODO:需要实现scanner.png的效果
export default class Canvas extends React.Component {
    ref = React.createRef();
    draw(){
        let gradient = this.ctx.createLinearGradient(0,0,100,0);
        gradient.addColorStop(0,'rgba(0,0,0,0.2)');
        gradient.addColorStop(1,'rgba(0,0,0,0.8)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0,0,100,100);

        this.ctx.beginPath();
        

    }
    componentDidMount() {
        this.canvas = this.ref.current;
        this.ctx = this.canvas.getContext('2d');
        this.draw();
        
    }
    render() {
        return <canvas ref={this.ref}></canvas>
    }
}