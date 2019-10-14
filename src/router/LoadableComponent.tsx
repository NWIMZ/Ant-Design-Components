import React from 'react';
import Loadable, { LoadingComponentProps } from 'react-loadable';
const LoadingComponent = ({ isLoading, error }: LoadingComponentProps) => {
    if (isLoading) {
        return <div>Loading...</div>
    } else if (error) {
        return <div>error</div>
    } else {
        return null;
    }
}
const LoadableComponent = (loader: () => any) => Loadable({
    loader,
    loading: LoadingComponent
});
export default LoadableComponent;