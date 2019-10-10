import React from 'react';
import { Input, Checkbox } from 'antd';
import TreeWrapper from './index';
import treeDataList from './treeDataList.json';
import dfs from './dfs';

export default class Main extends React.Component {
    state = {
        checkedKeys: [],
        queryString: '新增',
        showSelected: true,
        showUnselected: true
    }
    render() {
        let { checkedKeys, queryString, showSelected, showUnselected } = this.state;
        return <div>

            <div>
                <Input
                    value={queryString}
                    onChange={(event) => {
                        this.setState(({
                            queryString: event.target.value
                        }))
                    }} />
            </div>

            <div>
                <label>显示选中
                <Checkbox checked={showSelected} onChange={(event) => {
                        this.setState({
                            showSelected: event.target.checked
                        })
                    }} />
                </label>
                <label>显示未选中
                <Checkbox checked={showUnselected} onChange={(event) => {
                        this.setState({
                            showUnselected: event.target.checked
                        })
                    }} />
                </label>
            </div>

            <TreeWrapper
                keyField={'menuId'}
                titleField={'menuName'}
                childField={'children'}

                showSelected={showSelected}
                showUnselected={showUnselected}

                queryString={queryString}

                treeDataList={treeDataList}
                checkedKeys={checkedKeys}
                onCheck={(checkedKeys: [], ...params: []) => {
                    console.log(...params);
                    this.setState({
                        checkedKeys
                    })
                }}
            />
        </div>
    }
}


const tester = () => {
    let a = dfs(treeDataList, (item) => {
        return item.menuName.indexOf('新增') !== -1;
    });

    console.log(a);
}
tester()