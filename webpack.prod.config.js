'use strict';

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    mode: 'production',
    entry:  './src/index.tsx',
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, './lib'),
        libraryTarget: 'umd',
        library: 'lib',
        umdNamedDefine: true,
        globalObject: `(typeof self !== 'undefined' ? self : this)`
    },
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                uglifyOptions: {
                    output: {
                        comments: false,
                    },
                },
            }),
        ],
    },
    externals : {
        'react': 'react',
        'react-dom': 'react-dom'
    },
    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
                include: path.resolve(__dirname, 'src'),
                loader: 'ts-loader'
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    plugins: [
        new CleanWebpackPlugin(),
    ]
};
