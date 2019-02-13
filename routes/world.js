import express from "express";
import mysql from "mysql";
import geolib from "geolib";

import Connection from "../constants/Connection";
import GeoLocation from "../model/GeoLocation";
import GeoArray from "../model/GeoArray";
import * as Earth from "../constants/Earth";
import Polygon from "../countries/Germany/Brandenburg/Oberhavel/Kremmen";

// UPDATE `location2` INNER JOIN world ON location2.latitude = world.latitude AND location2.longitude = world.longitude SET location2.region_id = world.region_id WHERE world.region_id = 5

const world = express.Router();
let connection;

function handleDisconnect() {
  connection = mysql.createConnection(Connection);

  connection.connect(err => {
    if (err) {
      console.log(err);
      setTimeout(handleDisconnect, 2000);
    } else {
      console.log("world router connected");
    }
  });

  connection.on("error", err => {
    console.log(err);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      handleDisconnect();
    } else {
      throw err;
    }
  });
}

handleDisconnect();

world.route("/").get((req, res) => {
  connection.query("SELECT * FROM world", (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }
    return res.status(200).json(data);
  });
});

world.route("/").post((req, res) => {
  const locations = req.body.locations.map(x => {
    const roundedLocation = GeoLocation.getRoundedLocation(
      x,
      Earth.GRID_DISTANCE
    );
    return [roundedLocation.latitude, roundedLocation.longitude];
  });

  connection.query(
    "INSERT INTO world (latitude, longitude) VALUES ?",
    [locations],
    err => {
      if (err) {
        console.log(err);
      }

      res.status(201).end();
    }
  );
});

const generateCoordinates = (
  region,
  latMin,
  latMax,
  lngMin,
  lngMax,
  lat = latMax
) => {
  if (lat < latMin) {
    console.log("done");
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
    "INSERT INTO world (latitude, longitude, region_id) VALUES ? ON DUPLICATE KEY UPDATE region_id = ?",
    [tiles, region],
    err => {
      if (err) console.log(err);
      console.log(latitude);
      generateCoordinates(
        region,
        latMin,
        latMax,
        lngMin,
        lngMax,
        latitude - Earth.GRID_DISTANCE
      );
    }
  );
};

world.route("/generate/:region/:lngMin/:latMin/:lngMax/:latMax").get(req => {
  const latMin = parseFloat(req.params.latMin);
  const latMax = parseFloat(req.params.latMax);
  const lngMin = parseFloat(req.params.lngMin);
  const lngMax = parseFloat(req.params.lngMax);
  console.log(
    `generating coordinates from ${latMin}, ${lngMin} to ${latMax}, ${lngMax}`
  );
  generateCoordinates(req.params.region, latMin, latMax, lngMin, lngMax);
});

world.route("/generate/:region").get(req => {
  console.log("generating...");
  const polygon = Polygon;
  const array = polygon.features[0].geometry.coordinates[0];
  const coords = array.map(x => ({ latitude: x[1], longitude: x[0] }));
  const boundingBox = GeoArray.getBoundingBox(coords);

  geolib.preparePolygonForIsPointInsideOptimized(coords);

  generate(
    req.params.region,
    coords,
    boundingBox.latMin,
    boundingBox.latMax,
    boundingBox.longMin,
    boundingBox.longMax
  );
});

const generate = (
  region,
  polygon,
  latMin,
  latMax,
  lngMin,
  lngMax,
  lat = latMax
) => {
  if (lat < latMin) {
    console.log("done");
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
    const location = { latitude, longitude };
    if (geolib.isPointInsideWithPreparedPolygon(location, polygon)) {
      tiles.push([latitude, longitude, region]);
    }
  }

  connection.query(
    "INSERT INTO world (latitude, longitude, region_id) VALUES ? ON DUPLICATE KEY UPDATE region_id = ?",
    [tiles, region],
    err => {
      if (err) console.log(err);
      console.log(latitude);
      generate(
        region,
        polygon,
        latMin,
        latMax,
        lngMin,
        lngMax,
        latitude - Earth.GRID_DISTANCE
      );
    }
  );
};

export default world;
