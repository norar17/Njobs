import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { detectAttachmentType } from '../middleware/upload.js';
import { isCloudinaryConfigured } from '../config/cloudinary.js';

export const getOrCreateConversation = async (applicationId, userId) => {
  const application = await Application.findById(applicationId).populate({
    path: 'job',
    select: 'title createdBy',
  });

  if (!application) {
    throw { statusCode: 404, message: 'Application not found' };
  }

  const isApplicant = application.applicant.toString() === userId.toString();
  const isEmployer = application.job.createdBy.toString() === userId.toString();

  if (!isApplicant && !isEmployer) {
    throw { statusCode: 403, message: 'You do not have access to this conversation' };
  }

  let conversation = await Conversation.findOne({ application: application._id });

  if (!conversation) {
    conversation = await Conversation.create({
      application: application._id,
      job: application.job._id,
      applicant: application.applicant,
      employer: application.job.createdBy,
    });
  }

  return conversation;
};

const conversationJobPopulate = {
  path: 'job',
  select: 'title company',
  populate: { path: 'company', select: 'companyName logo' },
};

export const getMyConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const isEmployer = req.user.role === 'employer';

  const query = isEmployer ? { employer: userId } : { applicant: userId };

  const conversations = await Conversation.find(query)
    .populate('applicant', 'name avatar')
    .populate('employer', 'name avatar')
    .populate(conversationJobPopulate)
    .sort({ lastMessageAt: -1, updatedAt: -1 });

  res.status(200).json({
    success: true,
    conversations: conversations.map((c) => ({
      ...c.toObject(),
      unreadCount: isEmployer ? c.unreadByEmployer : c.unreadByApplicant,
    })),
  });
});

export const getOrCreateConversationForApplication = asyncHandler(async (req, res) => {
  const { applicationId } = req.params;

  try {
    const conversation = await getOrCreateConversation(applicationId, req.user._id);
    const populated = await Conversation.findById(conversation._id)
      .populate('applicant', 'name avatar')
      .populate('employer', 'name avatar')
      .populate(conversationJobPopulate);

    res.status(200).json({ success: true, conversation: populated });
  } catch (err) {
    res.status(err.statusCode || 500);
    throw new Error(err.message || 'Failed to open conversation');
  }
});

export const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    res.status(404);
    throw new Error('Conversation not found');
  }

  const userId = req.user._id.toString();
  const isParticipant =
    conversation.applicant.toString() === userId || conversation.employer.toString() === userId;

  if (!isParticipant) {
    res.status(403);
    throw new Error('You do not have access to this conversation');
  }

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 50, 1);
  const skip = (pageNum - 1) * limitNum;

  const [messages, total] = await Promise.all([
    Message.find({ conversation: conversationId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('sender', 'name avatar role'),
    Message.countDocuments({ conversation: conversationId }),
  ]);

  const isEmployer = conversation.employer.toString() === userId;
  if (isEmployer) {
    conversation.unreadByEmployer = 0;
  } else {
    conversation.unreadByApplicant = 0;
  }
  await conversation.save();

  await Message.updateMany(
    { conversation: conversationId, sender: { $ne: req.user._id }, readAt: null },
    { readAt: new Date() }
  );

  res.status(200).json({
    success: true,
    messages: messages.reverse(),
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
  });
});

export const sendMessageHttp = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { text } = req.body;

  if (!text || !text.trim()) {
    res.status(400);
    throw new Error('Message text is required');
  }

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    res.status(404);
    throw new Error('Conversation not found');
  }

  const userId = req.user._id.toString();
  const isApplicant = conversation.applicant.toString() === userId;
  const isEmployer = conversation.employer.toString() === userId;

  if (!isApplicant && !isEmployer) {
    res.status(403);
    throw new Error('You do not have access to this conversation');
  }

  const message = await Message.create({
    conversation: conversation._id,
    sender: req.user._id,
    text: text.trim(),
  });

  conversation.lastMessage = text.trim();
  conversation.lastMessageAt = new Date();
  if (isApplicant) {
    conversation.unreadByEmployer += 1;
  } else {
    conversation.unreadByApplicant += 1;
  }
  await conversation.save();

  const populated = await message.populate('sender', 'name avatar role');

  res.status(201).json({ success: true, message: populated });
});

export const uploadAttachmentHttp = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  if (!isCloudinaryConfigured) {
    res.status(503);
    throw new Error('File attachments are not configured on this server.');
  }

  if (!req.file) {
    res.status(400);
    throw new Error('Please select a file to send');
  }

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    res.status(404);
    throw new Error('Conversation not found');
  }

  const userId = req.user._id.toString();
  const isApplicant = conversation.applicant.toString() === userId;
  const isEmployer = conversation.employer.toString() === userId;

  if (!isApplicant && !isEmployer) {
    res.status(403);
    throw new Error('You do not have access to this conversation');
  }

  const fileType = detectAttachmentType(req.file.originalname);

  const attachment = {
    url: req.file.path,
    publicId: req.file.filename,
    fileName: req.file.originalname,
    mimeType: req.file.mimetype,
    fileType,
    size: req.file.size,
  };

  const message = await Message.create({
    conversation: conversation._id,
    sender: req.user._id,
    text: req.body.text ? req.body.text.trim() : '',
    attachments: [attachment],
  });

  conversation.lastMessage = req.body.text?.trim() || `Sent ${fileType === 'document' ? 'a file' : `a ${fileType}`}`;
  conversation.lastMessageAt = new Date();
  if (isApplicant) {
    conversation.unreadByEmployer += 1;
  } else {
    conversation.unreadByApplicant += 1;
  }
  await conversation.save();

  const populated = await message.populate('sender', 'name avatar role');

  res.status(201).json({ success: true, message: populated });
});

export const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const isEmployer = req.user.role === 'employer';

  const query = isEmployer ? { employer: userId } : { applicant: userId };
  const conversations = await Conversation.find(query).select('unreadByApplicant unreadByEmployer');

  const totalUnread = conversations.reduce(
    (sum, c) => sum + (isEmployer ? c.unreadByEmployer : c.unreadByApplicant),
    0
  );

  res.status(200).json({ success: true, totalUnread });
});
