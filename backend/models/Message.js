import mongoose, { Schema } from 'mongoose';

const MessageSchema = new Schema({
  userAuth0Id: { type: String, index: true, required: true },
  email: { type: String },
  name: { type: String },
  subject: { type: String },
  message: { type: String, required: true },
}, { timestamps: true });

export const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);


