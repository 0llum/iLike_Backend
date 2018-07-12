import mongoose, { Schema } from 'mongoose';

const coordinateSchema = new Schema({
  latitude: { type: Number },
  longitude: { type: Number },
});

export default mongoose.model('coordinate', coordinateSchema);
