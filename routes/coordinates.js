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
    
  });

generateCoordinates = (lat) => {
  if (lat < -89) {
    return;
  }

  const coordinates = [];
  for (let lon = 0; lon < 360; k += EarthUtils.gridDistanceAtLatitude(lat)) {
    const latitude = EarthUtils.getRoundedLatitude(lat);
    const longitude = lon > 180 ? EarthUtils.getRoundedLongitude(lon - 360, lat) : EarthUtils.getRoundedLongitude(lon, lat);
    // if (!Object.is(longitude, -0)) {
    coordinates.push({ latitude, longitude });
    // }
  }

  fetch('https://api.0llum.de/coordinates', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(coordinates),
  }).then((response) => {
    if (response.status === 201) {
      this.generateCoordinates(lat - EarthUtils.GRID_DISTANCE);
    }
  });
}

export default coordinates;
