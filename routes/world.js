import express from 'express';
import mysql from 'mysql';

import Connection from '../constants/Connection';
import GeoLocation from '../model/GeoLocation';
import GeoArray from '../model/GeoArray';
import * as Earth from '../constants/Earth';
import Berlin from '../countries/germany/Berlin';

const world = express.Router();
let connection;

function handleDisconnect() {
  connection = mysql.createConnection(Connection);

  connection.connect(err => {
    if (err) {
      console.log(err);
      setTimeout(handleDisconnect, 2000);
    } else {
      console.log('world router connected');
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

world.route('/').get((req, res) => {
  connection.query('SELECT * FROM world', (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }
    return res.status(200).json(data);
  });
});

world.route('/').post((req, res) => {
  const locations = req.body.locations.map(x => {
    const roundedLocation = GeoLocation.getRoundedLocation(x, Earth.GRID_DISTANCE);
    return [roundedLocation.latitude, roundedLocation.longitude];
  });

  connection.query('INSERT INTO world (latitude, longitude) VALUES ?', [locations], err => {
    if (err) {
      console.log(err);
    }

    res.status(201).end();
  });
});

const generateCoordinates = (latMin, latMax, lngMin, lngMax, lat = latMax) => {
  if (lat < latMin) {
    console.log('done');
    return;
  }

  const tiles = [];
  const latitude = GeoLocation.getRoundedLatitude(lat);
  const gridDistanceAtLatitude = GeoLocation.gridDistanceAtLatitude(latitude);

  for (let lng = lngMin; lng < lngMax; lng += gridDistanceAtLatitude) {
    let temp = lng;
    if (temp > 180) {
      temp -= 360;
    }
    const longitude = GeoLocation.getRoundedLongitude(temp, latitude);
    console.log(latitude, longitude);
    if (!(longitude == 0 && tiles.length > 0)) {
      tiles.push([latitude, longitude]);
    }
  }

  connection.query('INSERT INTO world (latitude, longitude) VALUES ?', [tiles], err => {
    if (err) console.log(err);
    generateCoordinates(latMin, latMax, lngMin, lngMax, latitude - Earth.GRID_DISTANCE);
  });
};

world.route('/generate/:latMin/:latMax/:lngMin/:lngMax').get(req => {
  const latMin = parseFloat(req.params.latMin);
  const latMax = parseFloat(req.params.latMax);
  const lngMin = parseFloat(req.params.lngMin);
  const lngMax = parseFloat(req.params.lngMax);
  console.log(`generating coordinates from ${latMin}, ${lngMin} to ${latMax}, ${lngMax}`);
  generateCoordinates(latMin, latMax, lngMin, lngMax);
});

world.route('/generate').get(req => {
  console.log(`generating...`);
  const polygon = GeoLocation.getTilesInPolygon(Berlin);
  const array = polygon.features[0].geometry.coordinates[0];
  const coords = array.map(x => ({ latitude: x[1], longitude: x[0] }));
  const boundingBox = GeoArray.getBoundingBox(coords);

  geolib.preparePolygonForIsPointInsideOptimized(coords);

  for (
    let lat = boundingBox.latMax + Earth.GRID_DISTANCE;
    lat > boundingBox.latMin - Earth.GRID_DISTANCE;
    lat -= Earth.GRID_DISTANCE
  ) {
    const candidates = [];
    const latitude = GeoLocation.getRoundedLatitude(lat);
    const gridDistanceAtLatitude = GeoLocation.gridDistanceAtLatitude(lat);
    for (
      let lng = boundingBox.longMin - Earth.GRID_DISTANCE;
      lng < boundingBox.longMax + Earth.GRID_DISTANCE;
      lng += gridDistanceAtLatitude
    ) {
      const longitude = GeoLocation.getRoundedLongitude(lng, latitude);
      const location = { latitude, longitude };
      if (geolib.isPointInsideWithPreparedPolygon(location, coords)) {
        candidates.push({ latitude, longitude });
      }
    }

    const locations = candidates.map(x => {
      const roundedLocation = GeoLocation.getRoundedLocation(x, Earth.GRID_DISTANCE);
      return [roundedLocation.latitude, roundedLocation.longitude];
    });

    console.log(locations);

    connection.query('INSERT INTO world (latitude, longitude) VALUES ?', [locations], err => {
      if (err) {
        console.log(err);
      }
    });
  }
});

export default world;
