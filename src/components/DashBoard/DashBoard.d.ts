import React from 'react';
interface DashBoardProps {
    // 组件自身
    animateMode?: 'canvas' | 'css';// TODO:未实现css的动画逻辑，只有canvas
    scale?: number;// 缩放比，默认为1
    width?: number;// canvas元素的宽
    height?: number;// canvas元素的高

    // 颜色字体
    radarLineColor?: string;// 颜色
    sideColor?: string;// 四周文字颜色，数字颜色由其值大小控制
    titleColor?: string;// 中间标题颜色
    fontFamily?: string;//字体
    arcBackgroundColor?: string;// 圆弧底色
    arcAlarmColor?: string;//圆弧填充色
    keepConfig?: boolean;// 是否使用配置不根据屏幕调整
    // 数据
    centerData: CenterData;// 中心数据
    sideDataList: Array<SideData>;// 四周数据

}
// 中间
interface CenterData {
    value: number | string;//数值 上
    level: string | number;//等级 中
    title: string | number;// 标题 下
}
// 圆弧数据
interface SideData {
    name: string;// 文字
    value: number;//值 0-1的小数  控制数字和占比，例如0.3 显示30 红色占70%
}
export default class DashBoard extends React.Component<DashBoardProps, {}>{ }
