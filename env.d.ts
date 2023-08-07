declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: string;
      DATABASE_URL: string;
      SERVER_PORT: string;
      JWT_SECRET: string;
      JWT_EXPIRED_TIME: string;
      YOUTUBE_API_KEY: string;
      YOUTUBE_API_URL: string;
      RABBIT_MQ_HOST: string;
      NOTIFICATION_SOCKET_PORT: string;
      WEB_APP_URL: string;
    }
  }
}

export {}
