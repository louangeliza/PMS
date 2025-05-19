const db = require('../config/db');

const logAction = async (userId, action, details = null) => {
  try {
    await db.query(
      'INSERT INTO logs (user_id, action, details) VALUES ($1, $2, $3)',
      [userId, action, details]
    );
  } catch (err) {
    console.error('Error logging action:', err);
  }
};

module.exports = { logAction };
