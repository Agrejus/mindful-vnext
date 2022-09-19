import config from '../webpack.config.common';
import { merge } from 'webpack-merge';
import * as path from 'path';
import CopyWebpackPlugin from 'copy-webpack-plugin';

export default merge(config, {

    output: {
        path: path.resolve(__dirname, '../../electron/app')
    },

    optimization: {
        // We no not want to minimize our code in dev
        minimize: false
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: 'public/', to: "./" },
                { from: './node_modules/react/umd/react.development.js', to: 'react.js' },
                { from: './node_modules/react-dom/umd/react-dom.development.js', to: 'react-dom.js' }
            ]
        })
    ],

    mode: "development"
});