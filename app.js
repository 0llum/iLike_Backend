import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import ListModel from './models/list';

mongoose.connect('mongodb://localhost:27017/iLike');

const app = express();
app.use(bodyParser.json());

app.get('/lists', (req, res) => {
  ListModel.find({}, (err, data) => {
    if (err) {
      res.status(404);
      res.json(err);
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

app.get('/lists/:id', (req, res) => {
  ListModel.findById(req.params.id, (err, data) => {
    if (err) {
      res.status(404);
      res.json(err);
    } else {
      const list = data;
      res.status(200);
      res.json(data);
    }
  })
});

app.patch('/lists/:id', (req, res) => {
  req.body.count && ListModel.findOneAndUpdate({
    _id: req.params.id,
  }, {
    $inc: {"count": 1}
  }, (err, item) => {
    if (err) {
      res.status(404);
      res.end();
    } else {
      res.status(200);
      res.json(item);
    }
  });
});

app.get('/lists/:id/:itemId', (req, res) => {
  ListModel.findById(req.params.id, (err, data) => {
    if (err) {
      res.status(404);
      res.json(err);
    } else {
      const list = new ListModel(data);
      list.items.forEach(item => {
        if (item._id == req.params.itemId) {
          res.status(200);
          res.json(item);
        }
      });
      res.status(404);
      res.end();
    }
  })
});

app.patch('/lists/:id/:itemId', (req, res) => {
  req.body.count && ListModel.findOneAndUpdate({
    _id: req.params.id,
    "items._id": req.params.itemId
  }, {
    $inc: {"items.$.count": 1}
  }, (err, item) => {
    if (err) {
      res.status(404);
      res.end();
    } else {
      res.status(200);
      res.json(item);
    }
  });

  req.body.picks && ListModel.findOneAndUpdate({
    _id: req.params.id,
    "items._id": req.params.itemId
  }, {
    $inc: {"items.$.picks": 1}
  }, (err, item) => {
    if (err) {
      res.status(404);
      res.end();
    } else {
      res.status(200);
      res.json(item);
    }
  });
});

const server = app.listen(3000, () => {
  const { address, port } = server.address();
  console.log('Listening at ' + address + ':' + port);
});