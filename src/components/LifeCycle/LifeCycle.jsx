import React from 'react';
export default class LifeCycle extends React.Component {
    constructor(props) {
        super(props);
        console.log('constructor');
    }
    state = {}
    static getDerivedStateFromProps(nextProp, prevState){
        console.log('getDerivedStateFromProps');
        return {}
    }
    shouldComponentUpdate(){
        console.log('shouldComponentUpdate');
        return true;
    }
    render() {
        console.log('render');
        return <React.Fragment></React.Fragment>
    }
    getSnapshotBeforeUpdate(){
        console.log('getSnapshotBeforeUpdate');
        return {}
    }
    componentDidMount() {
        console.log('componentDidMount')
    }
    componentDidUpdate() {
        console.log('componentDidUpdate')
    }
    componentWillUnmount() {
        console.log('componentWillUnmount')
    }

    static getDerivedStateFromError(){
        console.log('getDerivedStateFromError')
    }
    componentDidCatch() {
        console.log('componentDidCatch')
    }
}