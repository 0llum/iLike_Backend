import express from 'express';
import mongoose from 'mongoose';
import Coordinate from '../models/coordinate';
import * as EarthUtils from '../utils/EarthUtils';
import * as Earth from '../constants/Earth';

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Olli9989',
  database: 'whib',
});

const coordinates = express.Router();

connection.connect(err => {
  if (err) {
    throw err;
  }
  console.log('connected');

  coordinates
    .route('/')
    .get((req, res) => {
      connection.query('SELECT * FROM coordinates', (err, data) => {
        if (err) {
          return res.status(404).json(err);
        }
        res.status(200).json(data);
      });
    })

  coordinates.route('/generate').get((req, res) => {
    generateCoordinates(90);
  });

  let generateCoordinates = function(lat) {
    console.log(lat);
    if (lat < 89) {
      return;
    }

    const locations = [];
    for (let lon = 6; lon < 15; lon += EarthUtils.gridDistanceAtLatitude(lat)) {
      const latitude = EarthUtils.getRoundedLatitude(lat);
      const longitude =
        lon > 180
          ? EarthUtils.getRoundedLongitude(lon - 360, lat)
          : EarthUtils.getRoundedLongitude(lon, lat);
      // if (!Object.is(longitude, -0)) {
        locations.push(`POINT(${latitude}, ${longitude})`);
      // }
    }

    connection.query(
      'INSERT INTO user (email, password, username) VALUES (?)',
      locations,
      (err, data) => {
        generateCoordinates(lat - Earth.GRID_DISTANCE);
      });
      // Coordinate.insertMany(coordinates, (err, docs) => {
        // if (err) {
        //   console.log(err);
        // }
        // if (docs) {
        //   generateCoordinates(lat - Earth.GRID_DISTANCE);
        // }
      generateCoordinates(lat - Earth.GRID_DISTANCE);
    });
  };
};

export default coordinates;
