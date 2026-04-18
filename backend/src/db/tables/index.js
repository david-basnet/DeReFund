/**
 * Aggregates all Drizzle table definitions and enums for the app and drizzle-kit.
 */
const {
  userRoleEnum,
  verificationStatusEnum,
  disasterStatusEnum,
  disasterSeverityEnum,
  campaignStatusEnum,
  creationSourceEnum,
  milestoneStatusEnum,
  notificationTypeEnum,
} = require('./enums');
const { users } = require('./users');
const { userVerification } = require('./userVerification');
const { disasterCases } = require('./disasterCases');
const { campaigns } = require('./campaigns');
const { donations } = require('./donations');
const { milestones } = require('./milestones');
const { volunteerVerifications } = require('./volunteerVerifications');
const { adminLogs } = require('./adminLogs');
const { notifications } = require('./notifications');

module.exports = {
  userRoleEnum,
  verificationStatusEnum,
  disasterStatusEnum,
  disasterSeverityEnum,
  campaignStatusEnum,
  creationSourceEnum,
  milestoneStatusEnum,
  notificationTypeEnum,
  users,
  userVerification,
  disasterCases,
  campaigns,
  donations,
  milestones,
  volunteerVerifications,
  adminLogs,
  notifications,
};
