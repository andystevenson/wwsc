module.exports = {
  apps: [
    {
      name: 'conninfo',
      script: 'services/conninfo/src/index.ts',
      interpreter: 'bun',
    },
    {
      name: 'postcode',
      script: 'services/postcode/src/index.ts',
      interpreter: 'bun',
    },
    {
      name: 'postcode',
      script: 'services/postcode/src/index.ts',
      interpreter: 'bun',
    },
    {
      name: 'timesheets',
      script: 'src/index.ts',
      cwd: 'apps/timesheets',
      interpreter: 'bun',
    },
  ],
  // Deployment Configuration
  deploy: {
    production: {
      user: 'ajs',
      host: ['wwsc.cloud'],
      ref: 'origin/main',
      repo: 'git@github.com:andystevenson/wwsc.git',
      path: '/home/ajs',
      'pre-setup': "echo 'pre-setup stuff'",
      'post-setup': "echo 'post-setup stuff'",
      'pre-deploy': 'pre-deploy stuff',
      'post-deploy': 'post-deploy stuff',
      'pre-deploy-local': "echo 'some local command'",
    },
  },
}
