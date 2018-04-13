import express from 'express';
import mongoose from 'mongoose';
import ListModel from './models/list';
import * as Lists from './Lists';

mongoose.connect('mongodb://localhost:27017/iLike');

const app = express();
app.get('/lists', (req, res) =>
  ListModel.find({}, (err, data) => {
    if (err) {
      console.log(error);
    } else {
      res.json(data);
    }
  })
);

const server = app.listen(3000, () => {
  const { address, port } = server.address();
  console.log('Listening at ' + address + ':' + port);
});