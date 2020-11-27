'use strict';

module.exports = () => {
    if (process.env.NODE_ENV === 'development') {
        console.log('Building dev bundle...');
        return require("./webpack.dev.config");
    }
    if (process.env.NODE_ENV === 'production') {
        console.log('Building prod bundle...');
        return require("./webpack.prod.config");
    }
};
