const LOCALHOST_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

const getAllowedOrigins = () => {
  const configured = (process.env.CLIENT_URL || '')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean);

  return configured.length > 0 ? configured : ['http://localhost:5173'];
};

export const corsOriginCallback = (origin, callback) => {
  if (!origin) {
    return callback(null, true);
  }

  if (process.env.NODE_ENV !== 'production' && LOCALHOST_PATTERN.test(origin)) {
    return callback(null, true);
  }

  const allowedOrigins = getAllowedOrigins();
  if (allowedOrigins.includes(origin)) {
    return callback(null, true);
  }

  callback(new Error(`Origin ${origin} is not allowed by CORS`));
};
