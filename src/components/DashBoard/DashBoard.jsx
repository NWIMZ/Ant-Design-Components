import React from 'react';
import moment from 'moment';
import defaultScannerSrc from './scanner.png';

/**
 * 开启动画
 * @param {function} fn 动画函数
 */
function setAnimate(fn) {
    try {
        return window.requestAnimationFrame((timestamp) => {
            fn(timestamp);
        })
    } catch (e) {
        // IE、低版本浏览器兼容requestAnimationFrame
        return setTimeout(() => {
            fn(moment().valueOf());
        }, 1000 / 60);
    }
}
/**
 * 清除动画
 * @param {number} animateId 
 */
function clearAnimate(animateId) {
    try {
        window.cancelAnimationFrame(animateId);
    } catch (e) {
        clearTimeout(animateId);
    }
}
// 圆弧配置
// key为圆弧个数
const CONFIG = {
    0: { arcGapRad: 0 },
    1: { arcGapRad: 0 },
    2: {
        arcGapRad: 15
    },
    3: {
        arcGapRad: 15
    },
    4: {
        arcGapRad: 15
    },
    5: {
        arcGapRad: 10
    },
}
const COS_90 = Math.cos(getRadian(90));// js cos(90)算不准
function getRadian(a) {
    return a * Math.PI / 180;
}
export default class DashBoard extends React.Component {
    static defaultProps = {
        scale: 1,
        width: 700,// canvas尺寸
        height: 525,
        radarLineColor: 'rgba(31,181,255,0.1)',//雷达底图颜色
        sideColor: '#B0BFDC',
        titleColor: '#5A74BE',
        arcBackgroundColor: '#293364',
        fontFamily: '"Microsoft YaHei"',
        arcAlarmColor: '#F15654',
        // 数据
        centerData: {
            value: 1,
            level: '优',
            title: '综合'
        },
        sideDataList: []
    }
    constructor(props) {
        super(props);

        this.prepare();
        // 图片
        this.scannerImg = new Image();
        this.scannerImg.onload = () => {
            this.scannerImg.loaded = true;
        }
        this.scannerImg.onerror = () => {
            this.scannerImg.loaded = false;
        }
        this.scannerImg.src = props.scannerSrc || defaultScannerSrc;

        this.centerColors = props.centerColors || ['#F15654', '#FFCF54', '#18e9dd', '#5c9ded', '#62C97E']

        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCanvas.width = this.width;
        this.offscreenCanvas.height = this.height;
        this.offscreenCtx = this.offscreenCanvas.getContext('2d');

    }
    ref = React.createRef();
    scannerAnimationId = null;
    mainAnimateId = null;
    render() {
        let { width, height } = this.props;
        return <canvas className="dashboard" width={width} height={height} ref={this.ref}></canvas>
    }
    prepare() {
        let { width, height, sideDataList } = this.props;
        // 初始数据准备
        this.width = width.toFixed();
        this.height = height.toFixed();
        // 中心点
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        // 圆弧个数
        let arcNum = sideDataList.length;
        this.arcNum = arcNum;
        let config = CONFIG[arcNum] || {};
        this.arcGapRad = (config.arcGapRad === undefined ? 10 : config.arcGapRad);
        this.arcAngle = (360 - this.arcGapRad * arcNum) / arcNum;
    }
    componentDidUpdate(prevProps) {
        if (JSON.stringify(prevProps) !== JSON.stringify(this.props)) {
            this.prepare();
            this.startMainAnimate();
            this.startScannerAnimate();
        }
    }
    componentDidMount() {
        this.oCanvas = this.ref.current;
        this.ctx = this.oCanvas.getContext('2d');
        this.startMainAnimate();
        this.startScannerAnimate();
    }
    componentWillUnmount() {
        clearAnimate(this.mainAnimateId);
        clearAnimate(this.scannerAnimationId);
    }
    // 主要区域动画
    startMainAnimate = (start) => {
        clearAnimate(this.mainAnimateId);
        this.mainAnimateId = setAnimate((timestamp) => {
            start = start || timestamp;
            let progress = (timestamp - start) / 1000;
            this.main(progress);
            if (progress < 1) {
                this.startMainAnimate(start);
            }
        })
    }
    // scanner动画
    startScannerAnimate = () => {
        clearAnimate(this.scannerAnimationId);
        this.scannerAnimationId = setAnimate((timestamp) => {
            let { ctx } = this;
            let { configs = {} } = this.props;
            let { radarRadius } = configs;
            this.clearCanvas();
            this.scannerImg.loaded && this.drawScanner(timestamp / 16, radarRadius);
            ctx.drawImage(this.offscreenCanvas, 0, 0);
            this.startScannerAnimate();
        })
    }
    getColor(percent) {
        let color;
        if (percent < 0.6) {
            color = this.centerColors[0];
        } else if (percent < 0.7) {
            color = this.centerColors[1];
        } else if (percent < 0.8) {
            color = this.centerColors[2];
        } else if (percent < 0.9) {
            color = this.centerColors[3];
        } else if (percent <= 1) {
            color = this.centerColors[4];
        }
        return color;
    }

