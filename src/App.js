import React from 'react';
import 'antd/dist/antd.css';
import { Input } from 'antd';

import './App.css';

import AddList from './components/AddList/AddList';
import DashBoard from './components/DashBoard/DashBoard';
import VoiceMessage from './components/VoiceMessage/VoiceMessage';
function App() {
    return (
        <div className="App">
            <Main />
            <VoiceMessage />
        </div>
    );
}


class Main extends React.Component {
    state = {
        value: [
            { name: '二十', value: 0.2 },
            { name: 'Ninety', value: 0.9 },
            { name: '七十', value: 0.7 },
            { name: '四十', value: 0.4 }
        ]
    }
    handleChange = (value) => {
        this.setState({ value });
    }
    render() {
        let { value } = this.state;
        return <React.Fragment>
            <AddList
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
                {JSON.stringify(value, '', 4)}
            </pre>
            <DashBoard
                centerData={{
                    value: value.reduce((accu, curr) => { return +(curr.value || 0) + accu; }, 0) / value.length,
                    level: 'Good',
                    title: 'Situation'
                }}
                sideDataList={value}
            />
        </React.Fragment>
    }
}

export default App;
