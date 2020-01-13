import React from 'react';
import _ from 'lodash';
import { Tree } from 'antd';
const { TreeNode } = Tree;

const filterTree = (tree, filter, fields = { children: 'children' }) => {
    const walk = (list, depth) => {
        let result = [];
        list.forEach((item) => {
            let copy = { ...item };
            let children = copy[fields.children] || [];
            if (_.isArray(children) && children.length !== 0) {
                children = walk(children, filter, fields);
            }
            copy[fields.children] = children;
            if (filter(copy) || children.length !== 0) {
                result.push(copy);
            }
        });
        return result;
    }
    return walk(tree);
}

// 点击父节点时，展开它而不是选中它
// 通过控制expandedKeys实现
// 传expandedKeys则必须传onExpand,且onExpand需改变expandedKeys
// 传selectedKeys则必须传onSelect,且onSelect需改变selectedKeys
export default class TreeWrapper extends React.Component {
    constructor(props) {
        super(props);
        if (props.expandedKeys && !props.onExpand) {
            throw Error('传expandedKeys则必须传onExpand,且onExpand需改变expandedKeys');
        }
        if (props.selectedKeys && !props.onSelect) {
            throw Error('传selectedKeys则必须传onSelect,且onSelect需改变selectedKeys');
        }
    }
    static defaultProps = {
        cancelable: true,
        selectToExpand: false,
        treeDataList: [],
        // checkedKeys: [],
        // onCheck: _.noop,
        // keyField: 'menuId',
        // titleField: 'menuName',
        // childField: 'children',

        // 查询字符串
        queryString: '',
        // 显示已选
        showSelected: true,
        // 显示未选
        showUnselected: true,
    }
    state = {
        checkedKeys: this.props.checkedKeys || [],
        halfCheckedKeys: this.props.halfCheckedKeys || [],
        selectedKeys: [],
        expandedKeys: [],
        filteredTreeData: []
    }

    handleExpand = (ek) => {
        let { onExpand, expandedKeys } = this.props;
        expandedKeys || this.setState({ expandedKeys: ek });
        onExpand && onExpand(ek);
    }
    handleSelect = (selectedKeys, { node, ...rest }) => {
        let { selectToExpand, cancelable } = this.props;

        if (!cancelable) {
            selectedKeys = [node.props.eventKey];
        }
        if (selectToExpand) {
            this.selectToExpand(selectedKeys, { node, ...rest });
        } else {
            let { onSelect } = this.props;
            onSelect && onSelect(selectedKeys, { node, ...rest })
        }
    }

    selectToExpand(sk, { node, ...rest }) {
        // let { expandedKeys } = this.state;
        let expandedKeys = this.props.expandedKeys || this.state.expandedKeys;
        let { onSelect, onExpand, selectedKeys } = this.props;
        let eventKey = node.props.eventKey;
        // 通过判断有无子节点决定onSelect行为
        if (node.props.children && node.props.children.length !== 0) {
            // 点击父节点 展开
            let i = expandedKeys.findIndex((val) => {
                return eventKey == val;
            });

            if (i !== -1) {
                expandedKeys.splice(i, 1);
            } else {
                expandedKeys.push(eventKey);
            }
            this.props.expandedKeys || this.setState({ expandedKeys: [...expandedKeys] });
            onExpand && onExpand([...expandedKeys]);
        } else {
            // 子节点
            selectedKeys || this.setState({ selectedKeys: sk });
            onSelect && onSelect(sk, { node, ...rest });
        }
    }

    findRaw(list, key, parent) {
        let { keyField, childField } = this.props;
        let self = null;

        list.some((item) => {
            if (item[keyField] == key) {
                self = item;
            } else {
                if (item[childField]) {
                    let temp = this.findRaw(item[childField], key, item);
                    self = temp.self;
                    parent = temp.parent;
                }
            }
            return self;
        })
        return { self, parent };
    }

    // 重写onCheck方法
    // 由于树会过滤掉一部分,checkedKeys halfCheckedKeys也会在onCheck的时候丢失
    // 所以手动实现onCheck,记录每次的checkedKeys,halfCheckedKeys
    handleCheck = (k, event, ...restParams) => {
        let { onCheck, childField, keyField, treeDataList } = this.props;
        let { checkedKeys, halfCheckedKeys } = this.state;
        let { checked, node: { props: { eventKey } } } = event;
        checkedKeys = [...checkedKeys];
        halfCheckedKeys = [...halfCheckedKeys];
        let { self, parent } = this.findRaw(treeDataList, eventKey);
        console.log(self, parent);
        let children = self[childField]

        if (checked) {
            // 选中
            checkedKeys.push(eventKey);
        } else {
            // 反选
            _.remove(checkedKeys, (key) => { return key == eventKey; });
            // 找到当前的父级
        }
        // 如果点击的是父级
        if (children && children.length !== 0) {
            // 找出当前父级下的所有子级key
            let keys = children.map(({ [keyField]: key }) => key);
            if (checked) {
                checkedKeys = checkedKeys.concat(keys);
            } else {
                keys.forEach((k) => {
                    _.remove(checkedKeys, (key) => { return key == k; });
                });
            }
        }
        this.setState({ checkedKeys, halfCheckedKeys });
        // onCheck && onCheck(checkedKeys, event, ...restParams);
    }
    getFilteredData() {
        let { treeDataList, filterMode, keyField, titleField,
            queryString } = this.props;
        let { checkedKeys, halfCheckedKeys } = this.state;
        let list = JSON.parse(JSON.stringify(treeDataList));

        return filterTree(list, (item) => {
            let isShow;
            switch (filterMode) {
                case 'showSelected':
                    isShow = [...checkedKeys, ...halfCheckedKeys].some((id) => {
                        return id == item[keyField];
                    });
                    break;
                case 'showUnselected':
                    isShow = ![...checkedKeys, ...halfCheckedKeys].some((id) => {
                        return id == item[keyField];
                    });
                    break;
                default: isShow = true;
            }
            return item[titleField].indexOf(queryString) !== -1 && isShow;
        });
    }
    getTreeNodes(list) {
        let { titleField, keyField, childField } = this.props;
        return list.map(item => {
            return <TreeNode
                key={item[keyField]}
                title={item[keyField] + ' - ' + item[titleField]}
            >{this.getTreeNodes(item[childField])}</TreeNode>
        });
    }


    componentDidMount() {
        this.setState({ filteredTreeData: this.getFilteredData() });
    }
    componentDidUpdate(prevProps) {
        let { queryString, filterMode, treeDataList } = this.props;
        if (prevProps.treeDataList !== treeDataList ||
            prevProps.queryString !== queryString ||
            filterMode !== prevProps.filterMode) {
            this.setState({ filteredTreeData: this.getFilteredData() });
        }
    }
    render() {
        let { onCheck, children, ...restProps } = this.props;
        let { expandedKeys, selectedKeys,
            checkedKeys, halfCheckedKeys,
            filteredTreeData } = this.state;

        return <Tree
            defaultExpandAll
            checkable
            expandedKeys={expandedKeys}
            selectedKeys={selectedKeys}
            checkStrictly
            {...restProps}
            checkedKeys={{
                checked: checkedKeys,
                halfChecked: halfCheckedKeys
            }}
            onCheck={this.handleCheck}
            onExpand={this.handleExpand}
            onSelect={this.handleSelect}
        >
            {this.getTreeNodes(filteredTreeData)}
        </Tree>
    }
}


