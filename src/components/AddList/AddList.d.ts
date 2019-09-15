import React from 'react';
/**
 * @typedef {Object} AddListColumn
 * @property {string} key 
 * @property {string} title 
 * @property {string} width 
 * @property {React.Component} Component 控件组件
 * @property {Object} props 组件需传入的属性
 * @property {Object} options 传入form.getFieldDecorator
 * 
 */

/**
 * @typedef {Object} AddListProps
 * 
 * @property {Object} props 
 * @property {string} props.dataIndex
 * @property {AddListColumn[]} props.columns
 * @property {any[]} [props.value] 组件的值，传值则变为受控组件
 * @property {function} [props.onChange] value发生任何改变时的回调 设置了value必须设置onChange
 * @property {Object} [props.extraParam] 额外的值
 */

/**
 * @extends React.Component<AddListProps>
 */

declare interface AddListColumn {
    key: string;
    title: string;
    width: string;
    Component: React.ReactNode;
    props?: any;
    options?: any;

}

declare interface AddListProps {
    dataIndex: string;
    columns: AddListColumn[];
    onChange: (value: any) => any;
    value: any[];

}
declare interface AddListState {

}
declare var aaa: string;
export default class AddList extends React.Component<AddListProps, AddListState>{ }
