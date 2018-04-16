import mongoose, { Schema } from 'mongoose';
import ListItemMatch from './listItemMatch';

const listItemSchema = new Schema({
  name: { type: String, required: true },
  image: { type: String },
  color: { type: String },
  count: { type: Number, default: 0, min: 0 },
  picks: { type: Number, default: 0, min: 0 },
  matches: [ListItemMatch.schema],
});

export default mongoose.model('listItem', listItemSchema);