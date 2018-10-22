import express from 'express';
import mysql from 'mysql';

import Connection from '../constants/Connection';

const flight = express.Router();
let connection;

function handleDisconnect() {
  connection = mysql.createConnection(Connection);

  connection.connect(err => {
    if (err) {
      console.log(err);
      setTimeout(handleDisconnect, 2000);
    } else {
      console.log('flight router connected');
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

flight.route('/:id').get((req, res) => {
  connection.query('SELECT flight.id, start.id as start_id, start.iata_code as start_code, start.latitude as start_latitude, start.longitude as start_longitude, destination.id as destination_id, destination.iata_code as destination_code, destination.latitude as destination_latitude, destination.longitude as destination_longitude, timestamp FROM `flight` INNER JOIN airport AS start ON start.id = flight.start INNER JOIN airport AS destination ON destination.id = flight.destination WHERE user_id = ?',
  [req.params.id],
  (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.status(200).json(data);
  });
});

export default flight;
