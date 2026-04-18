const { pgEnum } = require('drizzle-orm/pg-core');

const userRoleEnum = pgEnum('user_role', ['DONOR', 'NGO', 'ADMIN']);
const verificationStatusEnum = pgEnum('verification_status', ['PENDING', 'APPROVED', 'REJECTED']);
const disasterStatusEnum = pgEnum('disaster_status', ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED']);
const disasterSeverityEnum = pgEnum('disaster_severity', ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
const campaignStatusEnum = pgEnum('campaign_status', [
  'DRAFT',
  'PENDING_VERIFICATION',
  'VERIFIED_BY_VOLUNTEERS',
  'PENDING_ADMIN_APPROVAL',
  'PENDING_NGO_VERIFICATION',
  'LIVE',
  'COMPLETED',
  'CANCELLED',
]);
const creationSourceEnum = pgEnum('creation_source', ['DONOR', 'NGO']);
const milestoneStatusEnum = pgEnum('milestone_status', ['PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED']);
const notificationTypeEnum = pgEnum('notification_type', ['INFO', 'WARNING', 'SUCCESS', 'ERROR']);

module.exports = {
  userRoleEnum,
  verificationStatusEnum,
  disasterStatusEnum,
  disasterSeverityEnum,
  campaignStatusEnum,
  creationSourceEnum,
  milestoneStatusEnum,
  notificationTypeEnum,
};
