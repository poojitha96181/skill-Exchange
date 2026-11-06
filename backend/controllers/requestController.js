import ExchangeRequest from '../models/ExchangeRequest.js';
import Skill from '../models/Skill.js';
import createNotification from '../utils/notify.js';

const populateRequest = (query) =>
  query
    .populate('sender', 'name profilePicture department year')
    .populate('receiver', 'name profilePicture department year')
    .populate('offeredSkill', 'name category level')
    .populate('wantedSkill', 'name category level');

export const createRequest = async (req, res, next) => {
  try {
    const { receiver, offeredSkill, wantedSkill, message } = req.body;
    if (!receiver || !offeredSkill || !wantedSkill) {
      return res.status(400).json({ message: 'Receiver, offered skill and wanted skill are required' });
    }
    if (String(receiver) === String(req.user._id)) {
      return res.status(400).json({ message: 'You cannot send a request to yourself' });
    }
    const offered = await Skill.findById(offeredSkill);
    const wanted = await Skill.findById(wantedSkill);
    if (!offered || String(offered.owner) !== String(req.user._id) || offered.type !== 'offer') {
      return res.status(400).json({ message: 'Offered skill must be one of your offered skills' });
    }
    if (!wanted || String(wanted.owner) !== String(receiver) || wanted.type !== 'offer') {
      return res.status(400).json({ message: 'Wanted skill must be a skill offered by the receiver' });
    }
    const duplicate = await ExchangeRequest.findOne({
      sender: req.user._id,
      receiver,
      offeredSkill,
      wantedSkill,
      status: 'pending',
    });
    if (duplicate) return res.status(400).json({ message: 'A pending request for this exchange already exists' });

    const request = await ExchangeRequest.create({
      sender: req.user._id,
      receiver,
      offeredSkill,
      wantedSkill,
      message,
    });
    await createNotification(req.io, {
      user: receiver,
      type: 'request',
      text: `${req.user.name} sent you a skill exchange request: ${offered.name} for ${wanted.name}`,
      link: '/requests',
    });
    const populated = await populateRequest(ExchangeRequest.findById(request._id));
    res.status(201).json({ request: populated });
  } catch (err) {
    next(err);
  }
};

export const getSentRequests = async (req, res, next) => {
  try {
    const requests = await populateRequest(
      ExchangeRequest.find({ sender: req.user._id }).sort({ createdAt: -1 })
    );
    res.json({ requests });
  } catch (err) {
    next(err);
  }
};

export const getReceivedRequests = async (req, res, next) => {
  try {
    const requests = await populateRequest(
      ExchangeRequest.find({ receiver: req.user._id }).sort({ createdAt: -1 })
    );
    res.json({ requests });
  } catch (err) {
    next(err);
  }
};

const transition = (allowedFrom, newStatus, actorField) => async (req, res, next) => {
  try {
    const request = await ExchangeRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (String(request[actorField]) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You are not allowed to update this request' });
    }
    if (!allowedFrom.includes(request.status)) {
      return res.status(400).json({ message: `Cannot change a ${request.status} request` });
    }
    request.status = newStatus;
    await request.save();

    const otherUser = actorField === 'receiver' ? request.sender : request.receiver;
    const typeMap = {
      accepted: 'request_accepted',
      rejected: 'request_rejected',
      completed: 'request_completed',
      cancelled: 'system',
    };
    await createNotification(req.io, {
      user: otherUser,
      type: typeMap[newStatus],
      text: `${req.user.name} marked your exchange request as ${newStatus}`,
      link: '/requests',
    });
    const populated = await populateRequest(ExchangeRequest.findById(request._id));
    res.json({ request: populated });
  } catch (err) {
    next(err);
  }
};

export const acceptRequest = transition(['pending'], 'accepted', 'receiver');
export const rejectRequest = transition(['pending'], 'rejected', 'receiver');
export const completeRequest = transition(['accepted'], 'completed', 'receiver');
export const cancelRequest = transition(['pending'], 'cancelled', 'sender');