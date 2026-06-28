import rateLimit from 'express-rate-limit';

const isProd = process.env.NODE_ENV === 'production';

const jsonHandler = (req, res, next, options) => {
  res.status(options.statusCode).json({
    success: false,
    message: options.message,
  });
};

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 300 : 2000,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP. Please try again in a few minutes.',
  handler: jsonHandler,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 10 : 200,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: 'Too many login attempts. Please wait 15 minutes before trying again.',
  handler: jsonHandler,
});

export const passwordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 8 : 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many password attempts. Please wait 15 minutes before trying again.',
  handler: jsonHandler,
});

export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 60 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many uploads from this IP. Please slow down and try again shortly.',
  handler: jsonHandler,
});

export const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isProd ? 20 : 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many reviews submitted. Please try again later.',
  handler: jsonHandler,
});
