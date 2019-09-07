import React from 'react';
import DashBoard from './DashBoard';
export default class Main extends React.Component {
    render() {
        return <DashBoard
            centerData={{
                value: 1,
                level: 'Good',
                title: 'Situation'
            }}
            sideDataList={[
                {
                    name: '二十',
                    value: 0.2
                },
                {
                    name: 'Ninety',
                    value: 0.9
                },
                {
                    name: '七十',
                    value: 0.7
                },
                {
                    name: '四十',
                    value: 0.4
                }
            ]}
        />
    }
}