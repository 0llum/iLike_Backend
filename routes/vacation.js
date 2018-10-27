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
  connection.query(
    'SELECT C.*, V.status FROM (SELECT * FROM country) AS C LEFT JOIN (SELECT * FROM `vacation` WHERE user_id = ?) AS V ON C.id = V.country_id',
    [req.params.id],
    (err, data) => {
      if (err) {
        return res.status(500).json(err);
      }
      res.status(200).json(data);
    },
  );
});

vacation.route('/:id').post((req, res) => {
  connection.query(
    'INSERT INTO vacation (user_id, country_id, status) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE user_id = ?, country_id = ?, status = ?',
    [
      parseInt(req.params.id),
      req.body.countryId,
      req.body.status,
      parseInt(req.params.id),
      req.body.countryId,
      req.body.status,
    ],
    (err, data) => {
      if (err) {
        return res.status(500).json(err);
      }
      res.status(201).json(data);
    },
  );
});

export default vacation;
