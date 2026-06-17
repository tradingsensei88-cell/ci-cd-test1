module.exports = {
  apps: [
    {
      name: "aethersound-app",
      script: "./backend/server.js",
      cwd: "./",
      instances: 1, // Running in fork mode (1 instance) to ensure local file-based DB consistency. Change to "max" and exec_mode "cluster" if using MongoDB.
      exec_mode: "fork",
      watch: false,
      max_memory_restart: "1G",
      env_production: {
        NODE_ENV: "production",
        PORT: 5000
      }
    }
  ]
};
