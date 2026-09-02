const { v4: uuidv4 } = require('uuid');
const Task = require('./task.model');
const { HttpError } = require('../../middleware/errorHandler');
const activity = require('../activity/activity.service');
const audit = require('../audit/audit.service');

function newId() {
  return `TSK-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 4).toUpperCase()}`;
}

async function create(data, actorId = null) {
  if (!data.customerId) throw new HttpError(400, 'customerId is required', 'VALIDATION_ERROR');
  if (!data.title) throw new HttpError(400, 'title is required', 'VALIDATION_ERROR');
  const task = await Task.create({
    taskId: newId(),
    customerId: data.customerId,
    organizationId: data.organizationId || null,
    title: data.title,
    description: data.description || '',
    category: data.category || 'GENERAL',
    priority: data.priority || 'MEDIUM',
    dueDate: data.dueDate || null,
    linkedEntityType: data.linkedEntityType || null,
    linkedEntityId: data.linkedEntityId || null,
    assignedTo: data.assignedTo || null,
  });
  await activity.log({
    entityType: 'TASK',
    entityId: task.taskId,
    actionType: 'TASK_CREATED',
    message: `Task created: ${task.title}`,
    source: 'USER',
    organizationId: task.organizationId,
    createdBy: actorId,
    metadata: { customerId: task.customerId, category: task.category },
  });
  await audit.record({
    entityType: 'TASK',
    entityId: task.taskId,
    action: 'CREATE',
    changedBy: actorId,
    organizationId: task.organizationId,
  });
  return task;
}

async function list({ customerId = null, status = null, organizationId = null, limit = 50 } = {}) {
  const query = {};
  if (customerId) query.customerId = customerId;
  if (status) query.status = status;
  if (organizationId) query.organizationId = organizationId;
  return Task.find(query).sort({ dueDate: 1, priority: -1, createdAt: -1 }).limit(Math.min(limit, 200));
}

async function getById(id) {
  const task = await Task.findOne({ taskId: id });
  if (!task) throw new HttpError(404, 'Task not found');
  return task;
}

async function update(id, updates, actorId = null) {
  const task = await getById(id);
  const allowed = ['title', 'description', 'category', 'priority', 'dueDate', 'assignedTo'];
  for (const key of allowed) {
    if (updates[key] !== undefined) task[key] = updates[key];
  }
  if (updates.status) {
    const from = task.status;
    task.status = updates.status;
    if (updates.status === 'COMPLETED') task.completedAt = new Date();
    await audit.record({
      entityType: 'TASK',
      entityId: id,
      action: 'STATUS_CHANGE',
      field: 'status',
      previousValue: { status: from },
      newValue: { status: task.status },
      changedBy: actorId,
      organizationId: task.organizationId,
    });
    await activity.log({
      entityType: 'TASK',
      entityId: id,
      actionType: 'TASK_STATUS_CHANGED',
      message: `Task ${task.status.toLowerCase()}: ${task.title}`,
      source: 'USER',
      organizationId: task.organizationId,
      createdBy: actorId,
    });
  }
  await task.save();
  return task;
}

async function remove(id, actorId = null) {
  const task = await getById(id);
  await task.deleteOne();
  await audit.record({
    entityType: 'TASK',
    entityId: id,
    action: 'DELETE',
    changedBy: actorId,
    organizationId: task.organizationId,
  });
}

module.exports = { create, list, getById, update, remove };
