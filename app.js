import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import List from './models/list';

mongoose.connect('mongodb://localhost:27017/iLike');

const app = express();
app.use(bodyParser.json());

app.route('/lists')
  .get((req, res) => {
    List.find({}, (err, data) => {
      if (err) {
        return res.status(404).json(err);
      }
      res.status(200).json(data);
    });
  })
  .post((req, res) => {
    const list = new List(req.body);
    list.save(err => {
      if (err) {
        return res.status(406).json(err);
      }
      List.findById(list.id, (err, data) => {
        if (err) {
          return res.status(404).json(err);
        }
        res.status(200).json(data);
      });
    });
  });

app.route('/lists/:id')
  .get((req, res) => {
    List.findById(req.params.id, (err, data) => {
      if (err) {
        return res.status(404).json(err);
      }
      res.status(200).json(data);
    });
  })
  .patch((req, res) => {
    req.body.count && List.findByIdAndUpdate(req.params.id, {
      $inc: {count: 1}
    }, (err, item) => {
      if (err) {
        return res.status(404).json(err);
      }
      res.status(200).json(item);
    });
  });

app.route('/lists/:id/:itemId')
  .get((req, res) => {
    List.findById(req.params.id, (err, data) => {
      if (err) {
        return res.status(404).json(err);
      }
      const item = data.items.id(req.params.itemId);
      if (!item) {
        return res.status(404).end();
      }
      res.status(200).json(item);
    });
  })
  .patch((req, res) => {
    req.body.count && List.findOneAndUpdate({
      _id: req.params.id,
      "items._id": req.params.itemId
    }, {
      $inc: {"items.$.count": 1}
    }, (err, item) => {
      if (err) {
        res.status(404).json(err);
      } else {
        res.status(200).json(item);
      }
    });

    req.body.picks && List.findOneAndUpdate({
      _id: req.params.id,
      "items._id": req.params.itemId
    }, {
      $inc: {"items.$.picks": 1}
    }, (err, item) => {
      if (err) {
        res.status(404).json(err);
      } else {
        res.status(200).json(item);
      }
    });
  });

app.route('/lists/:id/:itemId/:itemMatchId')
  .get((req, res) => {
    List.findById(req.params.id, (err, data) => {
      if (err) {
        return res.status(404).json(err);
      }
      const item = data.items.id(req.params.itemId);
      if (!item) {
        return res.status(404).end();
      }
      const match = item.matches.id(req.params.itemMatchId);
      if (!match) {
        return res.status(404).end();
      }
      res.status(200).json(match);
    });
  })
  .patch((req, res) => {
    req.body.count && List.findOneAndUpdate({
      _id: req.params.id,
      "items._id": req.params.itemId,
      "items.itemId": req.params.matchId,
    }, {
      $inc: {"items.matches.$.count": 1}
    }, {
      upsert: true,
    }, (err, item) => {
      if (err) {
        res.status(404).json(err);
      } else {
        res.status(200).json(item);
      }
    });

    req.body.picks && List.findOneAndUpdate({
      _id: req.params.id,
      "items._id": req.params.itemId,
      "items.itemId": req.params.matchId,
    }, {
      $inc: {"items.matches.$.picks": 1}
    }, {
      upsert: true,
    }, (err, item) => {
      if (err) {
        res.status(404).json(err);
      } else {
        res.status(200).json(item);
      }
    });
  });

const server = app.listen(3000, () => {
  const { address, port } = server.address();
  console.log('Listening at ' + address + ':' + port);
});