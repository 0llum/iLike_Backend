import express from 'express';
import mysql from 'mysql';
import geolib from 'geolib';

import Connection from '../constants/Connection';
import GeoLocation from '../model/GeoLocation';
import GeoArray from '../model/GeoArray';
import * as Earth from '../constants/Earth';
import Polygon from '../countries/Germany/Brandenburg/Uckermark_62537_AL6';

const world = express.Router();
let connection;

function handleDisconnect() {
  connection = mysql.createConnection(Connection);

  connection.connect((err) => {
    if (err) {
      console.log(err);
      setTimeout(handleDisconnect, 2000);
    } else {
      console.log('world router connected');
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

world.route('/').get((req, res) => {
  connection.query('SELECT region.id, name, COUNT(*) as count FROM world INNER JOIN region on world.region_id = region.id GROUP BY region.id', (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }
    return res.status(200).json(data);
  });
});

world.route('/').post((req, res) => {
  const locations = req.body.locations.map((x) => {
    const roundedLocation = GeoLocation.getRoundedLocation(
      x,
      Earth.GRID_DISTANCE,
    );
    return [roundedLocation.latitude, roundedLocation.longitude];
  });

  connection.query(
    'INSERT INTO world (latitude, longitude) VALUES ?',
    [locations],
    (err) => {
      if (err) {
        console.log(err);
      }

      res.status(201).end();
    },
  );
});

const generateCoordinates = (
  region,
  latMin,
  latMax,
  lngMin,
  lngMax,
  lat = latMax,
) => {
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
    if (!(longitude == 0 && tiles.length > 0)) {
      tiles.push([latitude, longitude, region]);
    }
  }

  connection.query(
    'INSERT INTO world (latitude, longitude, region_id) VALUES ? ON DUPLICATE KEY UPDATE region_id = ?',
    [tiles, region],
    (err) => {
      if (err) console.log(err);
      console.log(latitude);
      generateCoordinates(
        region,
        latMin,
        latMax,
        lngMin,
        lngMax,
        latitude - Earth.GRID_DISTANCE,
      );
    },
  );
};

world.route('/generate/:region/:lngMin/:latMin/:lngMax/:latMax').get((req) => {
  const latMin = parseFloat(req.params.latMin);
  const latMax = parseFloat(req.params.latMax);
  const lngMin = parseFloat(req.params.lngMin);
  const lngMax = parseFloat(req.params.lngMax);
  console.log(
    `generating coordinates from ${latMin}, ${lngMin} to ${latMax}, ${lngMax}`,
  );
  generateCoordinates(req.params.region, latMin, latMax, lngMin, lngMax);
});

world.route('/generate').get((req, res) => {
  const { id, name, localname } = Polygon.properties;
  const level = Polygon.properties.admin_level;
  console.log(`generating tiles for ${name} with region_id = ${id}`);
  const multiPolygon = Polygon.geometry.coordinates;
  const boundingBoxes = [];
  multiPolygon.forEach((polygon) => {
    polygon.forEach((region) => {
      const coords = region.map(x => ({ latitude: x[1], longitude: x[0] }));
      const boundingBox = GeoArray.getBoundingBox(coords);
      boundingBoxes.push(boundingBox);
      // geolib.preparePolygonForIsPointInsideOptimized(coords);
      // generate(id, coords, boundingBox);
    });
  });

  let {
    longMin, latMin, longMax, latMax,
  } = boundingBoxes[0];
  boundingBoxes.forEach((x) => {
    longMin = Math.min(longMin, x.longMin);
    latMin = Math.min(latMin, x.latMin);
    longMax = Math.max(longMax, x.longMax);
    latMax = Math.max(latMax, x.latMax);
  });

  connection.query(
    'INSERT INTO region (id, name, localname, level, long_min, lat_min, long_max, lat_max) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE id = VALUES(id), name = VALUES(name), localname = VALUES(localname), level = VALUES(level), long_min = VALUES(long_min), lat_min = VALUES(lat_min), long_max = VALUES(long_max), lat_max = VALUES(lat_max)',
    [id, name, localname, level, longMin, latMin, longMax, latMax],
    (err) => {
      if (err) {
        console.log(err);
      }

      res.status(201).end();
    },
  );
});

const generate = (regionId, polygon, boundingBox, lat = boundingBox.latMax + Earth.GRID_DISTANCE) => {
  if (lat < boundingBox.latMin - Earth.GRID_DISTANCE) {
    console.log('done');
    return;
  }

  const tiles = [];
  const latitude = GeoLocation.getRoundedLatitude(lat);
  const gridDistanceAtLatitude = GeoLocation.gridDistanceAtLatitude(latitude);

  for (let lng = boundingBox.longMin - Earth.GRID_DISTANCE; lng < boundingBox.longMax + Earth.GRID_DISTANCE; lng += gridDistanceAtLatitude) {
    let temp = lng;
    if (temp > 180) {
      temp -= 360;
    }
    const longitude = GeoLocation.getRoundedLongitude(temp, latitude);
    const location = { latitude, longitude };
    if (geolib.isPointInsideWithPreparedPolygon(location, polygon)) {
      tiles.push([latitude, longitude, regionId]);
    }
  }

  if (tiles.length > 0) {
    connection.query(
      'INSERT INTO world (latitude, longitude, region_id) VALUES ? ON DUPLICATE KEY UPDATE region_id = ?',
      [tiles, regionId],
      (err) => {
        if (err) console.log(err);
        console.log(latitude);
        generate(regionId, polygon, boundingBox, latitude - Earth.GRID_DISTANCE);
      },
    );
  } else {
    console.log(latitude);
    generate(regionId, polygon, boundingBox, latitude - Earth.GRID_DISTANCE);
  }
};

export default world;
