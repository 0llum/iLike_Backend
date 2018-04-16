import mongoose, { Schema } from 'mongoose';
import ListItem from './listItem';

const listSchema = new Schema({
  name: { type: String, required: true },
  image: { type: String },
  color: { type: String },
  count: { type: Number },
  items: [ListItem.schema],
});

export default mongoose.model('list', listSchema);