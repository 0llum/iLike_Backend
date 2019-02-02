import express from 'express';
import mysql from 'mysql';

import Connection from '../constants/Connection';
import GeoLocation from '../model/GeoLocation';
import * as Earth from '../constants/Earth';

const world = express.Router();
let connection;

function handleDisconnect() {
  connection = mysql.createConnection(Connection);

  connection.connect((err) => {
    if (err) {
      console.log(err);
      setTimeout(handleDisconnect, 2000);
    } else {
      console.log('world router connected');
    }
  });

  connection.on('error', (err) => {
    console.log(err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect();
    } else {
      throw err;
    }
  });
}

handleDisconnect();

world.route('/').get((req, res) => {
  connection.query('SELECT * FROM world', (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }
    return res.status(200).json(data);
  });
});

world.route('/').post((req, res) => {
  const locations = req.body.locations.map((x) => {
    const roundedLocation = GeoLocation.getRoundedLocation(x, Earth.GRID_DISTANCE);
    return [roundedLocation.latitude, roundedLocation.longitude];
  });

  connection.query('INSERT INTO world (latitude, longitude) VALUES ?', [locations], (err) => {
    if (err) {
      console.log(err);
    }

    res.status(201).end();
  });
});

world.route('/:id').get((req, res) => {
  connection.query('SELECT * FROM world WHERE id = ?', [req.params.id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }
    return res.status(200).json(data);
  });
});

const generateCoordinates = (lat, long) => {
  const latitude = GeoLocation.getRoundedLatitude(lat);

  if (latitude < -90) {
    console.log('done');
    return;
  }

  if (long >= 180) {
    generateCoordinates(latitude - Earth.GRID_DISTANCE, -180);
    return;
  }

  const longitude = GeoLocation.getRoundedLongitude(long, latitude);

  // connection.query(
  //   'INSERT INTO coordinates SET coordinate = GeomFromText(?)',
  //   ['POINT(' + longitude + ' ' + latitude + ')'],
  //   (err, data) => {
  //     generateCoordinates(latitude, long + GeoLocation.gridDistanceAtLatitude(latitude));
  //   },
  // );

  connection.query(
    'INSERT INTO world (latitude, longitude) VALUES (?, ?)',
    [latitude, longitude],
    (err) => {
      if (err) console.log(err);
      console.log(latitude, longitude);
      generateCoordinates(latitude, longitude + GeoLocation.gridDistanceAtLatitude(latitude));
    },
  );
};

world.route('/generate/all').get(() => {
  console.log('start generating coordinates');

  for (let lat = 90; lat >= -90; lat -= Earth.GRID_DISTANCE) {
    const tiles = [];
    const latitude = GeoLocation.getRoundedLatitude(lat);
    const gridDistanceAtLatitude = GeoLocation.gridDistanceAtLatitude(latitude);
    for (let lng = 0; lng < 360; lng += gridDistanceAtLatitude) {
      if (lng > 180) {
        lng -= 360;
      }
      const longitude = GeoLocation.getRoundedLongitude(lng, latitude);
      tiles.push([latitude, longitude]);
    }

    connection.query('INSERT INTO world (latitude, longitude) VALUES ?', [tiles]);
  }

  // generateCoordinates(90, -180);

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

export default world;
