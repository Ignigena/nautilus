module.exports = {
  mongo: {
    options: {
      socketOptions: {
        connectionTimeoutMS: 30000,
        keepAlive: 300000,
      },
    },
  },
};
