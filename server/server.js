import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import connectDB from './config/db.js';
import { ensureAdminAccount } from './utils/ensureAdminAccount.js';
import { syncUserIndexes } from './utils/syncIndexes.js';
import { initSocket } from './sockets/socketServer.js';
import { corsOriginCallback } from './utils/corsConfig.js';

import authRoutes from './routes/authRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import employerRoutes from './routes/employerRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import passwordResetRoutes from './routes/passwordResetRoutes.js';

import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { generalLimiter } from './middleware/rateLimiter.js';

dotenv.config();

const start = async () => {
  await connectDB();
  await syncUserIndexes();
  await ensureAdminAccount();

  const app = express();
  const httpServer = http.createServer(app);

  initSocket(httpServer);

  app.use(
    cors({
      origin: corsOriginCallback,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/api/health', (req, res) => {
    res.status(200).json({ success: true, message: 'NJobs API is running' });
  });

  app.use('/api', generalLimiter);

  app.use('/api/auth', authRoutes);
  app.use('/api/jobs', jobRoutes);
  app.use('/api/company', companyRoutes);
  app.use('/api/applications', applicationRoutes);
  app.use('/api/employer', employerRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/password-reset', passwordResetRoutes);

  app.use(notFound);
  app.use(errorHandler);

  const PORT = process.env.PORT || 5000;
  httpServer.listen(PORT, () => {
    console.log(`NJobs API running on port ${PORT}`);
    console.log(`Socket.io ready for real-time messaging`);
  });
};

start();
