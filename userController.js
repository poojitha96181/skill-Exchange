import User from '../models/User.js';
import Skill from '../models/Skill.js';

export const getStudents = async (req, res, next) => {
  try {
    const { search, category, skill } = req.query;
    const filter = { role: 'student', status: 'active', _id: { $ne: req.user._id } };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
      ];
    }
    if (category || skill) {
      const skillFilter = { type: 'offer' };
      if (category) skillFilter.category = category;
      if (skill) skillFilter.name = { $regex: skill, $options: 'i' };
      const ownerIds = await Skill.distinct('owner', skillFilter);
      filter._id = { $ne: req.user._id, $in: ownerIds };
    }

    const students = await User.find(filter).sort({ createdAt: -1 }).limit(100);
    const ids = students.map((s) => s._id);
    const skills = await Skill.find({ owner: { $in: ids } });
    const byOwner = {};
    for (const s of skills) {
      (byOwner[s.owner] ||= []).push(s);
    }
    res.json({
      students: students.map((s) => ({
        ...s.toObject(),
        skillsOffered: (byOwner[s._id] || []).filter((k) => k.type === 'offer'),
        skillsWanted: (byOwner[s._id] || []).filter((k) => k.type === 'want'),
      })),
    });
  } catch (err) {
    next(err);
  }
};

export const getStudentById = async (req, res, next) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    const skills = await Skill.find({ owner: student._id });
    res.json({
      student,
      skillsOffered: skills.filter((s) => s.type === 'offer'),
      skillsWanted: skills.filter((s) => s.type === 'want'),
    });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, department, year, bio, interests } = req.body;
    const user = await User.findById(req.user._id);
    if (name !== undefined) user.name = name;
    if (department !== undefined) user.department = department;
    if (year !== undefined) user.year = year;
    if (bio !== undefined) user.bio = bio;
    if (interests !== undefined) {
      user.interests = Array.isArray(interests)
        ? interests
        : String(interests).split(',').map((i) => i.trim()).filter(Boolean);
    }
    await user.save();
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

export const updateProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image file uploaded' });
    const user = await User.findById(req.user._id);
    user.profilePicture = `/uploads/${req.file.filename}`;
    await user.save();
    res.json({ user });
  } catch (err) {
    next(err);
  }
};