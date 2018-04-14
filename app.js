import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import ListModel from './models/list';
import * as Lists from './Lists';

mongoose.connect('mongodb://localhost:27017/iLike');

const app = express();
app.use(bodyParser.json());

app.get('/lists', (req, res) => {
  ListModel.find({}, (err, data) => {
    if (err) {
      console.log(error);
      res.status(404);
      res.end();
    } else {
      res.status(200);
      res.json(data);
    }
  })
});

app.post('/lists', (req, res) => {
  const list = new ListModel(req.body);
  list.save(err => {
    if (err) {
      res.status(406);
      res.json(err);
    } else {
      res.status(201);
      res.json(req.body);
    }
  });
});

const server = app.listen(3000, () => {
  const { address, port } = server.address();
  console.log('Listening at ' + address + ':' + port);
});