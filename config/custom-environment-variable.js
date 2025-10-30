require('dotenv').config();

const number = (name) => ({ __name: name, __format: 'number' });
const boolean = (name) => ({ __name: name, __format: 'boolean' });
const json = (name) => ({ __name: name, __format: 'json' });

module.exports = {
  PORT: number('PORT'),
  appName: 'APP_NAME',

  core: {
    database: {
      type: 'CORE_DATABASE_TYPE',
      host: 'CORE_DATABASE_HOST',
      port: number('CORE_DATABASE_PORT'),
      username: 'CORE_DATABASE_USERNAME',
      password: 'CORE_DATABASE_PASSWORD',
      database: 'CORE_DATABASE_NAME',
      synchronize: boolean('CORE_DATABASE_SYNCHRONIZE'),
      logging: boolean('CORE_DATABASE_LOGGING'),
    },

    gateway: {
      initServices: json('CORE_GATEWAY_INIT_SERVICES'),
      services: {
        account: {
          transport: number('CORE_GATEWAY_SERVICE_ACCOUNT_TRANSPORT'), // e.g., 1 for HTTP, 2 for gRPC
          options: {
            host: 'CORE_GATEWAY_SERVICE_ACCOUNT_HOST',
            port: number('CORE_GATEWAY_SERVICE_ACCOUNT_PORT'),
          },
        },
      },
    },

    cache: {
      store: 'CORE_CACHE_STORE',
      ttl: number('CORE_CACHE_TTL'),
      max: number('CORE_CACHE_MAX'),
    },

    heathCheck: {
      disk: {
        path: 'CORE_HEALTHCHECK_DISK_PATH',
        thresholdPercent: number('CORE_HEALTHCHECK_DISK_THRESHOLD_PERCENT'),
        enabled: boolean('CORE_HEALTHCHECK_DISK_ENABLED'),
      },

      memory: {
        heapThreshold: number('CORE_HEALTHCHECK_MEMORY_HEAP_THRESHOLD'),
        rssThreshold: number('CORE_HEALTHCHECK_MEMORY_RSS_THRESHOLD'),
        enableHeapCheck: boolean('CORE_HEALTHCHECK_MEMORY_ENABLE_HEAP_CHECK'),
        enableRssCheck: boolean('CORE_HEALTHCHECK_MEMORY_ENABLE_RSS_CHECK'),
      },

      database: {
        enable: boolean('CORE_HEALTHCHECK_DATABASE_ENABLED'),
      },

      http: {
        url: 'CORE_HEALTHCHECK_HTTP_URL',
        enable: boolean('CORE_HEALTHCHECK_HTTP_ENABLE'),
      },

      microservices: {
        enable: boolean('CORE_HEALTHCHECK_MICROSERVICES_ENABLE'),
      },
    },
  },

  // Common config
  common: {},

  account: {
    token: {
      secret: 'ACCOUNT_TOKEN_SECRET',
      expiresIn: number('ACCOUNT_TOKEN_EXPIRES_IN'), // in seconds
      refreshExpiresIn: number('ACCOUNT_TOKEN_REFRESH_EXPIRES_IN'), // in seconds
    },
  },

  // Service configs:
  notification: {
    sse: {
      useRedis: boolean('NOTIFICATION_SSE_USE_REDIS'), // enable if scaling with multiple instances
      redis: {
        host: 'NOTIFICATION_SSE_REDIS_HOST',
        port: number('NOTIFICATION_SSE_REDIS_PORT'),
        password: 'NOTIFICATION_SSE_REDIS_PASSWORD',
      },
      tokenSecret: 'NOTIFICATION_SSE_TOKEN_SECRET',
    },
  },
};
