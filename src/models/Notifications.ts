import { model, Schema } from 'mongoose';

const notificationsSchema = new Schema({
  message: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  projectId: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = model('Notifications', notificationsSchema);