import mongoose, { Schema } from 'mongoose';

const listItemMatchSchema = new Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
  name: { type: String },
  image: { type: String },
  color: { type: String },
  count: { type: Number, default: 0, min: 0 },
  picks: { type: Number, default: 0, min: 0 },
});

const listItemSchema = new Schema({
  name: { type: String, required: true },
  image: { type: String },
  color: { type: String },
  count: { type: Number, default: 0, min: 0 },
  picks: { type: Number, default: 0, min: 0 },
  matches: [listItemMatchSchema],
});

const listSchema = new Schema({
  name: { type: String, required: true },
  image: { type: String },
  color: { type: String },
  count: { type: Number },
  items: [listItemSchema],
});

export default mongoose.model('list', listSchema);
