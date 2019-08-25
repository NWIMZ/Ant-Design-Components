import React from 'react';
import 'antd/dist/antd.css';
import './App.css';

import AddList from './components/AddList/AddList.test';
import DashBoard from './components/DashBoard/DashBoard.test';
import VoiceMessage from './components/VoiceMessage/VoiceMessage';
function App() {
    return (
        <div className="App">
            <AddList />
            <DashBoard />
            <VoiceMessage />
        </div>
    );
}

export default App;
