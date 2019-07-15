const path = require('path');
const CopyWebapckPlugin = require('copy-webpack-plugin');

module.exports = {
    entry : {
        index : './src/index.js'
    },
    module : {
        rules : [
            {
                test : /\.(js)$/,
                include : path.resolve(__dirname, 'src'),
                exclude : /node_modules/,
                use : 'babel-loader'
            }
        ]
    },
    plugins : [
        new CopyWebapckPlugin([
            { from : 'src/webgl/shaders', to : 'shaders' }
        ])
    ],
    devtool: 'source-map'
};