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
                console.log(copy.menuName);
                result.push(copy);
            }
        });
        return result;
    }
    return walk(tree);
}
const { TreeNode } = Tree;
export default class TreeWrapper extends React.Component {
    static defaultProps = {
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
        filteredTreeList: []
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
        console.log(halfCheckedKeys);
        console.log(checkedKeys);
        console.log(value);
        onCheck(checkedKeys, event, ...restParams);
    }
    getFilteredData() {
        let { treeDataList } = this.props;
        let list = JSON.parse(JSON.stringify(treeDataList));

        return filterTree(list, (item) => {
            let { showSelected, showUnselected, keyField, titleField,
                queryString, checkedKeys } = this.props;
            let isShow = false;
            if (showSelected) {
                isShow = isShow || checkedKeys.some((id) => {
                    return id == item[keyField];
                });
            }
            if (showUnselected) {
                isShow = isShow || !checkedKeys.some((id) => {
                    return id == item[keyField];
                });
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
        let { queryString, showSelected, showUnselected } = this.props;
        if (prevProps.queryString !== queryString || showSelected !== prevProps.showSelected || showUnselected !== prevProps.showUnselected) {
            this.setState({ filteredTreeList: this.getFilteredData() });
        }
    }
    render() {
        let { onCheck, children, ...restProps } = this.props;
        let { filteredTreeList } = this.state;
        return <>
            <Tree
                defaultExpandAll
                checkable
                {...restProps}
                onCheck={this.handleCheck}
            >
                {this.getTreeNodes(filteredTreeList)}
            </Tree>
            <pre>{JSON.stringify(restProps.checkedKeys, '', 4)}</pre>
        </>
    }
}


