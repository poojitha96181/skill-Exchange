import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const initSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user || user.status === 'suspended') return next(new Error('Not authorized'));
      socket.userId = String(user._id);
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.userId}`);

    socket.on('conversation:join', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on('conversation:leave', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on('typing', ({ conversationId, toUserId }) => {
      io.to(`user:${toUserId}`).emit('typing', { conversationId, fromUserId: socket.userId });
    });
  });
};

export default initSocket;