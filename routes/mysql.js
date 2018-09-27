import express from 'express';
import mysql from 'mysql';


const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Olli9989',
  database: 'whib',
});

const newMysql = express.Router();

connection.connect(err => {
  if (err) {
    throw err;
  } 
  console.log('connected');

  newMysql.route('/').get((req, res) => {
    connection.query('SELECT * FROM user', (err, data) => {
      if (err) {
        return res.status(404).json(err);
      }
      res.status(200).json(data);
    });
  })
});

export default newMysql;
