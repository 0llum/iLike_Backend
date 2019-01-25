import express from 'express';
import mysql from 'mysql';

import Connection from '../constants/Connection';
import GeoLocation from '../model/GeoLocation';
import * as Earth from '../constants/Earth';

const world = express.Router();
let connection;

function handleDisconnect() {
  connection = mysql.createConnection(Connection);

  connection.connect(err => {
    if (err) {
      console.log(err);
      setTimeout(handleDisconnect, 2000);
    } else {
      console.log('world router connected');
    }
  });

  connection.on('error', err => {
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
    res.status(200).json(data);
  });
});

world.route('/').post((req, res) => {
  const locations = req.body.locations.map(x => {
    const roundedLocation = GeoLocation.getRoundedLocation(x, Earth.NEW_GRID_DISTANCE);
    return [roundedLocation.latitude, roundedLocation.longitude];
  });

  connection.query(
    'INSERT INTO world (latitude, longitude) VALUES ?',
    [locations],
    (err, data) => {
      if (err) {
        console.log(err);
      }

      res.status(201).end();
    }
  );
});

world.route('/:id').get((req, res) => {
  connection.query(
    'SELECT * FROM world WHERE id = ?',
    [req.params.id],
    (err, data) => {
      if (err) {
        return res.status(500).json(err);
      }
      res.status(200).json(data);
    },
  );
});

export default world;
