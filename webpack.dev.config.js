'use strict';

const path = require('path');

const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    devtool: 'source-map',
    entry:  './examples/index.tsx',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, './dist'),
    },
    devServer: {
        client: {
            overlay: true,
            progress: true,
        },
        hot: true,
        open: true,
        static: {
            directory: './dist',
        },
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
        ],
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.css'],
    },
    plugins: [
        new CopyPlugin({ patterns: [{ from: "./examples/styles", to: "./" }, { from: "./examples/fonts", to: "./fonts" }] }),
        new HtmlWebpackPlugin({ favicon: 'examples/favicon.ico', template: 'examples/index.html' }),
    ],
};
