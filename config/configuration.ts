export const configuration = () => ({
  app: {
    appName: process.env.APP_NAME || 'FINFRAC',
    apikey: process.env.API_KEY || 'FINFRACKEY',
    serviceName: process.env.SERVICE_NAME || 'Api Service',
    environment: process.env.NODE_ENV || 'development',
    encryption_key: process.env.SERVER_SECRET || 'AppSecret',
    jwt_expiration: process.env.JWT_EXPIRATION || 172800,
    port: process.env.PORT || 7000,
    pagination: {
      itemsPerPage: 10,
    },
    rabbitMQ: process.env.RABBIT_MQ_URL || 'amqp://localhost:5672',
    redisUrl: process.env.REDIS_SERVER_HOST_URL,
    lang: 'en',
    mongodb: {
      url: process.env.DB_URL,
      test: process.env.DB_TEST_URL,
    },
    rdbms: {
      default: 'postgres',
      postgres: {
        host: process.env.POSTGRES_DB_HOST,
        port: process.env.POSTGRES_DB_PORT,
        name: process.env.POSTGRES_DB_NAME,
        username: process.env.POSTGRES_DB_USERNAME,
        password: process.env.POSTGRES_DB_PASSWORD,
      },
    },
  },
  worker: {
    port: process.env.PORT || 7000,
    rabbitMQ: process.env.RABBIT_MQ_URL || 'amqp://localhost:5672',
    redisUrl: process.env.REDIS_SERVER_HOST_URL,
    fileUpload: {
      default: process.env.DEFAULT_STORAGE || 's3',
      gcs: {
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
        keyFile: process.env.GOOGLE_CLOUD_KEYFILE,
        bucket: process.env.GOOGLE_CLOUD_STORAGE_BUCKET
      },
      s3: {
        key: process.env.AWS_ACCESS_KEY,
        secret: process.env.AWS_SECRET_KEY,
        bucket: process.env.AWS_BUCKET,
        region: process.env.AWS_REGION,
      },
    },
    email: {
      noReply: { email: 'no-reply@getkassh.com', name: 'getKassh' },
      mailOption: 'sendgrid',
      sendgrid: {
        apiKey: process.env.SENDGRID_API_KEY,
        contactFormRecipient: process.env.CONTACT_FORM_EMAIL_RECIPIENT,
      },
      postmark: {
        apiKey: process.env.POSTMARK_API_KEY,
        url: process.env.POSTMARK_BASE_URL,
      },
    },
    workerServiceToken: process.env.WORKER_SERVICE_TOKEN,
  },
});
