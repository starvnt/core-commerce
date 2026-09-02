const { v4: uuidv4 } = require('uuid');
const Notification = require('./notification.model');
const User = require('../identity/user.model');

function newNotificationId() {
  return `NTF-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 4).toUpperCase()}`;
}

async function create({ userId, recipientRole, organizationId = null, type = 'INFO', title, body = '', link = '', metadata = {} }) {
  if (!title) throw new Error('title required');
  // If userId is missing but recipientRole is provided, fan out to all matching users
  if (!userId && recipientRole) {
    const q = { role: recipientRole };
    if (organizationId) q.organizationId = organizationId;
    const users = await User.find(q).limit(100);
    const results = [];
    for (const u of users) {
      results.push(await Notification.create({
        notificationId: newNotificationId(),
        userId: u.userId,
        organizationId,
        type, title, body, link, metadata,
      }));
    }
    return results;
  }
  if (!userId) throw new Error('userId or recipientRole required');
  return Notification.create({
    notificationId: newNotificationId(),
    userId, organizationId, type, title, body, link, metadata,
  });
}

async function list({ userId, unreadOnly = false, limit = 50 } = {}) {
  const q = {};
  if (userId) q.userId = userId;
  if (unreadOnly) q.read = false;
  return Notification.find(q).sort({ createdAt: -1 }).limit(limit);
}

async function markRead(id, userId) {
  return Notification.findOneAndUpdate(
    { notificationId: id, userId },
    { $set: { read: true, readAt: new Date() } },
    { new: true },
  );
}

async function markAllRead(userId) {
  return Notification.updateMany(
    { userId, read: false },
    { $set: { read: true, readAt: new Date() } },
  );
}

async function unreadCount(userId) {
  return Notification.countDocuments({ userId, read: false });
}

module.exports = { create, list, markRead, markAllRead, unreadCount };
