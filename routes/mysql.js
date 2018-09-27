import express from 'express';
import mysql from 'mysql';

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'whib',
});

connection.connect(err => {
  if (err) {
    throw err;
  }
  console.log('connected');
});
