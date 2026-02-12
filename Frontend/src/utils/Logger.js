/**
 * Simple logger utility to wrap console methods.
 * Logs are disabled in production environment.
 */
const Logger = {
  log: (...args) => {
    if (!import.meta.env.PROD) {
      console.log(...args);
    }
  },
  error: (...args) => {
    if (!import.meta.env.PROD) {
      console.error(...args);
    }
  },
  warn: (...args) => {
    if (!import.meta.env.PROD) {
      console.warn(...args);
    }
  },
  info: (...args) => {
    if (!import.meta.env.PROD) {
      console.info(...args);
    }
  },
};

export default Logger;
