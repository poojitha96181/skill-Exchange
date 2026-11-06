import Notification from '../models/Notification.js';

const createNotification = async (io, { user, type, text, link = '' }) => {
  const notification = await Notification.create({ user, type, text, link });
  if (io) io.to(`user:${user}`).emit('notification:new', notification);
  return notification;
};

export default createNotification;