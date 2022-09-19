import HtmlWebpackPlugin from 'html-webpack-plugin';
import * as path from 'path';
import * as webpack from 'webpack';
import webpackDevServer from 'webpack-dev-server';
import * as fs from 'fs';
import { WebpackManifestPlugin } from 'webpack-manifest-plugin';
import WebpackShellPlugin from 'webpack-shell-plugin-next';
const getCacheIdentifier = require('react-dev-utils/getCacheIdentifier');

interface Configuration extends webpack.Configuration {
    devServer?: webpackDevServer.Configuration;
}

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath: string) => path.resolve(appDirectory, relativePath);


const output: webpack.Output = {
    pathinfo: true,
    filename: "[name].[hash:8].chunk.js",
    path: path.resolve(__dirname, '../build'),
    chunkFilename: '[name].[hash:8].chunk.js',
    globalObject: 'this',
};
const plugins: webpack.Plugin[] = [
    new HtmlWebpackPlugin({
    inject: true,
    template: './public/index.html',
    minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
    },
    templateParameters: {
        PUBLIC_URL: process.env.PUBLIC_URL || './'
    }
}),
new WebpackManifestPlugin({
    fileName: 'asset-manifest.json',
    publicPath: './',
    generate: (seed: any, files: any, entrypoints: any) => {
        const manifestFiles = files.reduce((manifest: any, file: any) => {
            manifest[file.name] = file.path;
            return manifest;
        }, seed);
        const entrypointFiles = entrypoints.main.filter(
            (fileName: any) => !fileName.endsWith('.map')
        );

        return {
            files: manifestFiles,
            entrypoints: entrypointFiles,
        };
    },
})];


if (process.env['ELECTRON_BUILD_OUTPUT_TYPE'] === "electron") {
    output.path = path.resolve(__dirname, '../electron/app');
}

if (process.env['ELECTRON_LAUNCH_TYPE'] === "native") {
    plugins.push(new WebpackShellPlugin({
        onBuildEnd: {
            scripts: ['npm run launch:electron-native'],
            blocking: false,
            parallel: true
        }
    }))
}

if (process.env['ELECTRON_LAUNCH_TYPE'] === "serve") {
    plugins.push(new WebpackShellPlugin({
        onBuildEnd: {
            scripts: ['npm run launch:electron-serve'],
            blocking: false,
            parallel: true
        }
    }))
}

// Chunking - https://medium.com/hackernoon/the-100-correct-way-to-split-your-chunks-with-webpack-f8a9df5b7758
const config: Configuration = {

    // Set the entry to the application chunk which points to index.tsx
    entry: [
        "./src/index.tsx"
    ],
    // Set the naming convention of our bundles
    output,

    optimization: {
        splitChunks: {
            chunks: 'all',
            name: false,

            maxInitialRequests: Infinity,
            minSize: 0,
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules\\(react|react-dom|react-router-dom)[\\/]/,
                    name(module: { context: string }) {
                        // get the name. E.g. node_modules/packageName/not/this/part.js
                        // or node_modules/packageName
                        const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)![1];

                        // npm package names are URL-safe, but some servers don't like @ symbols
                        return `npm.${packageName.replace('@', '')}`;
                    },
                },
            }
        },
        // Keep the runtime chunk separated to enable long term caching
        // https://twitter.com/wSokra/status/969679223278505985
        // https://github.com/facebook/create-react-app/issues/5358
        runtimeChunk: {
            name: entrypoint => `runtime-${entrypoint.name}`,
        },
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js", ".json"],
        // modules: ['../src', 'node_modules']
        modules: ['node_modules', resolveApp('node_modules')]
    },

    // Configure our module loaders
    module: {
        strictExportPresence: true,
        rules: [
            { parser: { requireEnsure: false } },
            {
                test: /\.(js|mjs)$/,
                loader: 'esbuild-loader',
                include: path.resolve(__dirname, '../src/app/external-modules/prism'),
                options: {
                    target: 'es2015'
                }
            },
            {
                test: /\.tsx?$/,
                include: path.resolve(__dirname, '../src'),
                loader: require.resolve('babel-loader'),
                options: {
                    customize: require.resolve(
                        'babel-preset-react-app/webpack-overrides'
                    ),
                    // @remove-on-eject-begin
                    babelrc: false,
                    configFile: false,
                    presets: [require.resolve('babel-preset-react-app')],
                    // Make sure we have a unique cache identifier, erring on the
                    // side of caution.
                    // We remove this when the user ejects because the default
                    // is sane and uses Babel options. Instead of options, we use
                    // the react-scripts and babel-preset-react-app versions.
                    cacheIdentifier: getCacheIdentifier(
                        'development',
                        [
                            'babel-plugin-named-asset-import',
                            'babel-preset-react-app',
                            'react-dev-utils',
                            'react-scripts',
                        ]
                    ),
                    // @remove-on-eject-end
                    plugins: [
                        [
                            require.resolve('babel-plugin-named-asset-import'),
                            {
                                loaderMap: {
                                    svg: {
                                        ReactComponent:
                                            '@svgr/webpack?-svgo,+titleProp,+ref![path]',
                                    },
                                },
                            },
                        ],
                    ],
                    // This is a feature of `babel-loader` for webpack (not Babel itself).
                    // It enables caching results in ./node_modules/.cache/babel-loader/
                    // directory for faster rebuilds.
                    cacheDirectory: true,
                    // See #6846 for context on why cacheCompression is disabled
                    cacheCompression: false,
                    compact: false,
                }
            },

            {
                test: /\.(js|jsx|mjs)$/,
                loader: require.resolve('source-map-loader'),
                enforce: 'pre',
                include: path.resolve(__dirname, '../src'),
                exclude: path.resolve(__dirname, '../src/app/external-modules'),
            },

            {
                test: /\.(scss|css)$/,
                use: [
                    "style-loader", // creates style nodes from JS strings
                    "css-loader", // translates CSS into CommonJS
                    "sass-loader" // compiles Sass to CSS, using Node Sass by default
                ]
            },

            // embed small images and fonts as Data Urls and larger ones as files:
            { test: /\.(png|gif|jpg|cur)$/i, loader: 'url-loader', options: { limit: 8192 } },
            { test: /\.woff2(\?v=[0-9]\.[0-9]\.[0-9])?$/i, loader: 'url-loader', options: { limit: 10000, mimetype: 'application/font-woff2' } },
            { test: /\.woff(\?v=[0-9]\.[0-9]\.[0-9])?$/i, loader: 'url-loader', options: { limit: 10000, mimetype: 'application/font-woff' } },
            // load these fonts normally, as files:
            { test: /\.(ttf|eot|svg|otf)(\?v=[0-9]\.[0-9]\.[0-9])?$/i, loader: 'file-loader' }
        ]
    },

    // Configure any plugins
    plugins,

    devServer: {
        compress: true,
        open: false,
        historyApiFallback: true,
        port: 3000,
        contentBase: './build'
    },

    externals: {
        "react": "React",
        "react-dom": "ReactDOM"
    },

    node: {
        module: 'empty',
        dgram: 'empty',
        dns: 'mock',
        fs: 'empty',
        http2: 'empty',
        net: 'empty',
        tls: 'empty',
        child_process: 'empty',
    },

    // Turn off performance hints during development because we don't do any
    // splitting or minification in interest of speed. These warnings become
    // cumbersome.
    performance: {
        hints: false,
    }
};

export default config;