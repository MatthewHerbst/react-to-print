'use strict';

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const path = require('path');

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
    externals : {
        'react': 'react',
        'react-dom': 'react-dom'
    },
    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
                exclude: [/node_modules/],
                include: [/src/],
                loader: 'ts-loader'
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.css']
    },
    plugins: [
        new CleanWebpackPlugin(),
    ]
};
