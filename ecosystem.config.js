module.exports = {
  apps: [
    {
      name: 'hamutay_frontend',
      script: 'serve',
      args: '-s dist -l 3005',
      env: {
        NODE_ENV: 'production',
      },
      instances: 1,
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '500M',
      error_file: './pm2_logs/error.log',
      out_file: './pm2_logs/out.log',
      log_file: './pm2_logs/combined.log',
      time: true,
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
    },
  ],
};
