import mongoose, { Schema } from 'mongoose';

const coordinateSchema = new Schema({
  latitude: { type: Number },
  longitude: { type: Number },
});

//coordinateSchema.index({ latitude: 1, longitude: 1 }, { unique: true });

export default mongoose.model('coordinate', coordinateSchema);
