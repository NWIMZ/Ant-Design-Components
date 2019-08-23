/**
 * @Author: Z 
 * @Date: 2019-08-14 ‏‎19:08:52
 * @Last Modified by: Z
 * @Last Modified time: 2019-08-23 17:50:04
 */
import React from 'react';
import { Modal } from 'antd';
import "./Video.scss";
export default class Video extends React.Component {
    static defaultProps = {
        onClick: () => { },
        popModal: false,// 是否需要弹框
    }
    state = {
        modalVisible: false,
    }
    handleClick = async () => {
        let { onClick, popModal } = this.props;
        popModal && await this.openModal().then(() => this.ref.current.play());
        onClick && onClick();
    }
    openModal = () => {
        return new Promise((resolve, reject) => {
            this.setState({ modalVisible: true }, () => {
                resolve();
            })
        })
    }
    closeModal = () => {
        return new Promise((resolve, reject) => {
            this.setState({ modalVisible: false }, () => {
                this.ref.current.pause();
                resolve();
            });
        });
    }
    ref = React.createRef();
    render() {
        let { src, children, ...restProps } = this.props;
        let { modalVisible } = this.state;
        return <React.Fragment>
            <a href="javascript:;" onClick={this.handleClick} >
                {children ? children : <video src={src} {...restProps} ></video>}
            </a>
            <Modal className="video-preview-modal"
                width="80vh"
                centered footer={null}
                visible={modalVisible}
                onCancel={this.closeModal}>
                <video src={src} ref={this.ref}></video>
            </Modal>
        </React.Fragment>
    }
}