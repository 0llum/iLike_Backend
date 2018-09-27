import express from 'express';
import mysql from 'mysql';
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

  coordinates.route('/').get((req, res) => {
    connection.query('SELECT * FROM coordinates', (err, data) => {
      if (err) {
        return res.status(404).json(err);
      }
      res.status(200).json(data);
    });
  });

  coordinates.route('/generate').get((req, res) => {
    generateCoordinates(90, 0);
  });
});

const generateCoordinates = function(lat, long) {
  console.log(lat, long);
  const latitude = EarthUtils.getRoundedLatitude(lat);
  const longitude =
    long > 180
      ? EarthUtils.getRoundedLongitude(long - 360, latitude)
      : EarthUtils.getRoundedLongitude(long, latitude);

  if (latitude < 89.99) {
    console.log('done');
    return;
  }

  if (long >= 360) {
    generateCoordinates(latitude - Earth.GRID_DISTANCE, 0);
    return;
  }

  connection.query(
    'INSERT INTO coordinates SET coordinate = GeomFromText(?)',
    ['POINT(' + longitude + ' ' + latitude + ')'],
    (err, data) => {
      generateCoordinates(latitude, long + Earth.GRID_DISTANCE * 100);
    },
  );
};

export default coordinates;
