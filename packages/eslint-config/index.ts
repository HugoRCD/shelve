module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "@nuxt/eslint-config",
    "plugin:tailwindcss/recommended"
  ],
  rules: {
    "tailwindcss/no-custom-classname": "off",
    "tailwindcss/no-unnecessary-arbitrary-value": "off",
    "vue/multi-word-component-names": "off",
    "vue/require-default-prop": "off",
    "vue/max-attributes-per-line": [
      'warn',
      {
        singleline: 5,
      }
    ],
  }
};
