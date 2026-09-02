const { v4: uuidv4 } = require('uuid');
const Document = require('./document.model');
const { HttpError } = require('../../middleware/errorHandler');
const audit = require('../audit/audit.service');
const outbox = require('../outbox/outbox.service');

const STATUS_TRANSITIONS = {
  DRAFT: ['SENT', 'ARCHIVED'],
  SENT: ['VIEWED', 'SIGNED', 'REJECTED', 'ARCHIVED'],
  VIEWED: ['SIGNED', 'REJECTED', 'ARCHIVED'],
  SIGNED: ['ARCHIVED'],
  REJECTED: ['DRAFT', 'ARCHIVED'],
  ARCHIVED: [],
};

function newDocumentId() {
  return `DOC-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 4).toUpperCase()}`;
}

async function create({ customerId = null, bookingId = null, inquiryId = null, quoteId = null, type = 'OTHER', title, description = '', fileUrl = '', mimeType = 'application/pdf', fileSizeBytes = 0, organizationId = null, uploadedBy = null, metadata = {} }) {
  if (!title) throw new HttpError(400, 'title required', 'VALIDATION_ERROR');
  const doc = await Document.create({
    documentId: newDocumentId(),
    customerId, bookingId, inquiryId, quoteId,
    type, title, description, fileUrl, mimeType, fileSizeBytes,
    organizationId, uploadedBy, metadata,
  });
  await outbox.emit({
    eventName: 'document.created',
    eventType: 'DOCUMENT',
    entityType: 'DOCUMENT',
    entityId: doc.documentId,
    organizationId,
    payload: { type, title, customerId, bookingId, inquiryId, quoteId },
  });
  await audit.record({
    entityType: 'DOCUMENT', entityId: doc.documentId, action: 'CREATE',
    changedBy: uploadedBy, organizationId,
  });
  return doc;
}

async function list(filter = {}, { limit = 50 } = {}) {
  return Document.find(filter).sort({ createdAt: -1 }).limit(limit);
}

async function listForCustomer(customerId, { limit = 50 } = {}) {
  return Document.find({ customerId }).sort({ createdAt: -1 }).limit(limit);
}

async function get(id) {
  const doc = await Document.findOne({ documentId: id });
  if (!doc) throw new HttpError(404, 'Document not found');
  return doc;
}

async function updateStatus(id, newStatus, actorId = null) {
  const doc = await get(id);
  const allowed = STATUS_TRANSITIONS[doc.status] || [];
  if (!allowed.includes(newStatus)) {
    throw new HttpError(400, `Cannot transition document from ${doc.status} to ${newStatus}`, 'INVALID_TRANSITION');
  }
  const prev = doc.status;
  doc.status = newStatus;
  if (newStatus === 'SIGNED') doc.signedAt = new Date();
  await doc.save();
  await audit.record({
    entityType: 'DOCUMENT', entityId: id, action: 'STATUS_CHANGE',
    changedBy: actorId, organizationId: doc.organizationId,
    previousValue: prev, newValue: newStatus,
  });
  return doc;
}

async function remove(id, actorId = null) {
  const doc = await get(id);
  await Document.deleteOne({ documentId: id });
  await audit.record({
    entityType: 'DOCUMENT', entityId: id, action: 'DELETE',
    changedBy: actorId, organizationId: doc.organizationId,
  });
  return { ok: true };
}

module.exports = {
  create, list, listForCustomer, get, updateStatus, remove,
  STATUS_TRANSITIONS,
};
