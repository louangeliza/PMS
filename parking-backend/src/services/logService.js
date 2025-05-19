const Log = require('../models/Log');

const logAction = async (userId, action, details = null) => {
  try {
    await Log.create({
      user: userId,
      action,
      details
    });
  } catch (err) {
    console.error('Error logging action:', err);
  }
};

module.exports = { logAction };