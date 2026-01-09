/**
 * PM2 Ecosystem Configuration
 *
 * Process management configuration for production deployment.
 * PM2 handles process monitoring, auto-restart, and log management.
 *
 * Usage:
 *   pm2 start ecosystem.config.js --env production
 *   pm2 logs art-request-form
 *   pm2 restart art-request-form
 *   pm2 stop art-request-form
 */

module.exports = {
  apps: [
    {
      name: 'art-request-form',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '/var/www/art-request-form',
      instances: 'max', // Use all available CPU cores
      exec_mode: 'cluster',

      // Environment variables
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },

      // Auto-restart configuration
      watch: false, // Don't watch files in production
      max_memory_restart: '1G', // Restart if memory exceeds 1GB

      // Error handling
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',

      // Logging
      error_file: '/var/log/pm2/art-request-form-error.log',
      out_file: '/var/log/pm2/art-request-form-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      combine_logs: true,

      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
    },
  ],
};
