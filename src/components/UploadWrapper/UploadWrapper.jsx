import React from 'react';
import { Upload } from 'antd';
/**
 * 获取上传图片宽高
 * @param {*} file 
 */
function getImageSize(file) {
    if(file.type.indexOf('image')===-1){
        return Promise.reject('上传的文件不是图片');
    }
    return new Promise((resolve, reject) => {
        let filereader = new FileReader();
        filereader.onload = e => {
            let src = e.target.result;
            let image = new Image();
            image.onload = function () {
                resolve(this);
            };
            image.onerror = reject;
            image.src = src;
        };
        filereader.readAsDataURL(file);
    });
}
export default class UploadWrapper extends React.Component {
    // 验证文件类型
    validateFileType(file) {
        let { acceptFileType } = this.props;
        let fileType = file.type.split('/')[0];
        return (!acceptFileType || acceptFileType.includes(fileType));
    }
    validateFileSize(file) {
        let { maxSize } = this.props;
        if (!maxSize) { return true; }
        let fileSize = file.size / 1024 / 1024;// 单位M
        return maxSize > fileSize;
    }
    // 上传前的校验
    handleBeforeUpload = (file, ...restParams) => {
        let { beforeUpload } = this.props;
        // if (!this.validateFileType(file)) { return false; }
        if (!this.validateFileSize(file)) { return false; }
        if (typeof beforeUpload === 'function') {
            return beforeUpload(file, ...restParams);
        }
    }
    render() {
        let { children, ...restProps } = this.props;
        return <Upload
            {...restProps}
            beforeUpload={this.handleBeforeUpload}
        >
            {children}
        </Upload>
    }
}
