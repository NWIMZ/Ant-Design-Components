import React from 'react';
import { BrowserRouter, Switch, Route } from "react-router-dom";
import LoadableComponent from './LoadableComponent';
import routes from './routes';
export default function () {
    return <BrowserRouter>
        <Switch>
            {
                routes.map(({ path, component }) => <Route path={path} component={LoadableComponent(component)} />)
            }
        </Switch>
    </BrowserRouter>
}