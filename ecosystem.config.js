// PM2 ecosystem configuration for VPS deployment

module.exports = {
  apps: [
    {
      name: 'glownova-frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: './',
      instances: 2,
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_USE_MOCKS: 'false',
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
    },
  ],
};

