/**
 * PM2 process for the Expo static web build.
 *
 * 1) npm run build:web
 * 2) npm run pm2:start
 */
module.exports = {
  apps: [
    {
      name: 'nsg-web',
      script: 'node_modules/serve/build/main.js',
      args: ['-s', 'dist', '-l', '3000'],
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
