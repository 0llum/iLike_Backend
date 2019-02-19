import express from 'express';
import mysql from 'mysql';

import Connection from '../constants/Connection';
import GeoLocation from '../model/GeoLocation';
import GeoArray from '../model/GeoArray';
import * as Earth from '../constants/Earth';

const location = express.Router();
let connection;

function handleDisconnect() {
  connection = mysql.createConnection(Connection);

  connection.connect((err) => {
    if (err) {
      console.log(err);
      setTimeout(handleDisconnect, 2000);
    } else {
      console.log('location_2 router connected');
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

location.route('/').get((req, res) => {
  connection.query('SELECT * FROM location2', (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.status(200).json(data);
  });
});

location.route('/:id').get((req, res) => {
  connection.query(
    'SELECT * FROM location2 WHERE user_id = ? ORDER BY latitude DESC, longitude ASC',
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
    },
  );
});

location.route('/:id').post((req, res) => {
  const locations = req.body.locations.map((x) => {
    const roundedLocation = GeoLocation.getRoundedLocation(x, Earth.GRID_DISTANCE);
    return [req.params.id, roundedLocation.latitude, roundedLocation.longitude, x.timestamp];
  });

  connection.query(
    'INSERT INTO location2 (user_id, latitude, longitude, timestamp) VALUES ? ON DUPLICATE KEY UPDATE user_id = ?',
    [locations, req.params.id],
    (err, data) => {
      if (err) {
        console.log(err);
      }

      res.status(201).json(req.body.locations);
    },
  );
});

location.route('/:id').delete((req, res) => {
  connection.query(
    'DELETE FROM location2 WHERE user_id = ? AND latitude = ? AND longitude = ?',
    [req.params.id, req.body.location.latitude, req.body.location.longitude],
    (err, data) => {
      if (err) {
        console.log(err);
      }

      res.status(200).json(req.body.location);
    },
  );
});

location.route('/:id/copy').get((req, res) => {
  connection.query(
    'SELECT * FROM location WHERE user_id = ? ORDER BY latitude DESC, longitude ASC',
    [req.params.id],
    (err, data) => {
      if (err) {
        return res.status(500).json(err);
      }

      const resizedLocations = GeoArray.removeDuplicates(
        data.map(x => GeoLocation.getRoundedLocation(x, Earth.GRID_DISTANCE)),
      );

      const finalLocations = resizedLocations.map(x => [
        req.params.id,
        x.latitude,
        x.longitude,
        x.timestamp,
      ]);

      connection.query(
        'INSERT INTO location2 (user_id, latitude, longitude, timestamp) VALUES ? ON DUPLICATE KEY UPDATE user_id = ?',
        [finalLocations, req.params.id],
        (err, data) => {
          if (err) {
            console.log(err);
          }

          res.status(201).end();
        },
      );
    },
  );
});

export default location;
