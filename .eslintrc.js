module.exports = {
    "parser": "babel-eslint",
    "extends": "airbnb",
    "env": {
        "browser": true,
    },
    "rules": {
        "import/import/no-unresolved": ["off"],
        "no-plusplus": ["error", { "allowForLoopAfterthoughts": true }],
        "react/no-find-dom-node": ["warning"],
        "react/sort-comp": ["error", {
            order: [
                'static-methods',
                'everything-else',
                'render',
            ],
        }]
    }
};
