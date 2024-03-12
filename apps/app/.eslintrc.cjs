module.exports = {
  root: true,
  extends: [
    "custom",
    "@nuxt/eslint-config",
    "plugin:tailwindcss/recommended"
  ],
  overrides: [
    {
      files: [
        "*.vue"
      ],
      parser: "vue-eslint-parser"
    }
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
}
