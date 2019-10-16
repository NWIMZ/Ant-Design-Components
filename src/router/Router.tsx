import React from 'react';
import { BrowserRouter, Switch, Route } from "react-router-dom";
import LoadableComponent from './LoadableComponent';
import routes from './routes';
export default function () {
    return <BrowserRouter>
        <Switch>
            {
                routes.map(({ path, component }, i) => <Route path={path} key={i} component={LoadableComponent(component)} />)
            }
        </Switch>
    </BrowserRouter>
}