module.exports = {
    PORT: process.env.PORT || 5000,
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/college-club-management',
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
    JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
    EMAIL_SERVICE: process.env.EMAIL_SERVICE || 'gmail',
    EMAIL_USER: process.env.EMAIL_USER || 'your-email@gmail.com',
    EMAIL_PASS: process.env.EMAIL_PASS || 'your-email-password',
    NODE_ENV: process.env.NODE_ENV || 'development'
};