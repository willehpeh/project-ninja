import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: [
      '**/dist',
      '**/out-tsc'
    ]
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.js',
      '**/*.jsx'
    ],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [
            '^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'
          ],
          depConstraints: [
            {
              sourceTag: 'layer:domain',
              onlyDependOnLibsWithTags: []
            },
            {
              sourceTag: 'layer:application',
              onlyDependOnLibsWithTags: ['layer:domain']
            },
            {
              sourceTag: 'layer:infrastructure',
              onlyDependOnLibsWithTags: ['layer:application', 'layer:domain']
            },
            {
              sourceTag: 'layer:tests',
              onlyDependOnLibsWithTags: ['layer:domain', 'layer:application', 'layer:infrastructure']
            },
            {
              sourceTag: 'layer:api',
              onlyDependOnLibsWithTags: ['layer:application', 'layer:infrastructure']
            }
          ]
        }
      ]
    }
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs'
    ],
    // Override or add rules here
    rules: {}
  }
];
