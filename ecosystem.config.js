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
      watch: false,
      max_memory_restart: '1G',
      autorestart: true,
      max_restarts: 1,
      min_uptime: '10s',
      restart_delay: 5000
    }
  ]
};
