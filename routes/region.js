import express from 'express';
import mysql from 'mysql';

import Connection from '../constants/Connection';

const region = express.Router();
let connection;

function handleDisconnect() {
  connection = mysql.createConnection(Connection);

  connection.connect((err) => {
    if (err) {
      console.log(err);
      setTimeout(handleDisconnect, 2000);
    } else {
      console.log('region router connected');
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

region.route('/').get((req, res) => {
  connection.query(
    'SELECT * FROM region',
    [],
    (err, arr) => {
      if (err) {
        return res.status(500).json(err);
      }

      const tree = [];
      const mappedArr = {};
      let arrElem;
      let mappedElem;

      for (let i = 0, len = arr.length; i < len; i++) {
        arrElem = arr[i];
        mappedArr[arrElem.id] = arrElem;
        mappedArr[arrElem.id].children = [];
      }

      for (const id in mappedArr) {
        if (mappedArr.hasOwnProperty(id)) {
          mappedElem = mappedArr[id];
          // If the element is not at the root level, add it to its parent array of children.
          if (mappedElem.parentid) {
            mappedArr[mappedElem.parent_id].children.push(mappedElem);
          }
          // If the element is at the root level, add it to first level elements array.
          else {
            tree.push(mappedElem);
          }
        }
      }

      res.status(200).json(tree);
    },
  );
});

region.route('/:id').get((req, res) => {
  connection.query(
    'SELECT * FROM region WHERE id = ?',
    [req.params.id],
    (err, data) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.status(200).json(data);
    },
  );
});

export default region;
