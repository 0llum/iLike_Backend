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

flight.route('/').get((req, res) => {
  connection.query('SELECT * FROM flight WHERE user_id = ?', [req.params.id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.status(200).json(data);
  });
});

export default flight;
