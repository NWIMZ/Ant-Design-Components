import React from 'react';
import _ from 'lodash';
import { Tree } from 'antd';
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
const { TreeNode } = Tree;

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
        cancelable: false,
        selectToExpand: true,
        // treeDataList: treeDataList,
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
        selectedKeys: [],
        expandedKeys: [],
        filteredTreeList: []
    }

    handleExpand = (ek) => {
        let { onExpand, expandedKeys } = this.props;
        expandedKeys || this.setState({ expandedKeys: ek });
        onExpand && onExpand(ek);
    }
    handleSelect = (selectedKeys, { selected, selectedNodes, node, event }) => {
        let { selectToExpand, cancelable } = this.props;

        if (!cancelable) {
            selectedKeys = [node.props.eventKey];
        }
        if (selectToExpand) {
            this.selectToExpand(selectedKeys, { selected, selectedNodes, node, event });
        } else {
            let { onSelect } = this.props;
            onSelect && onSelect(selectedKeys, { selected, selectedNodes, node, event })
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

    handleCheck = (value, event, ...restParams) => {
        let { onCheck, checkedKeys } = this.props;
        let { checked, halfCheckedKeys, node: { props: { eventKey, children } } } = event;
        // 如果点击的是父级
        if (children && children.length !== 0) {
            // 找出当前父级下的所有子级key
            const getKeys = (list) => {
                return list.reduce((accu, { key, props: { children } }) => {
                    if (children && children instanceof Array && children.length !== 0) {
                        return accu.concat(getKeys(children));
                    } else {
                        accu.push(key);
                        return accu;
                    }
                }, []);
            }
            let keys = getKeys(children);
            if (checked) {
                checkedKeys = checkedKeys.concat(keys);
            } else {
                keys.forEach((k) => {
                    _.remove(checkedKeys, (key) => { return key == k; });
                });
            }
        } else {
            // 如果点击的是子级
            if (checked) {
                checkedKeys.push(eventKey);
            } else {
                _.remove(checkedKeys, (key) => { return key == eventKey; });
            }
        }
        onCheck(checkedKeys, event, ...restParams);
    }
    getFilteredData() {
        let { treeDataList, filterMode, keyField, titleField,
            queryString, checkedKeys } = this.props;
        let list = JSON.parse(JSON.stringify(treeDataList));

        return filterTree(list, (item) => {
            let isShow = false;
            switch (filterMode) {
                case 'showSelected':
                    isShow = isShow || checkedKeys.some((id) => {
                        return id == item[keyField];
                    });
                    break;
                case 'showUnselected':
                    isShow = isShow || !checkedKeys.some((id) => {
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
        this.setState({ filteredTreeList: this.getFilteredData() });
    }
    componentDidUpdate(prevProps) {
        let { queryString, filterMode } = this.props;
        if (prevProps.queryString !== queryString || filterMode !== prevProps.filterMode) {
            this.setState({ filteredTreeList: this.getFilteredData() });
        }
    }
    render() {
        let { onCheck, children, ...restProps } = this.props;
        let { expandedKeys, selectedKeys,
            filteredTreeList } = this.state;

        return <Tree
            defaultExpandAll
            checkable
            expandedKeys={expandedKeys}
            selectedKeys={selectedKeys}
            {...restProps}
            onCheck={this.handleCheck}
            onExpand={this.handleExpand}
            onSelect={this.handleSelect}
        >
            {this.getTreeNodes(filteredTreeList)}
        </Tree>
    }
}


