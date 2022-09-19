import React from 'react';
import { Home } from './pages/home/Home';
import { Dashboard } from './pages/dashboard/Dashboard';
import { Header } from './shared-components/header/Header';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import { MindfulDataContextProvider } from './providers/MindfulDataContextProvider';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { StoreConfigurator } from './redux/StoreConfigurator';

export const App: React.FunctionComponent = () => {

    return <Provider store={store}>
        <MindfulDataContextProvider>
            <StoreConfigurator>
                <Header />
                <Router>
                    <Switch>
                        <Route exact path="/" component={Home} />
                        <Route path="/dashboard" component={Dashboard} />
                    </Switch>
                </Router>
            </StoreConfigurator>
        </MindfulDataContextProvider>
    </Provider>
}