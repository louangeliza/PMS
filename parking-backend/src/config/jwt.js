require('dotenv').config();

module.exports = {
  jwt: { 
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  }
};
