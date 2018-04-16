import mongoose, { Schema } from 'mongoose';

const listMatchSchema = new Schema({
  itemId: { type: String, required: true },
  count: { type: Number, default: 0, min: 0 },
  picks: { type: Number, default: 0, min: 0 },
});

const listItemSchema = new Schema({
  name: { type: String, required: true },
  image: { type: String },
  color: { type: String },
  count: { type: Number, default: 0, min: 0 },
  picks: { type: Number, default: 0, min: 0 },
  matches: [listMatchSchema],
});

const listSchema = new Schema({
  name: { type: String, required: true },
  image: { type: String },
  color: { type: String },
  count: { type: Number },
  items: [listItemSchema],
});

export default mongoose.model('list', listSchema);