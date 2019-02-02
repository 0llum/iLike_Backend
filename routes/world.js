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

const generateCoordinates = (lat = 90) => {
  if (lat <= 89.99) {
    console.log('done');
    return;
  }

  const tiles = [];
  const latitude = GeoLocation.getRoundedLatitude(lat);
  const gridDistanceAtLatitude = GeoLocation.gridDistanceAtLatitude(latitude);

  for (let lng = 0; lng < 360; lng += gridDistanceAtLatitude) {
    let temp = lng;
    if (temp > 180) {
      temp -= 360;
    }
    const longitude = GeoLocation.getRoundedLongitude(temp, latitude);
    console.log(latitude, longitude);
    if (!(longitude == 0 || tiles.length > 0)) {
      tiles.push([latitude, longitude]);
    }
  }

  connection.query('INSERT INTO world (latitude, longitude) VALUES ?', [tiles], (err) => {
    if (err) console.log(err);
    generateCoordinates(latitude - Earth.GRID_DISTANCE);
  });
};

world.route('/generate/all').get(() => {
  console.log('start generating coordinates');
  generateCoordinates();
});

export default world;
