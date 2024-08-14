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
    {
      name: 'closures',
      script: 'src/index.ts',
      cwd: 'apps/closures',
      interpreter: 'bun',
    },
  ],
  // Deployment Configuration
  deploy: {
    production: {
      // key: '/Users/andystevenson/.ssh/id_ed25519.pub',
      user: 'ajs',
      host: ['wwsc.cloud'],
      ref: 'origin/main',
      repo: 'git@github.com:andystevenson/wwsc.git',
      path: '/home/ajs',
      'pre-setup': 'wwsc-pre-setup.sh',
      'post-setup': 'wwsc-post-setup.sh',
      'pre-deploy': "echo 'pre-deploy stuff'",
      'post-deploy': '/bin/sh -c \'echo "post-deploy stuff"\'',
      'pre-deploy-local': "echo 'some local command'",
    },
  },
}
