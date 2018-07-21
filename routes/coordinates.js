import express from 'express';
import mongoose from 'mongoose';
import Coordinate from '../models/coordinate';

mongoose.connect('mongodb://localhost:27017/iLike');
const coordinates = express.Router();

coordinates
  .route('/')
  .get((req, res) => {
    Coordinate.find({}, (err, data) => {
      if (err) {
        return res.status(404).json(err);
      }
      res.status(200).json(data);
    });
  })
  .post((req, res) => {
    Coordinate.insertMany(req.body, (err, docs) => {
      if (err) {
        return res.status(406).json(err);
      }
      if (docs) {
        res.status(201).json(docs);
      }
    });
  });

export default coordinates;
