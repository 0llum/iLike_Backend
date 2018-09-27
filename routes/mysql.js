import express from 'express';
import mysql from 'mysql';


const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Olli9989',
  database: 'whib',
});

connection.connect(err => {
  if (err) {
    console.log(err);
  } else {
    console.log('connected');
  }
});

const newMysql = express.Router();

export default newMysql;
