'use strict';

module.exports = env => {
    if (env.development) {
        process.env.NODE_ENV = 'development';
        return require("./webpack.dev.config");
    }
    if (env.production) {
        process.env.NODE_ENV = 'production';
        return require("./webpack.prod.config");
    }
};
