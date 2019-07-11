const path = require('path');

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
    devtool: 'source-map'
};