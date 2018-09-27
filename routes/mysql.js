import express from 'express';
import mysql from 'mysql';
import bcrypt from 'bcrypt';

const SALT_WORK_FACTOR = 10;

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

  newMysql
    .route('/')
    .get((req, res) => {
      console.log('get');
      connection.query('SELECT * FROM user', (err, data) => {
        if (err) {
          return res.status(404).json(err);
        }
        res.status(200).json(data);
      });
    })
    .post((req, res) => {
      console.log('post');
      bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) {
          return res.status(500).end();
        }
        bcrypt.hash(req.body.password, salt, function(err, hash) {
          if (err) {
            return res.status(400).end();
          }
          connection.query('INSERT INTO user (email, password, username) VALUES (?, ?, ?)', [req.body.email, hash, req.body.username], (err, data) => {
            if (err) {
              return res.status(400).end();
            }
            return res.status(201).json(data);
          });
        });
      });
    });
});

export default newMysql;
