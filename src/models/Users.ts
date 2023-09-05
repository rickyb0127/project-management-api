import { model, Schema } from 'mongoose';

const usersSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  imgUrl: {
    type: String
  },
  settings: {
    type: Map
  }
}, {
  timestamps: true
});

module.exports = model('Users', usersSchema);