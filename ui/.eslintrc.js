module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true
    },
    extends: [
        "prettier",
        "prettier/@typescript-eslint/recommended",
        "plugin:prettier/recommended"
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaFeatures: {
            jsx: true
        },
        ecmaVersion: 12,
        sourceType: "module"
    },
    plugins: ["react", "@typescript-eslint"],
    rules: {
        "@typescript-eslint/require-array-sort-compare": "off",
        "@typescript-eslint/consistent-type-definitions": ["error", "type"],
        "@typescript-eslint/consistent-type-imports": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/generic-type-naming": "off",
        "@typescript-eslint/naming-convention": "off",
        "@typescript-eslint/init-declarations": "off",
        "@typescript-eslint/method-signature-style": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-implicit-any-catch": "off",
        "@typescript-eslint/no-magic-numbers": "off",
        "@typescript-eslint/no-parameter-properties": "off",
        "@typescript-eslint/no-type-alias": "off",
        "@typescript-eslint/no-unnecessary-boolean-literal-compare": "off",
        "@typescript-eslint/no-unnecessary-condition": "off",
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-member-acces": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/no-unsafe-return": "off",
        "@typescript-eslint/no-untyped-public-signature": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars-experimental": "off",
        "@typescript-eslint/no-use-before-define": "off",
        "@typescript-eslint/prefer-readonly-parameter-types": "off",
        "@typescript-eslint/prefer-reduce-type-parameter": "off",
        "@typescript-eslint/require-await": "off",
        "@typescript-eslint/restrict-template-expressions": "off",
        "@typescript-eslint/return-await": "off",
        "@typescript-eslint/strict-boolean-expressions": "off",
        "@typescript-eslint/switch-exhaustiveness-check": "off",
        "@typescript-eslint/typedef": "off",
        "@typescript-eslint/comma-dangle": [
            "error",
            {
                arrays: "only-multiline",
                objects: "only-multiline",
                imports: "only-multiline",
                functions: "only-multiline",
                enums: "only-multiline"
            }
        ],
        "comma-dangle": "off",
        "no-else-return": "error"
    }
}
