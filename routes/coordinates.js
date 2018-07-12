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
    const coordinate = new Coordinate(req.body);
    coordinate.save(err => {
      if (err) {
        return res.status(406).json(err);
      }
      Coordinate.findById(coordinate.id, (err, data) => {
        if (err) {
          return res.status(404).json(err);
        }
        res.status(201).json(data);
      });
    });
  });
