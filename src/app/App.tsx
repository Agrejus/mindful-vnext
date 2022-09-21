import React from 'react';
import { Home } from './pages/home/Home';
import { Dashboard } from './pages/dashboard/Dashboard';
import { Header } from './shared-components/header/Header';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import { MindfulDataContextProvider } from './providers/MindfulDataContextProvider';

export const App: React.FunctionComponent = () => {

    return <MindfulDataContextProvider>
        <Header />
        <Router>
            <Switch>
                <Route exact path="/" component={Home} />
                <Route path="/dashboard" component={Dashboard} />
            </Switch>
        </Router>
    </MindfulDataContextProvider>
}