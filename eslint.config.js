const eslintJs = require("@eslint/js");
const eslintPluginReact = require("eslint-plugin-react");
const globals = require("globals");
const typescriptEslint = require("typescript-eslint");

module.exports = [
    eslintJs.configs.recommended,
    typescriptEslint.configs.eslintRecommended,
    {
        settings: {
            react: {
                version: "18.3.1",
            },
        },
        ...eslintPluginReact.configs.flat.recommended,
    },
    ...typescriptEslint.configs.strictTypeChecked,
    ...typescriptEslint.configs.stylisticTypeChecked,
    {
        name: "react-to-print/base",
        files: [
            "**/*.ts",
            "**/*.tsx",
        ],
        languageOptions: {
            ecmaVersion: 5,
            globals: {
                ...globals.browser,
            },
            parser: typescriptEslint.parser,
            parserOptions: {
                project: "tsconfig.json",
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