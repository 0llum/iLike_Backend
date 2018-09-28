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

    const user = data[0];
    bcrypt.hash(req.body.password, SALT_WORK_FACTOR, function(err, hash) {
      if (err) {
        return res.status(500).json(err);
      }
      console.log(hash, user.password);
    });
    // bcrypt.compare(req.body.password, user.password, function(err, isMatch) {
    //   if (err) {
    //     return res.status(500).json(err);
    //   }
    //   if (!isMatch) {
    //     return res.status(401).end();
    //   }
    //   res.status(200).json(user);
    // });
  });
});

export default login;
