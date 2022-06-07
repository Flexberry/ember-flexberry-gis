/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
const NodeRules = require('eslint-plugin-node').configs.recommended.rules;
const {
  DEFAULT_IGNORED_PROPERTIES,
} = require('eslint-plugin-ember/lib/rules/avoid-leaking-state-in-ember-objects');

module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module',
  },
  plugins: ['ember'],
  extends: ['eslint:recommended', 'airbnb-base', 'plugin:import/errors', 'plugin:import/warnings', 'plugin:ember/recommended'],
  env: {
    browser: true,
  },
  globals: {
    Inputmask: 'writable',
    Base64: 'writable',
    L: 'writable',
    moment: 'writable',
    Terraformer: 'writable',
    proj4: 'writable',
    omnivore: 'writable',
    Chart: 'writable',
  },
  rules: {
    'import/no-extraneous-dependencies': ['error', { devDependencies: true, optionalDependencies: true, }],
    'import/no-unresolved': 'off',
    'import/extensions': 'off',
    'import/core-modules': [ 'sinon' ],
    "import/prefer-default-export": "off",
    'ember/no-observers': 'off',
    'ember/new-module-imports': 'off',
    'ember/closure-actions': 'off',
    'ember/no-arrow-function-computed-properties': 'error',
    'prefer-arrow-callback': 'off',
    'func-names': ['error', 'never'],
    'no-continue': 'off',
    "no-console": "off",
    "no-alert": "off",
    'no-plusplus': [2, { allowForLoopAfterthoughts: true }],
    'no-underscore-dangle': 'off',
    'max-len': [
      'error',
      {
        code: 160,
      }
    ],
    indent: [
      'error',
      2,
      {
        FunctionDeclaration: {
          body: 1,
          parameters: 2,
        },
        SwitchCase: 1,
      }
    ],
    'ember/avoid-leaking-state-in-ember-objects': [
      'error',
      [...DEFAULT_IGNORED_PROPERTIES, 'developerUserSettings']
    ],
    'prefer-rest-params': 'off',
    'comma-dangle': ['error', { objects: 'always', }],
    'comma-style': ['error', 'last', { exceptions: { CallExpression: true, }, }],
    'no-param-reassign': 'off',
    'padding-line-between-statements': ['error', { blankLine: 'always', prev: 'if', next: '*', }],
    'ember/no-new-mixins': 'off',
    'no-return-assign': ['error', 'except-parens'],
    'arrow-parens': ['error', 'always'],
    'consistent-return': 'off',
    "no-eval": "off",
  },
  overrides: [
    // node files
    {
      files: [
        'ember-cli-build.js',
        'index.js',
        'testem.js',
        'blueprints/*/index.js',
        'config/**/*.js',
        'tests/dummy/config/**/*.js'
      ],
      excludedFiles: ['addon/**', 'addon-test-support/**', 'app/**', 'tests/dummy/app/**'],
      parserOptions: {
        sourceType: 'script',
        ecmaVersion: 2015,
      },
      env: {
        browser: false,
        node: true,
      },
      plugins: ['node'],
      rules: NodeRules, // add your custom rules and overrides for node files here
    }
  ],
};
