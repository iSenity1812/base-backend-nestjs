module.exports = {
  // Server configuration
  port: 3000,
  appName: 'MyApp',

  // Core config
  core: {
    database: {
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'postgres',
      synchronize: false,
      logging: false,
    },

    gateway: {
      initServices: ['account'],
      services: {
        account: {
          transport: 0, // e.g., 1 for HTTP, 2 for gRPC, 0 for TCP
          options: {
            host: 'localhost',
            port: 3001,
          },
        },
      },
    },

    cache: {
      store: 'memory',
      ttl: 5000, // Time to live in seconds
      max: 100, // Maximum number of items in cache
    },

    healthCheck: {
      disk: {
        path: 'D:\\', // Disk path to monitor
        thresholdPercent: 0.6, // Threshold percentage for disk usage
        enabled: false,
      },

      memory: {
        heapThreshold: 300 * 1024 * 1024, // 300 MB
        rssThreshold: 500 * 1024 * 1024, // 500 MB
        enableHeapCheck: false,
        enableRssCheck: false,
      },

      database: {
        enable: true,
      },

      http: {
        url: 'http://127.0.0.1:3000/docs#', // URL to check
        enable: true,
      },

      microservices: {
        enable: true,
      },
    },
  },

  // Common config
  common: {},

  account: {
    token: {
      secret: 'default_secret_token',
      expiresIn: 3600, // in seconds
      refreshExpiresIn: 3600 * 24 * 30, // 30 days in seconds
    },
  },

  // Service configs
  notification: {
    sse: {
      useRedis: false, // enable if scaling with multiple instances
      redis: {
        host: 'localhost',
        port: 6379,
        password: 'default_redis_password',
      },
      tokenSecret: 'default_secret_key',
    },
  },
};
