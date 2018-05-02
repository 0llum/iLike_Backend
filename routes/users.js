import express from 'express';
import mongoose from 'mongoose';
import User from '../models/user';

mongoose.connect('mongodb://localhost:27017/iLike');
const users = express.Router();

users
  .route('/')
  .get((req, res) => {
    User.find({}, (err, data) => {
      if (err) {
        return res.status(404).json(err);
      }
      res.status(200).json(data);
    });
  })
  .post((req, res) => {
    const user = new User(req.body);
    User.findOne({ email: req.body.email }, (err, user) => {
      if (!err) {
        return res.status(403).json(err);
      }
    });
    user.save(err => {
      if (err) {
        return res.status(406).json(err);
      }
      User.findById(user.id, (err, data) => {
        if (err) {
          return res.status(404).json(err);
        }
        res.status(201).json(data);
      });
    });
  });

users.route('/login').post((req, res) => {
  const user = new User(req.body);
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) {
      return res.status(404).json(err);
    }
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (err) {
        return res.status(401).json(err);
      }
      if (!isMatch) {
        return res.status(401).json(err);
      }
      res.status(200).json(user);
    });
  });
});

users.route('/:id').get((req, res) => {
  User.findById(req.params.id, (err, data) => {
    if (err) {
      return res.status(404).json(err);
    }
    if (!data) {
      return res.status(404).end();
    }
    res.status(200).json(data);
  });
});

export default users;
