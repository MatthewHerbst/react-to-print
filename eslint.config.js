const eslintJs = require("@eslint/js");
const eslintPluginReact = require("eslint-plugin-react");
const eslintPluginReactHooks = require("eslint-plugin-react-hooks");
const globals = require("globals");
const typescriptEslint = require("typescript-eslint");

module.exports = [
    eslintJs.configs.recommended,
    typescriptEslint.configs.eslintRecommended,
    {
        settings: {
            react: {
                version: "19.2.4",
            },
        },
        ...eslintPluginReact.configs.flat.recommended,
    },
    eslintPluginReact.configs.flat.recommended,
    eslintPluginReactHooks.configs.flat.recommended,
    ...typescriptEslint.configs.strictTypeChecked,
    ...typescriptEslint.configs.stylisticTypeChecked,
    {
        name: "react-to-print/base",
        files: [
            "src/**/*.ts",
            "src/**/*.tsx",
        ],
        languageOptions: {
            ecmaVersion: 5,
            globals: {
                ...globals.browser,
            },
            parser: typescriptEslint.parser,
            parserOptions: {
                projectService: true,
            },
            sourceType: "module",
        },
        linterOptions: {
            reportUnusedDisableDirectives: "error",
        },
        plugins: {
            "@typescript-eslint": typescriptEslint.plugin,
        },
        rules: {
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-non-null-assertion": "off",
            "@typescript-eslint/non-nullable-type-assertion-style": "off",
            "@typescript-eslint/prefer-for-of": "off",
            "@typescript-eslint/prefer-nullish-coalescing": "off",
            "@typescript-eslint/restrict-template-expressions": ["error", {
                allowNumber: true,
            }],
            "max-len": ["error", {
                code: 120,
                ignoreComments: true,
                ignoreStrings: true,
            }],
        },
    }
];