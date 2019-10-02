var path = require('path');
var CopyWebpackPlugin = require('copy-webpack-plugin');

// Build config

module.exports = {
    entry: {
        "game": [
            'babel-polyfill',
            './src/index'
        ]
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    },
    target: 'web',
    module: {
        rules: [
            {
                test: /\.js$/,
                include: [
                    path.resolve(__dirname, "src")
                ],
                loader: 'babel-loader'
            },
            { test: /\.(html|htm)$/, loader: 'dom-loader' }
        ],
    },
    plugins: [
        new CopyWebpackPlugin([
            {from: "index.html", to: "index.html"},
            {from: "assets", to: "assets"},
        ])
    ]
};
