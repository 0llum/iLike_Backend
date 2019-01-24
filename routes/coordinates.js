import express from 'express';
import mysql from 'mysql';
import mongoose from 'mongoose';
import User from '../models/user';
import GeoLocation from '../model/GeoLocation';
import * as Earth from '../constants/Earth';

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Olli9989',
  database: 'whib',
});

// mongoose.connect('mongodb://localhost:27017/iLike');

// const users = express.Router();
const coordinates = express.Router();

connection.connect(err => {
  if (err) {
    throw err;
  }

  console.log('coordinates router connected');

  // coordinates.route('/').get((req, res) => {
  //   connection.query('SELECT * FROM coordinates', (err, data) => {
  //     if (err) {
  //       return res.status(404).json(err);
  //     }
  //     res.status(200).json(data);
  //   });
  // });

  // coordinates.route('/:id').get((req, res) => {
  //   connection.query('SELECT * FROM location WHERE user_id = ?', [req.params.id], (err, data) => {
  //     if (err) {
  //       return res.status(404).json(err);
  //     }
  //     res.status(200).json(data);
  //   });
  // });

  // coordinates.route('/transition/:oldId/:newId').get((req, res) => {
  //   User.findById(req.params.oldId, (err, data) => {
  //     if (err) {
  //       return res.status(404).json(err);
  //     }
  //     if (!data) {
  //       return res.status(404).end();
  //     }
  //     const locations = data.locations;
  //     const newLocations = locations.map(x => [
  //       req.params.newId,
  //       x.latitude,
  //       x.longitude,
  //       x.timestamp,
  //     ]);

  //     connection.query(
  //       'INSERT INTO location (user_id, latitude, longitude, timestamp) VALUES ?',
  //       [newLocations],
  //       (err, data) => {
  //         if (err) console.log(err);
  //         console.log('done');
  //         res.status(200).end();
  //       },
  //     );
  //   });
  // });

  coordinates.route('/generate').get((req, res) => {
    console.log('start generating coordinates');
    generateCoordinates(55, 6);
    // for (let y = 14; y > 13; y -= Earth.GRID_DISTANCE) {
    //   const latitude = GeoLocation.getRoundedLatitude(y);
    //   for (let x = 0; x < 360; x += GeoLocation.gridDistanceAtLatitude(latitude)) {
    //     const longitude =
    //       x > 180
    //         ? GeoLocation.getRoundedLongitude(x - 360, latitude)
    //         : GeoLocation.getRoundedLongitude(x, latitude);
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
  const latitude = GeoLocation.getRoundedLatitude(lat);
  const longitude =
    long > 180
      ? GeoLocation.getRoundedLongitude(long - 360, latitude)
      : GeoLocation.getRoundedLongitude(long, latitude);

  if (latitude < 47) {
    console.log('done');
    return;
  }

  if (long >= 15) {
    generateCoordinates(latitude - Earth.GRID_DISTANCE, 6);
    return;
  }

  // connection.query(
  //   'INSERT INTO coordinates SET coordinate = GeomFromText(?)',
  //   ['POINT(' + longitude + ' ' + latitude + ')'],
  //   (err, data) => {
  //     generateCoordinates(latitude, long + GeoLocation.gridDistanceAtLatitude(latitude));
  //   },
  // );

  connection.query(
    'INSERT INTO coordinate (latitude, longitude) VALUES (?, ?)',
    [latitude, longitude],
    (err, data) => {
      if (err) console.log(err);
      console.log(latitude, longitude);
      generateCoordinates(latitude, longitude + GeoLocation.gridDistanceAtLatitude(latitude));
    },
  );
};

export default coordinates;
