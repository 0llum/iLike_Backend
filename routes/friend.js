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
  connection.query(
    'SELECT user.id, user.username, COUNT(location2.id) AS locations FROM user INNER JOIN friend ON friend.friend_id = user.id INNER JOIN location2 ON location2.user_id = friend.friend_id WHERE friend.user_id = ? GROUP BY location2.user_id ORDER BY user.username',
    [req.params.id],
    (err, data) => {
      if (err) {
        return res.status(500).json(err);
      }
      res.status(200).json(data);
    },
  );
});

friend.route('/:id').post((req, res) => {
  connection.query(
    'SELECT * FROM user WHERE username = ?',
    [req.body.friendName],
    (err, friend) => {
      if (err) {
        return res.status(500).json(err);
      }
      if (friend.length < 1) {
        return res.status(404).end();
      }

      if (friend[0].id == req.params.id) {
        return res.status(406).end();
      }

      connection.query(
        'INSERT INTO friend (user_id, friend_id) VALUES (?, ?)',
        [req.params.id, friend[0].id],
        (err, data) => {
          if (err) {
            return res.status(500).json(err);
          }

          connection.query(
            'INSERT INTO friend (user_id, friend_id) VALUES (?, ?)',
            [friend[0].id, req.params.id],
            (err, data) => {
              if (err) {
                return res.status(500).json(err);
              }

              connection.query(
                'SELECT user.id, user.username, COUNT(location2.id) AS locations FROM user INNER JOIN friend ON friend.friend_id = user.id INNER JOIN location2 ON location2.user_id = friend.friend_id WHERE friend.user_id = ? GROUP BY location2.user_id ORDER BY user.username',
                [req.params.id],
                (err, data) => {
                  if (err) {
                    return res.status(500).json(err);
                  }
                  res.status(201).json(data);
                },
              );
            },
          );
        },
      );
    },
  );
});

friend.route('/:id').delete((req, res) => {
  connection.query(
    'DELETE FROM friend WHERE user_id = ? AND friend_id = ?',
    [req.params.id, req.body.friendId],
    (err, data) => {
      if (err) {
        return res.status(500).json(err);
      }

      connection.query(
        'DELETE FROM friend WHERE user_id = ? AND friend_id = ?',
        [req.body.friendId, req.params.id],
        (err, data) => {
          if (err) {
            return res.status(500).json(err);
          }

          connection.query(
            'SELECT user.id, user.username, COUNT(location2.id) AS locations FROM user INNER JOIN friend ON friend.friend_id = user.id INNER JOIN location2 ON location2.user_id = friend.friend_id WHERE friend.user_id = ? GROUP BY location2.user_id ORDER BY user.username',
            [req.params.id],
            (err, data) => {
              if (err) {
                return res.status(500).json(err);
              }
              res.status(200).json(data);
            },
          );
        },
      );
    },
  );
});

export default friend;
