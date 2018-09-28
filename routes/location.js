import express from 'express';
import mysql from 'mysql';

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Olli9989',
  database: 'whib',
});

const location = express.Router();

connection.connect(err => {
  if (err) {
    throw err;
  }
  console.log('location router connected');

  location.route('/').get((req, res) => {
    connection.query('SELECT * FROM location', (err, data) => {
      if (err) {
        return res.status(500).json(err);
      }
      res.status(200).json(data);
    });
  });
});

export default location;
