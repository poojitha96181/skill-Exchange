import Report from '../models/Report.js';
import User from '../models/User.js';

export const createReport = async (req, res, next) => {
  try {
    const { reportedUser, reason } = req.body;
    if (!reportedUser || !reason) {
      return res.status(400).json({ message: 'Reported user and reason are required' });
    }
    if (String(reportedUser) === String(req.user._id)) {
      return res.status(400).json({ message: 'You cannot report yourself' });
    }
    const target = await User.findById(reportedUser);
    if (!target) return res.status(404).json({ message: 'User not found' });
    const report = await Report.create({ reporter: req.user._id, reportedUser, reason });
    res.status(201).json({ report });
  } catch (err) {
    next(err);
  }
};