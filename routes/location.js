import express from 'express';
import mysql from 'mysql';

import Connection from '../constants/Connection';

const location = express.Router();
let connection;

function handleDisconnect() {
  connection = mysql.createConnection(Connection);

  connection.connect(err => {
    if (err) {
      console.log(err);
      setTimeout(handleDisconnect, 2000);
    } else {
      console.log('location router connected');
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

location.route('/').get((req, res) => {
  console.log('location');
  connection.query('SELECT * FROM location', (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.status(200).json(data);
  });
});

location.route('/:id').get((req, res) => {
  console.log('location', req.params.id);
  connection.query('SELECT * FROM location WHERE user_id = ?', [req.params.id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }

    const locations = {
      id: req.params.id,
      locations: data,
    };
    res.status(200).json(locations);
  });
});

location.route('/:id').post((req, res) => {
  console.log('location', req.body);

  const locations = req.body.locations.map(x => [
    req.params.id,
    x.latitude,
    x.longitude,
    x.timestamp,
  ]);

  connection.query(
    'INSERT INTO location (user_id, latitude, longitude, timestamp) VALUES ?',
    [locations],
    (err, data) => {
      if (err) {
        console.log(err);
      }
      res.status(201).json(locations);
    },
  );
});

export default location;
