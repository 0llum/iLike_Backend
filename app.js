import express from 'express';
import mongoose from 'mongoose';
import ListModel from './models/list';
import * as Lists from './Lists';

mongoose.connect('mongodb://localhost:27017/iLike');

const app = express();

app.get('/lists', (req, res) => {
  ListModel.find({}, (err, data) => {
    if (err) {
      console.log(error);
    } else {
      console.log(data);
      res.json(data);
    }
  })
});

app.post('/lists', (req, res) => {
  console.log(req);
  const list = new ListModel(req.body);
  list.save();
});

const server = app.listen(3000, () => {
  const { address, port } = server.address();
  console.log('Listening at ' + address + ':' + port);
});