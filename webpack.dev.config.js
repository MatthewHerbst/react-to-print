'use strict';

const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
    mode: 'development',
    devtool: 'source-map',
    entry:  './examples/index.tsx',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, './dist'),
    },
    devServer: {
        contentBase: './dist',
        hot: true,
        open: true,
        progress: true,
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                include: [/src/, /examples/],
                loader: 'ts-loader',
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(jpg|png)$/i,
                loader: 'url-loader',
            },
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.css']
    },
    plugins: [
        new HtmlWebpackPlugin({ favicon: 'examples/favicon.ico', template: 'index.html' }),
    ],
};
