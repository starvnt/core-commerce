module.exports = {
  router: require('./identity.routes'),
  service: require('./identity.service'),
  models: {
    User: require('./user.model'),
    Organization: require('./organization.model'),
  },
};
