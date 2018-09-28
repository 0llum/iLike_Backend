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

const user = express.Router();

connection.connect(err => {
  if (err) {
    throw err;
  }
  console.log('user router connected');

  user
    .route('/')
    .get((req, res) => {
      connection.query('SELECT * FROM user', (err, data) => {
        if (err) {
          return res.status(404).json(err);
        }
        res.status(200).json(data);
      });
    })
    .post((req, res) => {
      bcrypt.hash(req.body.password, SALT_WORK_FACTOR, function(err, hash) {
        if (err) {
          return res.status(500).json(err);
        }
        connection.query(
          'INSERT INTO user (email, password, username) VALUES (?, ?, ?)',
          [req.body.email, hash, req.body.username],
          (err, data) => {
            if (err) {
              return res.status(500).end();
            }
            connection.query('SELECT * FROM user WHERE id = ?', [data.insertId], (err, user) => {
              if (err) {
                return res.status(500).json(err);
              }
              if (user.length < 1) {
                return res.status(404).end();
              }
              res.status(201).json(user[0]);
            });
          },
        );
      });
    });

  user.route('/:id').get((req, res) => {
    connection.query('SELECT * FROM user WHERE id = ?', [req.params.id], (err, data) => {
      if (err) {
        return res.status(500).json(err);
      }
      if (data.length < 1) {
        return res.status(404).end();
      }
      res.status(200).json(data[0]);
    });
  });
});

export default user;
