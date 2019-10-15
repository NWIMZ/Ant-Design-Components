import React from 'react';
declare interface Column {
    key: string;
    title: string;
    width: string;
    /**控件组件 */
    Component: React.ReactNode;
    /**组件需传入的属性 */
    props?: any;
    /**传入form.getFieldDecorator */
    options?: any;

}

declare interface Props {
    dataIndex?: string;
    columns: Column[];
    /**value发生任何改变时的回调 设置了value必须设置onChange */
    onChange: (value: any) => any;
    /**组件的值，传值则变为受控组件 */
    value: any[];
    /**额外的值 */
    extraParam?: any;
}
declare interface State {

}

export default class AddList extends React.Component<Props, State>{ }
