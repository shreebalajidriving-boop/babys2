/**
 * PM2 process for the Expo static web build.
 *
 * Listens on 0.0.0.0:8080 so it is reachable via the server public IP.
 * (Port 3000 is often used by other local apps.)
 *
 * 1) npm run build:web
 * 2) npm run pm2:start
 */
module.exports = {
  apps: [
    {
      name: 'nsg-web',
      script: 'node_modules/serve/build/main.js',
      args: '-s dist -l tcp://0.0.0.0:8080',
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
