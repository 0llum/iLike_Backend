import mongoose, { Schema } from 'mongoose';

const listItemMatchSchema = new Schema({
  count: { type: Number, default: 0, min: 0 },
  picks: { type: Number, default: 0, min: 0 },
});

export default mongoose.model('listItemMatch', listItemMatchSchema);