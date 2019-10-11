import React from 'react';
import { Input, Checkbox, Radio } from 'antd';
import TreeWrapper from './index';
import treeDataList from './treeDataList.json';

export default class Main extends React.Component {
    state = {
        checkedKeys: [],
        queryString: '',
        mode: undefined
    }
    render() {
        let { checkedKeys, queryString, mode } = this.state;
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
                <Radio.Group onChange={(event) => {
                    console.log(event.target.value);
                    let mode = event.target.value;
                    this.setState({ mode });
                }}>
                    <Radio.Button value={'showSelected'}>显示选中</Radio.Button>
                    <Radio.Button value={'showUnselected'}>显示未选中</Radio.Button>
                    <Radio.Button value={undefined}>显示全部</Radio.Button>
                </Radio.Group>
            </div>

            <TreeWrapper
                keyField={'menuId'}
                titleField={'menuName'}
                childField={'children'}
                filterMode={mode}
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
