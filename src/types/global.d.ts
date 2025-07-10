// Global TypeScript definitions

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    PORT: string;
    HOST: string;
    LOG_LEVEL: string;
    CORS_ORIGIN: string;
    USE_ULTIMATE_EXPRESS: string;
  }
}

// Extend Express Request and Response if needed
declare namespace Express {
  interface Request {
    // Add custom properties here
    // userId?: string;
  }

  interface Response {
    // Add custom properties here
  }
} 