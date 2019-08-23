import React from 'react';
import 'antd/dist/antd.css';
import { Input } from 'antd';
import './App.css';
import AddList from './components/AddList/AddList';
function App() {
  return (
    <div className="App">
      <Main />
    </div>
  );
}

class Main extends React.Component {
  state = {
    value: [{ a: 1, b: 2 }, { a: 3, b: 4 }]
  }
  handleChange = (value) => {
    this.setState({ value });
  }
  render() {
    let { value } = this.state;
    return <React.Fragment>
      <AddList
        dataIndex='a'
        value={value}
        onChange={this.handleChange}
        columns={[{
          key: 'a',
          title: '一',
          width: '100px',
          Component: Input,
          props: {},
          options: { rules: [{ required: true, message: '请输入' }] }
        }, {
          key: 'b',
          title: '二',
          width: '100px',
          Component: Input,
          props: {},
          options: { rules: [{ required: true, message: '请输入' }] }
        }]}
      />
      <pre>
      {JSON.stringify(value, '', 4)}
      </pre>
    </React.Fragment>
  }
}
export default App;
