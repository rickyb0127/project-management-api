import { model, Schema } from 'mongoose';

const userStoriesSchema = new Schema({
  projectId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  assigned: {
    type: Array,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  numPoints: {
    type: Number,
    required: true
  },
  authorId: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = model('UserStories', userStoriesSchema);