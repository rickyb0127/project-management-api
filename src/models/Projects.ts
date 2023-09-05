import { model, Schema } from 'mongoose';

const projectsSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  imgUrl: {
    type: String
  },
  description: {
    type: String
  },
  teamMembers: {
    type: Array,
    required: true
  },
  ownerId: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = model('Projects', projectsSchema);