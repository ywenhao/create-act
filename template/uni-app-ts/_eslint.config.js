const uni = require('@uni-helper/eslint-config')

module.exports = uni({}, {
  files: ['**/*.vue', '**/*.js', '**/*.ts'],
  rules: {
    'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
  },
})
