import React from 'react';
import 'antd/dist/antd.css';

import TreeWrapper from './components/TreeWrapper/index.test';
import './App.css';

function App() {
    return (
        <div className="App">
            <Main />
        </div>
    );
}


class Main extends React.Component {
    render() {
        return <div className='main'>
            <TreeWrapper />
        </div>
    }
}

export default App;
