import express from 'express';
import mysql from 'mysql';

import Connection from '../constants/Connection';

const friend = express.Router();
let connection;

function handleDisconnect() {
  connection = mysql.createConnection(Connection);

  connection.connect(err => {
    if (err) {
      console.log(err);
      setTimeout(handleDisconnect, 2000);
    } else {
      console.log('friend router connected');
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

friend.route('/:id').get((req, res) => {
  connection.query('SELECT * FROM friend WHERE user_id = ?', [req.params.id], (err, res) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.status(200).json(res);
  });
});

friend.route('/:id').post((req, res) => {
  connection.query('SELECT * FROM user WHERE username = ?', [req.body.username], (err, res) => {
    if (err) {
      return res.status(500).json(err);
    }
    if (res.length < 1) {
      return res.status(404).end();
    }
    
    connection.query('INSERT INTO friend (user_id, friend_id) VALUES (?, ?)', [req.params.id, res[0].id], (err, res) => {
      if (err) {
        return res.status(500).json(err);
      }

      connection.query('SELECT * FROM friend WHERE user_id = ?', [req.params.id], (err, res) => {
        if (err) {
          return res.status(500).json(err);
        }
        res.status(201).json(res);
      });
    });
  });
});

export default friend;
