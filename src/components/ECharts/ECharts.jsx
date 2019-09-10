/* eslint-disable no-unused-expressions */
/*
 * @Author: Z 
 * @Date: 2019-09-07 19:36:30 
 * @Last Modified by: Z
 * @Last Modified time: 2019-09-07 19:37:14
 */
import React from 'react';
import echarts from 'echarts/lib/echarts';
import _ from 'lodash';
export default class ECharts extends React.Component {
    static defaultProps = {
        className: '',
        onMount: _.noop,
        option: {}
    }
    ref = React.createRef();
    draw() {
        let { option } = this.props;
        this.chart?.setOption(option);
    }
    handleResize = () => {
        this.chart?.resize();
    }
    componentDidUpdate(prevProps, prevState) {
        if (prevProps.option !== this.props.option) {
            this.draw();
        }
    }
    componentDidMount() {
        let { onMount } = this.props;
        let chart = echarts.init(this.ref.current);
        this.chart = chart;
        this.draw();
        onMount(chart, this);
        window.addEventListener('resize', this.handleResize);
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
        this.chart.clear();
        this.chart.dispose();
    }
    render() {
        let { onMount, option, className, ...restProps } = this.props;
        return <div ref={this.ref} className={'echarts-wrapper ' + className} {...restProps}></div>
    }
}