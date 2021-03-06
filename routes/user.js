import express from 'express';
import mysql from 'mysql';
import bcrypt from 'bcrypt';

import Connection from '../constants/Connection';

const SALT_WORK_FACTOR = 10;
const user = express.Router();
let connection;

function handleDisconnect() {
  connection = mysql.createConnection(Connection);

  connection.connect((err) => {
    if (err) {
      console.log(err);
      setTimeout(handleDisconnect, 2000);
    } else {
      console.log('user router connected');
    }
  });

  connection.on('error', (err) => {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect();
    } else {
      throw err;
    }
  });
}

handleDisconnect();

user.route('/').get((req, res) => {
  connection.query('SELECT * FROM user', (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }
    if (data.length < 1) {
      return res.status(404).end();
    }
    res.status(200).json(data);
  });
});

user.route('/').post((req, res) => {
  bcrypt.hash(req.body.password, SALT_WORK_FACTOR, (err, hash) => {
    if (err) {
      return res.status(500).json(err);
    }
    connection.query(
      'INSERT INTO user (email, password, username) VALUES (?, ?, ?)',
      [req.body.email, hash, req.body.username],
      (err, data) => {
        if (err) {
          return res.status(500).end();
        }
        connection.query('SELECT * FROM user WHERE id = ?', [data.insertId], (err, user) => {
          if (err) {
            return res.status(500).json(err);
          }
          if (user.length < 1) {
            return res.status(404).end();
          }
          res.status(201).json(user[0]);
        });
      },
    );
  });
});

user.route('/:id').get((req, res) => {
  connection.query('SELECT * FROM user WHERE id = ?', [req.params.id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }
    if (data.length < 1) {
      return res.status(404).end();
    }
    res.status(200).json(data[0]);
  });
});

user.route('/:id').post((req, res) => {
  connection.query(
    'UPDATE user SET push_token = ? WHERE id = ?',
    [req.body.pushToken, req.params.id],
    (err, token) => {
      if (err) {
        console.log(err);
      }
      res.status(200).end();
    },
  );
});

user.route('/:id/tile').post((req, res) => {
  connection.query(
    'UPDATE user SET latitude = ?, longitude = ? WHERE id = ?',
    [req.body.latitude, req.body.longitude, req.params.id],
    (err, token) => {
      if (err) {
        console.log(err);
      }
      res.status(200).end();
    },
  );
});

export default user;
