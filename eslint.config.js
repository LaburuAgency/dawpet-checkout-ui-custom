export default [
  {
    ignores: ["node_modules/**", "checkout-ui-custom/**"]
  },
  {
    files: ["src/**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        vtex: "readonly",
        vtexjs: "readonly",
        metrics: "readonly",
        __RUNTIME__: "readonly"
      }
    },
    rules: {
      "no-console": "off",
      "no-unused-vars": "warn",
      "prefer-const": "warn"
    }
  }
];