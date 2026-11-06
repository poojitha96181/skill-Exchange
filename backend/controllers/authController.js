import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  department: user.department,
  year: user.year,
  bio: user.bio,
  interests: user.interests,
  profilePicture: user.profilePicture,
  status: user.status,
  createdAt: user.createdAt,
});

export const register = async (req, res, next) => {
  try {
    const { name, email, password, department, year } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ message: 'An account with this email already exists' });

    const user = await User.create({ name, email, password, department, year, role: 'student' });
    res.status(201).json({ token: generateToken(user._id), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Your account has been suspended' });
    }
    res.json({ token: generateToken(user._id), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res) => {
  res.json({ user: publicUser(req.user) });
};