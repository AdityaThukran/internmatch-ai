require('dotenv').config();

const config = {
  port: process.env.PORT || 5000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/internship_finder',
  jwtSecret: process.env.JWT_SECRET || 'default_jwt_secret_change_me',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  emailHost: process.env.EMAIL_HOST || 'smtp.ethereal.email',
  emailPort: parseInt(process.env.EMAIL_PORT, 10) || 587,
  emailUser: process.env.EMAIL_USER || '',
  emailPass: process.env.EMAIL_PASS || '',
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
};

module.exports = config;
