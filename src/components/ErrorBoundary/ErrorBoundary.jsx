import React from 'react';
export default class ErrorBoundary extends React.Component {
    state = { hasError: false }
    static defaultProps = {
        errorView: <p>组件渲染出错</p>
    }
    static getDerivedStateFromError(error) {
        // 更新 state 使下一次渲染能够显示降级后的 UI
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error(error, info);
    }

    render() {
        if (this.state.hasError) {
            // 你可以自定义降级后的 UI 并渲染
            return this.props.errorView;
        }

        return this.props.children;
    }
}