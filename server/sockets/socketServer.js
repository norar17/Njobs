import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import { corsOriginCallback } from '../utils/corsConfig.js';

let io;

const MESSAGE_RATE_WINDOW_MS = 10 * 1000;
const MESSAGE_RATE_MAX = 20;
const messageTimestamps = new Map();

const isRateLimited = (userId) => {
  const now = Date.now();
  const key = userId.toString();
  const timestamps = (messageTimestamps.get(key) || []).filter((t) => now - t < MESSAGE_RATE_WINDOW_MS);

  if (timestamps.length >= MESSAGE_RATE_MAX) {
    messageTimestamps.set(key, timestamps);
    return true;
  }

  timestamps.push(now);
  messageTimestamps.set(key, timestamps);
  return false;
};

setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of messageTimestamps.entries()) {
    const fresh = timestamps.filter((t) => now - t < MESSAGE_RATE_WINDOW_MS);
    if (fresh.length === 0) {
      messageTimestamps.delete(key);
    } else {
      messageTimestamps.set(key, fresh);
    }
  }
}, 60 * 1000);

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: corsOriginCallback,
      credentials: true,
    },
    maxHttpBufferSize: 1e7,
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user || user.isBanned) {
        return next(new Error('Authentication failed'));
      }

      socket.user = user;
      next();
    } catch {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.user._id}`);

    socket.on('conversation:join', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on('conversation:leave', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on('message:send', async ({ conversationId, text }, callback) => {
      try {
        if (isRateLimited(socket.user._id)) {
          return callback?.({ success: false, message: 'You are sending messages too quickly. Please slow down.' });
        }

        if (!text || !text.trim()) {
          return callback?.({ success: false, message: 'Message cannot be empty' });
        }

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          return callback?.({ success: false, message: 'Conversation not found' });
        }

        const userId = socket.user._id.toString();
        const isApplicant = conversation.applicant.toString() === userId;
        const isEmployer = conversation.employer.toString() === userId;

        if (!isApplicant && !isEmployer) {
          return callback?.({ success: false, message: 'Not authorized for this conversation' });
        }

        const message = await Message.create({
          conversation: conversation._id,
          sender: socket.user._id,
          text: text.trim(),
        });

        conversation.lastMessage = text.trim();
        conversation.lastMessageAt = new Date();
        if (isApplicant) {
          conversation.unreadByEmployer += 1;
        } else {
          conversation.unreadByApplicant += 1;
        }
        await conversation.save();

        const populated = await message.populate('sender', 'name avatar role');

        const recipientId = isApplicant ? conversation.employer : conversation.applicant;

        io.to(`conversation:${conversationId}`).emit('message:new', populated);
        io.to(`user:${recipientId}`).emit('conversation:updated', {
          conversationId: conversation._id,
          lastMessage: conversation.lastMessage,
          lastMessageAt: conversation.lastMessageAt,
        });

        callback?.({ success: true, message: populated });
      } catch (err) {
        callback?.({ success: false, message: 'Failed to send message' });
      }
    });

    socket.on('messages:read', async ({ conversationId }) => {
      try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        const userId = socket.user._id.toString();
        const isApplicant = conversation.applicant.toString() === userId;
        const isEmployer = conversation.employer.toString() === userId;
        if (!isApplicant && !isEmployer) return;

        const now = new Date();
        await Message.updateMany(
          { conversation: conversationId, sender: { $ne: socket.user._id }, readAt: null },
          { readAt: now }
        );

        if (isEmployer) {
          conversation.unreadByEmployer = 0;
        } else {
          conversation.unreadByApplicant = 0;
        }
        await conversation.save();

        const otherPartyId = isApplicant ? conversation.employer : conversation.applicant;
        io.to(`conversation:${conversationId}`).emit('messages:seen', {
          conversationId,
          readBy: socket.user._id,
          readAt: now,
        });
        io.to(`user:${otherPartyId}`).emit('conversation:read', { conversationId });
      } catch {
        return;
      }
    });

    socket.on('attachment:sent', async ({ conversationId, message }) => {
      try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        const userId = socket.user._id.toString();
        const isApplicant = conversation.applicant.toString() === userId;
        const recipientId = isApplicant ? conversation.employer : conversation.applicant;

        socket.to(`conversation:${conversationId}`).emit('message:new', message);
        io.to(`user:${recipientId}`).emit('conversation:updated', {
          conversationId,
          lastMessage: conversation.lastMessage,
          lastMessageAt: conversation.lastMessageAt,
        });
      } catch {
        return;
      }
    });

    socket.on('typing:start', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('typing:start', { userId: socket.user._id });
    });

    socket.on('typing:stop', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('typing:stop', { userId: socket.user._id });
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized');
  }
  return io;
};
