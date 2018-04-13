import express from 'express';
import mongoose from 'mongoose';
import ListModel from './models/list';
import * as Lists from './Lists';

mongoose.connect('mongodb://localhost:27017/iLike');

const list = new ListModel({
  name: 'test',
  color: '#FF0000',
  items: [{
    name: 'test1',
    color: '#00FF00',
  }, {
    name: 'test2',
    color: '#0000FF',
  }]
});

list.save();

const app = express();
app.get('/lists', (req, res) =>
  res.json(Lists.default)
);

const server = app.listen(3000, () => {
  const { address, port } = server.address();
  console.log('Listening at ' + address + ':' + port);
});