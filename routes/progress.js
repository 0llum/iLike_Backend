import express from 'express';
import mysql from 'mysql';

import Connection from '../constants/Connection';

const progress = express.Router();
let connection;
let progressListener;
const PROGRESS_INTERVAL = 60000;

function handleDisconnect() {
  connection = mysql.createConnection(Connection);

  connection.connect((err) => {
    if (err) {
      console.log(err);
      setTimeout(handleDisconnect, 2000);
    } else {
      console.log('progress router connected');
      if (!progressListener) {
        progressListener = setInterval(() => {
          connection.query(
            'UPDATE `location2` INNER JOIN world ON location2.latitude = world.latitude AND location2.longitude = world.longitude SET location2.region_id = world.region_id',
          );
        }, PROGRESS_INTERVAL);
      }
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

progress.route('/').get((req, res) => {
  connection.query(
    'UPDATE `location2` INNER JOIN world ON location2.latitude = world.latitude AND location2.longitude = world.longitude SET location2.region_id = world.region_id',
    [],
    (err) => {
      if (err) {
        return res.status(500).json(err);
      }
      res.status(200).end();
    },
  );
});

progress.route('/:id').get((req, res) => {
  connection.query(
    'SELECT region.id, name, COUNT(*) as count, region.count as total, COUNT(*) * 100 /region.count as percent FROM location2 INNER JOIN region on location2.region_id = region.id WHERE user_id = ? GROUP BY region.id ORDER BY percent DESC',
    [req.params.id],
    (err, data) => {
      if (err) {
        return res.status(500).json(err);
      }
      res.status(200).json(data);
    },
  );
});

export default progress;
