const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    action: { type: String, required: true }, // Description of the action
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // ID of the user who performed the action
    timestamp: { type: Date, default: Date.now }, // Time the action occurred
    details: { type: String, default: '' }, // Additional details about the action
});
const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;
