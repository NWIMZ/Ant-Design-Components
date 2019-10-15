/**
 * @Author: Z 
 * @Date: 2019-08-16 15:45:12 
 * @Last Modified by: Z
 * @Last Modified time: 2019-08-23 17:50:34
 */
import React from 'react';
import classnames from 'classnames';
import "./VoiceMessage.scss"
import { ReactComponent as VoiceWaveSvg } from './VoiceWaveSvg.svg';
export default class VoiceMessage extends React.Component {
    static defaultProps = {
        color: '#1890FF'
    }
    state = {
        step: 3
    }
    timeId = null;
    ref = React.createRef();// audio
    handleClick = () => {
        this.play();
    }
    play() {
        this.stop();
        this.setState({ step: 0 });
        this.audio.play().then(() => { }, (e) => {
            console.error(e);
            this.stop();
        });
        this.timeId = setInterval(() => {
            let { step } = this.state;
            step = step === 3 ? 0 : step + 1;
            this.setState({ step });
        }, 300);
    }
    stop() {
        this.audio.pause();
        clearInterval(this.timeId);
    }
    handleEnded = () => {
        this.stop();
        this.setState({ step: 3 });
    }
    componentDidMount() {
        let audio = this.ref.current;
        this.audio = audio;
        audio.onended = this.handleEnded;
    }
    componentWillUnmount() {
        this.stop();
    }
    render() {
        let { src, color, length, className = '' } = this.props;
        let { step } = this.state;
        return <div className={classnames("voice-message-wrapper ", className)}>
            <div
                className="voice-message"
                style={{ backgroundColor: color }}
                onClick={this.handleClick}
            >
                <audio ref={this.ref} preload="auto" src={src} ></audio>
                <div className={classnames("voice-icon step", step)}>
                    <VoiceWaveSvg width={null} height={null} />
                </div>
            </div>
            <span className="voice-message-length">{length ? length + '”' : ''}</span>
        </div>
    }
}