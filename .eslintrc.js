module.exports = {
    "parser": "babel-eslint",
    "extends": "airbnb",
    "env": {
        "browser": true,
        // "es6": true
    },
    // "parserOptions": {
    //     "ecmaFeatures": {
    //         "jsx": true
    //     },
    //     "ecmaVersion": 2018,
        // "sourceType": "module"
    // },
    // "plugins": [
    //     "react"
    // ],
    "rules": {
        "no-plusplus": ["error", { "allowForLoopAfterthoughts": true }],
        "react/no-find-dom-node": ["warning"],
        "react/sort-comp": ["error", {
            order: [
                'static-methods',
                'everything-else',
                'render',
            ],
        }]
    //     "indent": [
    //         "error",
    //         "tab"
    //     ],
    //     "linebreak-style": [
    //         "error",
    //         "unix"
    //     ],
    //     "quotes": [
    //         "error",
    //         "single"
    //     ],
    //     "semi": [
    //         "error",
    //         "always"
    //     ]
    }
};
