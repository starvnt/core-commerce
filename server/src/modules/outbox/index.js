module.exports = {
  router: require('./outbox.routes'),
  service: require('./outbox.service'),
  worker: require('./outbox.worker'),
  model: require('./outbox.model'),
};