    /**
     * 
     * @param {number} size 设计稿尺寸
     * @param {object} options 选项
     * @param {boolean} [options.isFont] 如果是字体大小，使用最小字号 12
     * @param {number} [options.smallSize] 如果屏幕太小，使用指定大小
     */
    getSize(size, { isFont, smallSize } = {}) {
        let { scale, keepConfig } = this.props;
        let result = size * scale;
        if (!keepConfig) {
            if (isFont && result < 12) {
                result = 12;
            }
            if (smallSize && document.body.offsetWidth < 1500) {
                result = smallSize;
            }
        }
        return result;
    }
    /**
     * 绘图
     * @param {number} progress 控制动画进度 0~1的数字，达到1后动画停止
     */
    main(progress = 1) {
        let { arcAngle, arcGapRad, arcNum } = this;
        let { sideDataList, centerData,
            configs = {}
        } = this.props;
        let { radarRadius,
            circleRadius, circleLineWidth,
            arcRadius, arcLineWidth, sideTextFontSize, sideValueFontSize, sideOffset,
            valueY, textY, titleY, valueFontSize, textFontSize, titleFontSize
        } = configs;

        if (progress >= 1) { progress = 1; }

        this.clearCanvas();

        this.drawRadar(radarRadius);

        this.drawCircle({
            percent: centerData.value,
            color: centerData.color,
            radius: circleRadius,
            lineWidth: circleLineWidth
        }, { animateStep: progress });
        this.drawCenterText({
            percent: centerData.value,
            text: centerData.level,
            title: centerData.title,
            color: centerData.color,
            valueY, textY, titleY,
            valueFontSize, textFontSize, titleFontSize
        });

        const startAngle = arcGapRad / 2; // 开始角度
        const radAdd = 360 / arcNum;
        // 12点方向开始，顺时针旋转画弧
        sideDataList.forEach((item, index) => {
            let angle = startAngle + index * radAdd;
            let beginRad = getRadian(angle);
            let endRad = getRadian(angle + arcAngle);
            this.drawArc({
                percent: item.value,
                color: item.color,
                radius: arcRadius,
                lineWidth: arcLineWidth,
                beginRad, endRad
            }, { animateStep: progress });
            this.drawSideText({
                text: item.name,
                percent: item.value,
                radius: arcRadius,
                color: item.color,
                offset: sideOffset,
                valueFontSize: sideValueFontSize, textFontSize: sideTextFontSize
            }, index);
        });
        // 绘制完毕，缓存
        this.clearCanvas(this.offscreenCtx)
        this.offscreenCtx.drawImage(this.oCanvas, 0, 0);
    }
    /**
     * 清空画布
     */
    clearCanvas(ctx = this.ctx) {
        let { width, height } = this;
        ctx.clearRect(0, 0, width, height);
    }
    drawRadar(radius = 150) {
        let { ctx, centerX, centerY } = this;
        let { radarLineColor } = this.props;

        let lineWidth = 1;
        let circleNum = 4;
        let lineNum = 4;

        radius = this.getSize(radius) - lineWidth / 2;

        ctx.save();
        ctx.translate(centerX, centerY);

        // 画圆形
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = radarLineColor;
        for (let i = 1; i <= circleNum; i++) {
            ctx.beginPath();
            ctx.arc(0, 0, radius * i / circleNum - 1, 0, 2 * Math.PI);
            ctx.stroke();
        }

        // 画线
        for (let i = 0; i <= lineNum; i++) {
            ctx.beginPath();
            ctx.moveTo(-radius, 0);
            ctx.lineTo(radius, 0);
            ctx.stroke();
            ctx.rotate(Math.PI / lineNum);
        }
        ctx.restore();
    }
    /**
     * 内环
     * @param {object} data 数据
     * @param {number} [data.percent] 占比
     * @param {number} [data.color] 颜色
     * @param {number} [data.radius] 半径
     * @param {object} config 配置
     * @param {number} [config.animateStep] 动画控制
     * @param {boolean} [config.clockWise] 是否顺时针方向
     */
    drawCircle({ percent = 1, color, radius = 158, lineWidth = 18 }, { animateStep = 1, clockWise = true } = {}) {
        let { ctx, centerX, centerY } = this;
        lineWidth = this.getSize(lineWidth);
        radius = this.getSize(radius) - lineWidth / 2;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(-Math.PI / 2);

        ctx.beginPath();
        ctx.strokeStyle = color || this.getColor(percent);
        if (animateStep < 1) {
            percent = animateStep * percent;
        }
        ctx.lineWidth = lineWidth;
        if (clockWise) {
            ctx.arc(0, 0, radius, 0, 2 * Math.PI * percent);
        } else {
            ctx.arc(0, 0, radius, 2 * Math.PI * (1 - percent), 2 * Math.PI);
        }
        ctx.stroke();

        ctx.restore();
    }
    drawCenterText({ percent, text, title, color,
        valueFontSize = 88, textFontSize = 28, titleFontSize = 18,
        valueY = 18, textY = 60, titleY = 94 }) {
        let { ctx, centerX, centerY } = this;

        let { titleColor, fontFamily } = this.props;
        let value = percent * 100;

        // 字号
        valueFontSize = this.getSize(valueFontSize, { smallSize: 30 });
        textFontSize = this.getSize(textFontSize, { smallSize: 14 });
        titleFontSize = this.getSize(titleFontSize, { smallSize: 10 });

        // 字垂直偏移量
        valueY = this.getSize(valueY);
        textY = this.getSize(textY);
        titleY = this.getSize(titleY);

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.textAlign = 'center';

        // 数字
        ctx.font = `${valueFontSize}px ${fontFamily}`;
        ctx.fillStyle = color || this.getColor(percent);

        value = value.toFixed(1);
        let _textArr = value.split('.');
        if (_textArr[1] === '0') {
            value = _textArr[0];
        }
        ctx.fillText(value, 0, valueY);

        // 评级
        ctx.font = `${textFontSize}px ${fontFamily}`;
        ctx.fillText(text, 0, textY);

        // 标题
        ctx.font = `${titleFontSize}px ${fontFamily}`;
        ctx.fillStyle = titleColor;
        ctx.fillText(title, 0, titleY);

        ctx.restore();
    }

