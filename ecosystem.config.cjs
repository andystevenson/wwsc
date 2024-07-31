module.exports = {
  apps: [
    {
      name: 'postcode',
      script: 'services/postcode/src/index.ts',
      interpreter: 'bun',
    },
    {
      name: 'conninfo',
      script: 'services/conninfo/src/index.ts',
      interpreter: 'bun',
    },
    {
      name: 'timesheets',
      script: 'apps/timesheets/src/index.ts',
      interpreter: 'bun',
    },
  ],
}
