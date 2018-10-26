import express from 'express';
import mysql from 'mysql';

import Connection from '../constants/Connection';

const vacation = express.Router();
let connection;

function handleDisconnect() {
  connection = mysql.createConnection(Connection);

  connection.connect(err => {
    if (err) {
      console.log(err);
      setTimeout(handleDisconnect, 2000);
    } else {
      console.log('vacation router connected');
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

vacation.route('/:id').get((req, res) => {
  connection.query('SELECT * FROM `country LEFT JOIN vacation ON country.id = vacation.country_id WHERE user_id = ? OR user_id IS NULL ORDER BY name ASC',
  [req.params.id],
  (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.status(200).json(data);
  });
});

export defaul vacation;
