import express from 'express';
import mongoose from 'mongoose';
import User from '../models/user';

mongoose.connect('mongodb://localhost:27017/iLike');
const users = express.Router();

users
  .route('/')
  .get((req, res) => {
    console.log('body:');
    console.log(req.body);
    User.find({}, (err, data) => {
      if (err) {
        return res.status(404).json(err);
      }
      res.status(200).json(data);
    });
  })
  .post((req, res) => {
    console.log('body:');
    console.log(req.body);
    const user = new User(req.body);
    user.save(err => {
      if (err) {
        return res.status(406).json(err);
      }
      User.findById(user.id, (err, data) => {
        if (err) {
          return res.status(404).json(err);
        }
        res.status(200).json(data);
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
