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
      name: 'webhooks',
      script: 'services/webhooks/src/index.ts',
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
      'pre-setup': 'wwsc-pre-setup.sh',
      'post-setup': 'wwsc-post-setup.sh',
      'pre-deploy': "echo 'pre-deploy stuff'",
      'post-deploy': "echo 'post-deploy stuff'",
      'pre-deploy-local': "echo 'some local command'",
    },
  },
}
