import Skill from '../models/Skill.js';
import ExchangeRequest from '../models/ExchangeRequest.js';
import Notification from '../models/Notification.js';

export const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const [skills, sent, received, recentActivity] = await Promise.all([
      Skill.find({ owner: userId }).sort({ createdAt: -1 }),
      ExchangeRequest.find({ sender: userId }),
      ExchangeRequest.find({ receiver: userId }),
      Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(8),
    ]);
    const all = [...sent, ...received];
    const count = (status) => all.filter((r) => r.status === status).length;
    res.json({
      skillsOffered: skills.filter((s) => s.type === 'offer'),
      skillsWanted: skills.filter((s) => s.type === 'want'),
      stats: {
        sent: sent.length,
        received: received.length,
        pending: count('pending'),
        accepted: count('accepted'),
        completed: count('completed'),
        pendingReceived: received.filter((r) => r.status === 'pending').length,
      },
      recentActivity,
    });
  } catch (err) {
    next(err);
  }
};