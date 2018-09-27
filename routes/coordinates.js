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
    generateCoordinates(90);
  });
});

const generateCoordinates = function(lat) {
  if (lat < 89) {
    return;
  }

  const locations = [];
  for (let lon = 0; lon < 360; lon += EarthUtils.gridDistanceAtLatitude(lat)) {
    const latitude = EarthUtils.getRoundedLatitude(lat);
    const longitude =
      lon > 180
        ? EarthUtils.getRoundedLongitude(lon - 360, lat)
        : EarthUtils.getRoundedLongitude(lon, lat);

    connection.query(
      'INSERT INTO coordinates (coordinate) VALUES ?',
      ['GeomFromText(POINT(' + latitude + ' ' + longitude + '))'],
      (err, data) => {
        // if (err) {
        //   console.log(err);
        // }
        // console.log(data);
        generateCoordinates(lat - Earth.GRID_DISTANCE);
      },
    );
    // if (!Object.is(longitude, -0)) {
    // locations.push(`ST_GeomFromText(POINT(${latitude} ${longitude}))`);
    // }
  }

  // Coordinate.insertMany(coordinates, (err, docs) => {
  // if (err) {
  //   console.log(err);
  // }
  // if (docs) {
  //   generateCoordinates(lat - Earth.GRID_DISTANCE);
  // }
  //   generateCoordinates(lat - Earth.GRID_DISTANCE);
  // });
  // };
};

export default coordinates;
