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
    (err, list) => {
      if (err) {
        return res.status(500).json(err);
      }

      const map = {};
      let node;
      const roots = [];
      let i;

      for (i = 0; i < list.length; i += 1) {
        map[list[i].id] = i;
        list[i].children = [];
      }
      for (i = 0; i < list.length; i += 1) {
        node = list[i];
        if (node.parent_id) {
          list[map[node.parent_id]].children.push(node);
        } else {
          roots.push(node);
        }
      }

      res.status(200).json(roots);
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
