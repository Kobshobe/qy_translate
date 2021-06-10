module.exports = {
  root: true,

  env: {
    node: true,
  },

  globals: {
    chrome: true,
  },

  extends: [
    'plugin:vue/vue3-essential',
  ],

  parserOptions: {
    parser: '@typescript-eslint/parser'
  },

  rules: {
    "generator-star-spacing": "off",
    "object-curly-spacing": "off",
    "no-var": "error",
    "semi": 0,
    "eol-last": "off",
    "no-tabs": "off",
    "indent": "off",
    "quote-props": 0,
    "no-mixed-spaces-and-tabs": "off",
    "no-trailing-spaces": "off",
    "arrow-parens": 0,
    "spaced-comment": "off",
    "space-before-function-paren": "off",
    "no-empty": "off",
    "no-else-return": "off",
    "no-console": "off",
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
  },

  'extends': [
    'plugin:vue/vue3-essential',
    '@vue/typescript'
  ]
}
