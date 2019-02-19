import express from 'express';
import mysql from 'mysql';
import bcrypt from 'bcrypt';

import Connection from '../constants/Connection';

const SALT_WORK_FACTOR = 10;

const login = express.Router();
let connection;

function handleDisconnect() {
  connection = mysql.createConnection(Connection);

  connection.connect((err) => {
    if (err) {
      console.log(err);
      setTimeout(handleDisconnect, 2000);
    } else {
      console.log('login router connected');
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

login.route('/').post((req, res) => {
  connection.query('SELECT * FROM user WHERE email = ?', [req.body.email], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }
    if (data.length < 1) {
      return res.status(404).end();
    }

    const user = data[0];
    bcrypt.compare(req.body.password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).json(err);
      }
      if (!isMatch) {
        return res.status(401).end();
      }

      if (req.body.pushToken) {
        connection.query(
          'UPDATE user SET push_token = ? WHERE id = ?',
          [req.body.pushToken, user.id],
          (err, token) => {
            if (err) {
              console.log(err);
            }
          },
        );
      }

      connection.query(
        'SELECT * FROM location2 WHERE user_id = ? ORDER BY latitude DESC, longitude ASC',
        [user.id],
        (err, locations) => {
          if (err) {
            return res.status(500).json(err);
          }
          user.locations = locations;
          res.status(200).json(user);
        },
      );
    });
  });
});

export default login;
