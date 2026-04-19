function log(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const payload = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  process.stdout.write(
    `[${timestamp}] ${level.toUpperCase()} ${message}${payload}\n`
  );
}

const logger = {
  info(message, meta) {
    log('info', message, meta);
  },
  warn(message, meta) {
    log('warn', message, meta);
  },
  error(message, meta) {
    log('error', message, meta);
  },
};

module.exports = logger;
