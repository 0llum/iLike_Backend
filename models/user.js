import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
const SALT_WORK_FACTOR = 10;

const userMatchSchema = new Schema({
  matchId: { type: mongoose.Schema.Types.ObjectId, required: true },
  picks: { type: Number, default: 0, min: 0 },
});

const locationSchema = new Schema({
  latitude: { type: Number },
  longitude: { type: Number },
  timestamp: { type: Number },
});

locationSchema.index({ latitude: 1, longitude: 1 }, { unique: true });

const userSchema = new Schema({
  email: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true },
  matches: [userMatchSchema],
  locations: [locationSchema],
});

userSchema.pre('save', function(next) {
  const user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();

  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) {
      return next(err);
    }

    // hash the password using our new salt
    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) {
        return next(err);
      }

      // override the cleartext password with the hashed one
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};

export default mongoose.model('user', userSchema);
