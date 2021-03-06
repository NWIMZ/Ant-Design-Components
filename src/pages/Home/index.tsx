import { Input } from 'antd';
import React from 'react';

import DynamicForm from '../../components/DynamicForm';
import DashBoard from '../../components/DashBoard/DashBoard';

export default class Main extends React.Component {
    state = {
        value: [
            { name: '二十', value: 0.2 },
            { name: 'Ninety', value: 0.9 },
            { name: '七十', value: 0.7 },
            { name: '四十', value: 0.4 }
        ]
    }
    handleChange = (value: any) => {
        this.setState({ value });
    }
    render() {
        let { value } = this.state;
        return <div className='main'>
            <DynamicForm
                dataIndex='name'
                value={value}
                onChange={this.handleChange}
                columns={[{
                    key: 'name',
                    title: 'name',
                    width: '100px',
                    Component: Input,
                    props: {},
                    options: { rules: [{ required: true, message: '请输入' }] }
                }, {
                    key: 'value',
                    title: 'value',
                    width: '100px',
                    Component: Input,
                    props: {},
                    options: { rules: [{ required: true, message: '请输入' }] }
                }]}
            />
            <pre>
                {JSON.stringify(value, null, 4)}
            </pre>
            <DashBoard
                keepConfig
                centerData={{
                    value: value.reduce((accu, curr) => { return +(curr.value || 0) + accu; }, 0) / value.length,
                    level: 'Good',
                    title: 'Situation'
                }}
                sideDataList={value}
            />
        </div>
    }
}