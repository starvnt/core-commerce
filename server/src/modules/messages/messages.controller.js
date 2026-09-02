const svc = require('./messages.service');

async function send(req, res) {
  const msg = await svc.send({
    threadId: req.body.threadId,
    threadType: req.body.threadType,
    senderType: req.body.senderType || 'CUSTOMER',
    senderId: req.user ? req.user.userId : req.body.senderId,
    body: req.body.body,
    attachments: req.body.attachments,
    organizationId: req.body.organizationId || (req.user ? req.user.organizationId : null),
  });
  res.status(201).json({ success: true, data: msg });
}

async function listThread(req, res) {
  const items = await svc.listThread(req.params.threadId, {
    limit: Number(req.query.limit) || 50,
    before: req.query.before || null,
  });
  res.json({ success: true, data: items });
}

async function markRead(req, res) {
  const result = await svc.markRead(req.params.threadId, req.user.userId);
  res.json({ success: true, data: result });
}

async function listForCustomer(req, res) {
  const items = await svc.listThreadsForCustomer(req.params.customerId);
  res.json({ success: true, data: items });
}

module.exports = { send, listThread, markRead, listForCustomer };
