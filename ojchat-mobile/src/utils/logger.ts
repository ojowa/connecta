const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };

let currentLevel = __DEV__ ? LOG_LEVELS.debug : LOG_LEVELS.warn;

export const logger = {
  debug: (...args: unknown[]) => {
    if (currentLevel <= LOG_LEVELS.debug) console.log('[DEBUG]', ...args);
  },
  info: (...args: unknown[]) => {
    if (currentLevel <= LOG_LEVELS.info) console.log('[INFO]', ...args);
  },
  warn: (...args: unknown[]) => {
    if (currentLevel <= LOG_LEVELS.warn) console.warn('[WARN]', ...args);
  },
  error: (...args: unknown[]) => {
    if (currentLevel <= LOG_LEVELS.error) console.error('[ERROR]', ...args);
  },
  setLevel: (level: keyof typeof LOG_LEVELS) => {
    currentLevel = LOG_LEVELS[level];
  },
};
