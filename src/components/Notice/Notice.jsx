import React from 'react';
import { Carousel } from 'antd';
import { ReactComponent as ReportIcon } from './report.svg';
import './Notice.scss';
class Notice extends React.Component {
    state = {
        noticeList: [],
    }
    setWidth(index) {
        let elem = this.ref.current ?.querySelectorAll('.report-item')[index];
        if (!elem) {
            elem = this.ref.current.querySelectorAll('.report-item')[0];
        }
        let width = elem ? elem.offsetWidth : 0;
        this.setState({ width });
    }
    handleBeforeChange = (from, to) => {
        this.index = to;
        if (to > this.state.noticeList.length) {
            to = 0;
        }
        this.setWidth(to + 1);
    }
    ref = React.createRef();
    render() {
        let { noticeList, width } = this.state;
        return <React.Fragment>
            {
                noticeList && noticeList.length !== 0 ?
                    <div className="notice-wrapper" style={{ width: width + 30 + 'px' }} ref={this.ref}>
                        <ReportIcon className={this.getClassName(noticeList[this.index] ?.type, 'report-icon')} />
                        <Carousel dotPosition="left" beforeChange={this.handleBeforeChange} dots={false} autoplay>{
                            noticeList.map((infos, index) => {
                                return <span
                                    key={index}
                                    className={this.getClassName(infos.type, 'report-item')}>
                                    {infos.msg}
                                </span>
                            })
                        }</Carousel>
                    </div>
                    :
                    <div className="notice-wrapper"></div>
            }
        </React.Fragment>
    }
}
export default Notice
