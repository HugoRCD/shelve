module.exports = {
  extends: [
    "@shelve/eslint-config",
    "plugin:tailwindcss/recommended"
  ],
  rules: {
    "tailwindcss/no-custom-classname": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
  }
}
