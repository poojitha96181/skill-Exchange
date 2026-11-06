import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import createNotification from '../utils/notify.js';

export const createOrGetConversation = async (req, res, next) => {
  try {
    const { participantId } = req.body;
    if (!participantId) return res.status(400).json({ message: 'participantId is required' });
    if (String(participantId) === String(req.user._id)) {
      return res.status(400).json({ message: 'Cannot start a conversation with yourself' });
    }
    const other = await User.findById(participantId);
    if (!other) return res.status(404).json({ message: 'User not found' });

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, participantId], $size: 2 },
    });
    if (!conversation) {
      conversation = await Conversation.create({ participants: [req.user._id, participantId] });
    }
    conversation = await conversation.populate('participants', 'name profilePicture department');
    res.json({ conversation });
  } catch (err) {
    next(err);
  }
};

export const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'name profilePicture department')
      .populate({ path: 'lastMessage', populate: { path: 'sender', select: 'name' } })
      .sort({ updatedAt: -1 });
    res.json({ conversations });
  } catch (err) {
    next(err);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    if (!conversation.participants.some((p) => String(p) === String(req.user._id))) {
      return res.status(403).json({ message: 'You are not part of this conversation' });
    }
    const messages = await Message.find({ conversation: conversation._id })
      .populate('sender', 'name profilePicture')
      .sort({ createdAt: 1 })
      .limit(500);
    await Message.updateMany(
      { conversation: conversation._id, readBy: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } }
    );
    res.json({ messages });
  } catch (err) {
    next(err);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ message: 'Message text is required' });
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    if (!conversation.participants.some((p) => String(p) === String(req.user._id))) {
      return res.status(403).json({ message: 'You are not part of this conversation' });
    }

    let message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      text: text.trim(),
      readBy: [req.user._id],
    });
    conversation.lastMessage = message._id;
    await conversation.save();
    message = await message.populate('sender', 'name profilePicture');

    const recipient = conversation.participants.find((p) => String(p) !== String(req.user._id));
    req.io.to(`user:${recipient}`).emit('message:new', {
      conversationId: String(conversation._id),
      message,
    });
    await createNotification(req.io, {
      user: recipient,
      type: 'message',
      text: `New message from ${req.user.name}`,
      link: '/messages',
    });
    res.status(201).json({ message });
  } catch (err) {
    next(err);
  }
};