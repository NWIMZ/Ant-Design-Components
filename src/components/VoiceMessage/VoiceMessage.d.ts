interface Props {
    // audio 属性
    type: string;
    src: string;
    // 
    color?: string;// 颜色
    length: number;// audio长度

    // 包裹层
    className?:string;// 类名


}
interface State {
    step: number;// 控制svg动画
}