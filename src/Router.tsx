import React from 'react';
import { BrowserRouter, Switch,Route} from "react-router-dom";
import Home from './pages/Home';
import Tools from './pages/Tools';
import NotFound from './pages/NotFound';
export default function () {
    return <BrowserRouter>
        <Switch>
            <Route path="/home" component={Home} />
            <Route path="/tools" component={Tools} />
            <Route component={NotFound} />
        </Switch>
    </BrowserRouter>
}