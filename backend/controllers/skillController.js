import Skill, { SKILL_CATEGORIES } from '../models/Skill.js';

export const getCategories = (req, res) => {
  res.json({ categories: SKILL_CATEGORIES });
};

export const createSkill = async (req, res, next) => {
  try {
    const { name, category, type, level, description } = req.body;
    if (!name || !category || !type) {
      return res.status(400).json({ message: 'Name, category and type are required' });
    }
    const skill = await Skill.create({
      owner: req.user._id,
      name,
      category,
      type,
      level,
      description,
    });
    res.status(201).json({ skill });
  } catch (err) {
    next(err);
  }
};

export const getSkills = async (req, res, next) => {
  try {
    const { search, category, type, owner, mine } = req.query;
    const filter = {};
    if (mine === 'true') filter.owner = req.user._id;
    else if (owner) filter.owner = owner;
    if (category) filter.category = category;
    if (type) filter.type = type;
    if (search) filter.name = { $regex: search, $options: 'i' };
    const skills = await Skill.find(filter)
      .populate('owner', 'name department year profilePicture')
      .sort({ createdAt: -1 })
      .limit(200);
    res.json({ skills });
  } catch (err) {
    next(err);
  }
};

export const updateSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ message: 'Skill not found' });
    if (String(skill.owner) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only edit your own skills' });
    }
    const { name, category, type, level, description } = req.body;
    if (name !== undefined) skill.name = name;
    if (category !== undefined) skill.category = category;
    if (type !== undefined) skill.type = type;
    if (level !== undefined) skill.level = level;
    if (description !== undefined) skill.description = description;
    await skill.save();
    res.json({ skill });
  } catch (err) {
    next(err);
  }
};

export const deleteSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ message: 'Skill not found' });
    if (String(skill.owner) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only delete your own skills' });
    }
    await skill.deleteOne();
    res.json({ message: 'Skill deleted' });
  } catch (err) {
    next(err);
  }
};