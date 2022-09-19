import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './app/App';
import './index.scss';
import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/transitions/slide.css';

ReactDOM.render(
	<App />,
	document.getElementById("root")
)