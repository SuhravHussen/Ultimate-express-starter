import morgan from 'morgan';
import { StreamOptions } from 'morgan';
import logger from '@utils/logger';
import env from '@config/env';

// Create a stream that writes to our Winston logger
const stream: StreamOptions = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

// Setup the morgan middleware
const requestLogger = morgan(
  // Use the common format for development, and a more concise format for production
  env.NODE_ENV === 'development' 
    ? 'dev' 
    : ':remote-addr - :method :url :status :res[content-length] - :response-time ms',
  { stream }
);

export default requestLogger;

 