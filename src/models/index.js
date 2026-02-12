const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');

const User = sequelize.define('User', {
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
});

const Otp = sequelize.define('Otp', {
  otpCode: { type: DataTypes.STRING, allowNull: false },
  expiresAt: { type: DataTypes.DATE, allowNull: false },
  consumed: { type: DataTypes.BOOLEAN, defaultValue: false },
});

const Task = sequelize.define('Task', {
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  status: {
    type: DataTypes.ENUM('PENDING', 'IN_PROGRESS', 'DONE'),
    defaultValue: 'PENDING',
  },
});

const RefreshToken = sequelize.define('RefreshToken', {
  token: { type: DataTypes.STRING, allowNull: false },
  expiresAt: { type: DataTypes.DATE, allowNull: false },
  revoked: { type: DataTypes.BOOLEAN, defaultValue: false },
});

const ActivityLog = sequelize.define('ActivityLog', {
  action: { type: DataTypes.STRING, allowNull: false },
  metadata: { type: DataTypes.TEXT },
});

User.hasMany(Otp);
Otp.belongsTo(User);

User.hasMany(Task);
Task.belongsTo(User);

User.hasMany(RefreshToken);
RefreshToken.belongsTo(User);

User.hasMany(ActivityLog);
ActivityLog.belongsTo(User);

module.exports = {
  sequelize,
  User,
  Otp,
  Task,
  RefreshToken,
  ActivityLog,
};
