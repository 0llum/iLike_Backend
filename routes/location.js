import express from 'express';
import mysql from 'mysql';
import Expo from 'expo-server-sdk';

import Connection from '../constants/Connection';
import * as EarthUtils from '../utils/EarthUtils';
import * as LevelUtils from '../utils/LevelUtils';

const location = express.Router();
let expo = new Expo();
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
  connection.query('SELECT * FROM location', (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.status(200).json(data);
  });
});

location.route('/:id').get((req, res) => {
  connection.query(
    'SELECT * FROM location WHERE user_id = ? ORDER BY latitude DESC, longitude ASC',
    [req.params.id],
    (err, data) => {
      if (err) {
        return res.status(500).json(err);
      }

      const locations = {
        id: req.params.id,
        locations: data,
      };
      res.status(200).json(locations);
    }
  );
});

location.route('/:id').post((req, res) => {
  const locations = req.body.locations.map(x => {
    const latitude = EarthUtils.getRoundedLatitude(x.latitude);
    const longitude = EarthUtils.getRoundedLongitude(x.longitude, latitude);
    return [req.params.id, latitude, longitude, x.timestamp];
  });

  connection.query(
    'SELECT COUNT(location.id) AS count FROM location WHERE user_id = ?',
    [req.params.id],
    (err, data) => {
      if (err) {
        console.log(err);
      }
      const before = LevelUtils.getLevelFromExp(data[0].count);

      connection.query(
        'INSERT INTO location (user_id, latitude, longitude, timestamp) VALUES ?',
        [locations],
        (err, data) => {
          if (err) {
            console.log(err);
          }

          res.status(201).json(req.body.locations);

          connection.query(
            'SELECT COUNT(location.id) AS count FROM location WHERE user_id = ?',
            [req.params.id],
            (err, data) => {
              if (err) {
                console.log(err);
              }

              const after = LevelUtils.getLevelFromExp(data[0].count);
              if (after > before) {
                connection.query('SELECT user.push_token, B.username FROM user INNER JOIN friend AS A ON user.id = A.user_id INNER JOIN user AS B on A.friend_id = B.id WHERE A.friend_id = ?',
                  [req.params.id],
                  (err, data) => {
                    if (err) {
                      console.log(err);
                    }

                    const messages = [];

                    data.forEach((x) => {
                      messages.push({
                        to: x.push_token,
                        title: `${x.username} is now on level ${after}`,
                        body: `Your friend ${x.username} is using WHIB to explore the world. You might want to check out!`,
                      });
                    });

                    let chunks = expo.chunkPushNotifications(messages);
                    (async () => {
                      for (let chunk of chunks) {
                        try {
                          let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                        } catch (error) {
                          console.error(error);
                        }
                      }
                    })();
                  }
                )
              }
            }
          );
        }
      );
    }
  );
});

export default location;