    drawArc({ percent, beginRad, endRad, color, lineWidth = 10, radius = 190 }, { animateStep = 1, clockWise = true, isRoundCap = false } = {}) {
        let { ctx, centerX, centerY, arcAngle } = this;
        let { arcBackgroundColor } = this.props;
        lineWidth = this.getSize(lineWidth);
        radius = this.getSize(radius) - lineWidth / 2;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(-Math.PI / 2);

        ctx.beginPath();
        ctx.lineWidth = lineWidth;
        // 圆弧底
        ctx.strokeStyle = arcBackgroundColor;
        ctx.lineCap = 'butt'

        ctx.arc(0, 0, radius, beginRad, endRad);
        ctx.stroke();



        // 占比的弧
        ctx.beginPath();
        ctx.strokeStyle = color || this.getColor(percent);
        if (isRoundCap) {
            ctx.lineCap = 'round';
        }
        if (animateStep < 1) {
            percent = animateStep * percent;
        }
        if (clockWise) {
            let _rad = beginRad + getRadian(arcAngle * percent);
            ctx.arc(0, 0, radius, beginRad, _rad);
        } else {
            let _rad = beginRad + getRadian(arcAngle * (1 - percent));
            ctx.arc(0, 0, radius, _rad, beginRad + getRadian(arcAngle));
        }
        ctx.globalCompositeOperation = 'source-atop';
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
        ctx.restore();
    }
    /**
     * 计算文字参考点位置
     * @param {*} index 当前位置
     * @param {*} radius 圆弧外径
     */
    calcTextPosition(index, radius = 190, offset = 10) {
        radius = this.getSize(radius) + offset;
        // 3点方向为x轴，6点方向为y轴
        let { arcNum, arcAngle, arcGapRad } = this;
        const startAngle = -90 + arcGapRad / 2 + arcAngle / 2; // 开始角度 
        const radAdd = 360 / arcNum;
        let currentAngle = startAngle + radAdd * index;
        let currentRad = getRadian(currentAngle)
        let x = radius * Math.cos(currentRad);
        let y = radius * Math.sin(currentRad);
        // 是否在y轴右边
        // 判断在哪个象限
        let textAlign = 'center';
        let cosVal = Math.cos(currentRad);
        if (cosVal > COS_90) {
            textAlign = 'start';
        } else if (cosVal < COS_90) {
            textAlign = 'end'
        } else if (cosVal === COS_90) {
            textAlign = 'center';
        }
        return { x, y, textAlign };
    }
    /**
     * 绘制圆弧旁边的文字
     * @param {object} options
     * @param {string} [options.text] 文字
     * @param {number} [options.percent] 值
     * @param {string} [options.color] 颜色
     * @param {number} [options.radius] 圆弧外径
     * @param {number} [options.offset] 文字距离圆弧的偏移量
     * @param {number} index 用于计算文字参考点位置
     */
    drawSideText({ text, percent, radius, offset = 10, color, valueFontSize = 28, textFontSize = 14 } = {}, index) {
        let { ctx, centerX, centerY } = this;
        let { sideColor, fontFamily } = this.props;

        // 文字和数字中间距离
        let spaceWidth = this.getSize(8);
        textFontSize = this.getSize(textFontSize, { isFont: true });
        valueFontSize = this.getSize(valueFontSize, { isFont: true, smallSize: 14 });

        ctx.save();
        ctx.translate(centerX, centerY);

        // 先计算文字宽度
        ctx.font = `${textFontSize}px ${fontFamily}`;
        const textSize = ctx.measureText(text);
        ctx.font = `${valueFontSize}px ${fontFamily}`;
        const value = Math.round(percent * 100);
        const valueSize = ctx.measureText(value + '');
        let totalWidth = textSize.width + valueSize.width + spaceWidth;

        let { x, y, textAlign } = this.calcTextPosition(index, radius, offset);
        if (textAlign === 'center') {
            x -= totalWidth / 2;
            y += textFontSize / 2;
        } else if (textAlign === 'end') {
            x -= totalWidth;
        }


        ctx.textBaseline = 'middle';

        ctx.beginPath();
        ctx.textAlign = 'start';
        ctx.font = `${textFontSize}px ${fontFamily}`;
        ctx.fillStyle = sideColor;
        ctx.fillText(text, x, y);

        ctx.beginPath();
        ctx.font = `${valueFontSize}px ${fontFamily}`;
        ctx.fillStyle = color || this.getColor(percent);
        ctx.fillText(value, x + textSize.width + spaceWidth, y);
        ctx.restore();
    }
    drawScanner(step = 0, radius = 150) {
        let { ctx, centerX, centerY } = this;
        let imgSize = this.getSize(2 * radius);
        let offset = this.getSize(-radius);
        ctx.save();
        ctx.globalCompositeOperation = 'destination-over';
        ctx.translate(centerX, centerY);
        ctx.rotate(getRadian(step));
        ctx.drawImage(this.scannerImg, offset, offset, imgSize, imgSize);
        ctx.restore();
    }
}