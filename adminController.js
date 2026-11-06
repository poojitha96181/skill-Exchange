import User from '../models/User.js';
import Skill from '../models/Skill.js';
import ExchangeRequest from '../models/ExchangeRequest.js';
import Message from '../models/Message.js';
import Report from '../models/Report.js';

export const getStats = async (req, res, next) => {
  try {
    const [totalStudents, totalSkills, totalRequests, totalMessages, openReports, statusBreakdown, recentUsers] =
      await Promise.all([
        User.countDocuments({ role: 'student' }),
        Skill.countDocuments(),
        ExchangeRequest.countDocuments(),
        Message.countDocuments(),
        Report.countDocuments({ status: 'open' }),
        ExchangeRequest.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
        User.find({ role: 'student' }).sort({ createdAt: -1 }).limit(5),
      ]);
    res.json({
      totalStudents,
      totalSkills,
      totalRequests,
      totalMessages,
      openReports,
      statusBreakdown,
      recentUsers,
    });
  } catch (err) {
    next(err);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const { search } = req.query;
    const filter = { role: 'student' };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const users = await User.find(filter).sort({ createdAt: -1 }).limit(200);
    res.json({ users });
  } catch (err) {
    next(err);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ message: 'Status must be active or suspended' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ message: 'Cannot change admin status' });
    user.status = status;
    await user.save();
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ message: 'Cannot delete an admin' });
    await Promise.all([
      Skill.deleteMany({ owner: user._id }),
      ExchangeRequest.deleteMany({ $or: [{ sender: user._id }, { receiver: user._id }] }),
      user.deleteOne(),
    ]);
    res.json({ message: 'User and related skills/requests deleted' });
  } catch (err) {
    next(err);
  }
};

export const getAllSkills = async (req, res, next) => {
  try {
    const { search } = req.query;
    const filter = {};
    if (search) filter.name = { $regex: search, $options: 'i' };
    const skills = await Skill.find(filter)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .limit(300);
    res.json({ skills });
  } catch (err) {
    next(err);
  }
};

export const getAllRequests = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const requests = await ExchangeRequest.find(filter)
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .populate('offeredSkill', 'name')
      .populate('wantedSkill', 'name')
      .sort({ createdAt: -1 })
      .limit(300);
    res.json({ requests });
  } catch (err) {
    next(err);
  }
};

export const getReports = async (req, res, next) => {
  try {
    const reports = await Report.find()
      .populate('reporter', 'name email')
      .populate('reportedUser', 'name email status')
      .sort({ createdAt: -1 })
      .limit(200);
    res.json({ reports });
  } catch (err) {
    next(err);
  }
};

export const updateReport = async (req, res, next) => {
  try {
    const { status, adminNote } = req.body;
    if (!['open', 'reviewed', 'resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid report status' });
    }
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    report.status = status;
    if (adminNote !== undefined) report.adminNote = adminNote;
    await report.save();
    res.json({ report });
  } catch (err) {
    next(err);
  }
};