module.exports = {
    "parser": "babel-eslint",
    "extends": "airbnb",
    "env": {
        "browser": true,
    },
    "rules": {
        "arrow-body-style": ["off"],
        "consistent-return": ["off"],
        "import/import/no-unresolved": ["off"],
        "max-len": ["error", {
            "code": 100,
            "ignoreComments": true,
            "ignoreStrings": true
        }],
        "no-plusplus": ["error", { "allowForLoopAfterthoughts": true }],
        "operator-linebreak": ["error", "after"],
        "react/jsx-filename-extension": ["off"], // https://github.com/gregnb/react-to-print/pull/65
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
