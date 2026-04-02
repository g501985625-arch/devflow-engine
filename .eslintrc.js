module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json'
  },
  
  plugins: ['@typescript-eslint'],
  
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking'
  ],
  
  rules: {
    // TypeScript 严格规则
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    
    // 占位实现容忍
    '@typescript-eslint/require-await': 'off',
    
    // 代码质量
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'no-var': 'error',
    
    // 异步处理
    '@typescript-eslint/no-floating-promises': 'error',
    
    // 格式化
    'semi': ['error', 'always'],
    'quotes': ['error', 'single', { avoidEscape: true }]
  },
  
  overrides: [
    {
      // CLI 命令文件允许 console 输出
      files: ['src/cli/**/*.ts'],
      rules: {
        'no-console': 'off'
      }
    }
  ],
  
  ignorePatterns: ['dist', 'node_modules', '*.js']
};