import express from 'express';
import mongoose from 'mongoose';
import Coordinate from '../models/coordinate';
import * as EarthUtils from '../utils/EarthUtils';

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

coordinates
  .route('/generate')
  .get((req, res) => {
    generateCoordinates(90);
  });

function generateCoordinates(lat) {
  if (lat < -89) {
    return;
  }

  const coordinates = [];
  for (let lon = 0; lon < 360; lon += EarthUtils.gridDistanceAtLatitude(lat)) {
    const latitude = EarthUtils.getRoundedLatitude(lat);
    const longitude = lon > 180 ? EarthUtils.getRoundedLongitude(lon - 360, lat) : EarthUtils.getRoundedLongitude(lon, lat);
    // if (!Object.is(longitude, -0)) {
    coordinates.push({ latitude, longitude });
    // }
  }

  Coordinate.insertMany(coordinates, (err, docs) => {
    console.log(lat);
    if (docs) {
      generateCoordinates(lat - EarthUtils.GRID_DISTANCE);
    }
  });
}

export default coordinates;
