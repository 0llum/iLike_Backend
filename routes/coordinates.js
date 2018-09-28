import express from 'express';
import mysql from 'mysql';
import mongoose from 'mongoose';
import User from '../models/user';
import * as EarthUtils from '../utils/EarthUtils';
import * as Earth from '../constants/Earth';

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Olli9989',
  database: 'whib',
});

mongoose.connect('mongodb://localhost:27017/iLike');

const users = express.Router();
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

  coordinates.route('/transition/:oldId/:newId').get((req, res) => {
    User.findById(req.params.oldId, (err, data) => {
      if (err) {
        return res.status(404).json(err);
      }
      if (!data) {
        return res.status(404).end();
      }
      const locations = data.locations;
      const newLocations = locations.map(x => [1, x.latitude, x.longitude, x.timestamp]);

      connection.query(
        'INSERT INTO locations (user_id, latitude, longitude, timestamp) VALUES ?',
        [newLocations],
        (err, data) => {
          if (err) throw err;
          console.log('done');
          res.status(200).end();
        },
      );
    });
  });

  coordinates.route('/generate').get((req, res) => {
    generateCoordinates(55, 6);
    // for (let y = 14; y > 13; y -= Earth.GRID_DISTANCE) {
    //   const latitude = EarthUtils.getRoundedLatitude(y);
    //   for (let x = 0; x < 360; x += EarthUtils.gridDistanceAtLatitude(latitude)) {
    //     const longitude =
    //       x > 180
    //         ? EarthUtils.getRoundedLongitude(x - 360, latitude)
    //         : EarthUtils.getRoundedLongitude(x, latitude);
    //     if (!Object.is(longitude, -0)) {
    //       connection.query(
    //         'INSERT INTO coordinates SET coordinate = GeomFromText(?)',
    //         ['POINT(' + longitude + ' ' + latitude + ')'],
    //         (err, data) => {
    //           if (err) console.log(err);
    //         },
    //       );
    //       connection.query(
    //         'INSERT INTO locations (latitude, longitude) VALUES (?, ?)',
    //         [latitude, longitude],
    //         (err, data) => {
    //           if (err) console.log(err);
    //           console.log(latitude, longitude);
    //         },
    //       );
    //     }
    //   }
    // }
  });
});

const generateCoordinates = function(lat, long) {
  const latitude = EarthUtils.getRoundedLatitude(lat);
  const longitude =
    long > 180
      ? EarthUtils.getRoundedLongitude(long - 360, latitude)
      : EarthUtils.getRoundedLongitude(long, latitude);

  if (latitude < 47) {
    console.log('done');
    return;
  }

  if (long >= 15) {
    generateCoordinates(latitude - Earth.GRID_DISTANCE, 6);
    return;
  }

  connection.query(
    'INSERT INTO coordinates SET coordinate = GeomFromText(?)',
    ['POINT(' + longitude + ' ' + latitude + ')'],
    (err, data) => {
      generateCoordinates(latitude, long + EarthUtils.gridDistanceAtLatitude(latitude));
    },
  );

  connection.query(
    'INSERT INTO locations (latitude, longitude) VALUES (?, ?)',
    [latitude, longitude],
    (err, data) => {
      if (err) console.log(err);
      console.log(latitude, longitude);
    },
  );
};

export default coordinates;
