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

const login = express.Router();

login.route('/').post((req, res) => {
  connection.query('SELECT * FROM user WHERE email = ?', [req.body.email], (err, data) => {
    if (err) {
      return res.status(404).json(err);
    }
    if (data.length < 1) {
      return res.status(404).end();
    }
    bcrypt.compare(req.body.password, data.password, function(err, isMatch) {
      if (err) {
        return res.status(401).json(err);
      }
      res.status(200).json(data);
    });
  });
});

export default login;
