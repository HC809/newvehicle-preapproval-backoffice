module.exports = {
  apps: [
    {
      name: 'vehicle-pre-approval-backoffice',
      script: 'cmd',
      args: '/c "pnpm start"',
      cwd: process.cwd(),
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};
