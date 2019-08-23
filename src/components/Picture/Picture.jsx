import React from 'react';
import { Modal } from 'antd';
import "./Picture.scss";
export default class Picture extends React.Component {
    state = {
        modalVisible: false,
    }
    handleClick = () => {
        let { onClick } = this.props;
        this.openModal();
        onClick && onClick();
    }
    openModal = () => {
        this.setState({ modalVisible: true })
    }
    closeModal = () => {
        this.setState({ modalVisible: false })
    }
    render() {
        let { src, alt = '', onClick, ...restProps } = this.props;
        let { modalVisible } = this.state;
        return <React.Fragment>
            <a href="javascript:;" onClick={this.handleClick}>
                <img src={src} alt={alt} {...restProps} />
            </a>
            <Modal className="picture-preview-modal"
                width="80vh"
                visible={modalVisible} footer={null} onCancel={this.closeModal}>
                <img src={src} alt={alt} />
            </Modal>
        </React.Fragment>
    }
}