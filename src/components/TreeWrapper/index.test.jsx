import React from 'react';
import { Input, Radio } from 'antd';
import './index.scss'
import TreeWrapper from './index';
import treeDataList from './treeDataList.json';

export default class Main extends React.Component {
    state = {
        queryString: '',
        mode: undefined
    }
    handleQueryChange = (event) => {
        this.setState(({
            queryString: event.target.value
        }))
    }
    handleModeChange = (event) => {
        this.setState({
            mode: event.target.value
        });
    }
    render() {
        let { queryString, mode } = this.state;
        return <div className="test-treewrapper">
            <div>
                <Input
                    value={queryString}
                    onChange={this.handleQueryChange}
                />
            </div>
            <div>
                <Radio.Group onChange={this.handleModeChange}>
                    <Radio.Button value={'showSelected'}>显示选中</Radio.Button>
                    <Radio.Button value={'showUnselected'}>显示未选中</Radio.Button>
                    <Radio.Button value={undefined}>显示全部</Radio.Button>
                </Radio.Group>
            </div>
            <TreeWrapper
                keyField={'menuId'}
                titleField={'menuName'}
                childField={'children'}
                selectToExpand
                filterMode={mode}
                queryString={queryString}
                treeDataList={treeDataList}
            />
        </div>
    }
}
