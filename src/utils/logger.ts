/**
 * Logger utility for consistent logging across the application
 * Only logs in development mode to keep production clean
 */

const isDev = process.env.NODE_ENV === 'development';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LoggerOptions {
  emoji?: string;
  context?: string;
}

const formatMessage = (level: LogLevel, message: string, options?: LoggerOptions): string => {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const emoji = options?.emoji || getDefaultEmoji(level);
  const context = options?.context ? `[${options.context}]` : '';
  return `${emoji} ${timestamp} ${context} ${message}`;
};

const getDefaultEmoji = (level: LogLevel): string => {
  switch (level) {
    case 'info': return '';
    case 'warn': return '';
    case 'error': return '';
    case 'debug': return '';
    default: return '';
  }
};

export const logger = {
  info: (message: string, data?: any, options?: LoggerOptions) => {
    if (isDev) {
      console.log(formatMessage('info', message, options), data !== undefined ? data : '');
    }
  },

  warn: (message: string, data?: any, options?: LoggerOptions) => {
    if (isDev) {
      console.warn(formatMessage('warn', message, options), data !== undefined ? data : '');
    }
  },

  error: (message: string, error?: any, options?: LoggerOptions) => {
    // Always log errors, even in production
    console.error(formatMessage('error', message, options), error !== undefined ? error : '');
  },

  debug: (message: string, data?: any, options?: LoggerOptions) => {
    if (isDev) {
      console.debug(formatMessage('debug', message, options), data !== undefined ? data : '');
    }
  },

  // Group related logs together
  group: (label: string, fn: () => void) => {
    if (isDev) {
      console.group(label);
      fn();
      console.groupEnd();
    }
  },

  // Measure execution time
  time: (label: string) => {
    if (isDev) {
      console.time(label);
    }
  },

  timeEnd: (label: string) => {
    if (isDev) {
      console.timeEnd(label);
    }
  },

  // Table format for arrays/objects
  table: (data: any) => {
    if (isDev) {
      console.table(data);
    }
  }
};

// Context-specific loggers
export const createLogger = (context: string) => ({
  info: (message: string, data?: any) => logger.info(message, data, { context }),
  warn: (message: string, data?: any) => logger.warn(message, data, { context }),
  error: (message: string, error?: any) => logger.error(message, error, { context }),
  debug: (message: string, data?: any) => logger.debug(message, data, { context }),
});

export default logger;
