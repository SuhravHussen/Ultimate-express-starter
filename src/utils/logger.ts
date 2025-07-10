import winston from 'winston';
import env from '@config/env';

const { format, transports, createLogger } = winston;
const { combine, timestamp, printf, colorize } = format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const logger = createLogger({
  level: env.LOG_LEVEL,
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    new transports.Console({
      format: combine(colorize(), logFormat),
    }),
  ],
});

// Add a file transport in production
if (env.NODE_ENV === 'production') {
  logger.add(
    new transports.File({ filename: 'logs/error.log', level: 'error' })
  );
  logger.add(
    new transports.File({ filename: 'logs/combined.log' })
  );
}

export default logger; 