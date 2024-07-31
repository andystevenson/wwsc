module.exports = {
  apps: [
    // {
    //   name: 'postcode',
    //   script: 'services/postcode/src/index.ts',
    //   interpreter: 'bun',
    // },
    {
      name: 'conninfo',
      script: 'services/conninfo/src/index.ts',
      interpreter: 'bun',
    },
    {
      name: 'timesheets',
      script: 'src/index.ts',
      cwd: 'apps/timesheets',
      interpreter: 'bun --hot',
    },
  ],
}
