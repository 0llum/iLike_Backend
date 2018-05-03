import express from 'express';
import mongoose from 'mongoose';
import List from '../models/list';
import User from '../models/user';

// clear database count, picks and matches
// mongo
// use iLike
// db.lists.updateMany({}, {$set: {"items.$[elem].count": 0}}, {arrayFilters: [{"elem.count": {$gte: 0}}]})
// db.lists.updateMany({}, {$set: {"items.$[elem].picks": 0}}, {arrayFilters: [{"elem.count": {$gte: 0}}]})
// db.lists.updateMany({}, {$set: {"items.$[elem].matches": []}}, {arrayFilters: [{"elem.count": {$gte: 0}}]})

mongoose.connect('mongodb://localhost:27017/iLike');
const lists = express.Router();

lists
  .route('/')
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
        res.status(201).json(data);
      });
    });
  });

lists
  .route('/:id')
  .get((req, res) => {
    List.findById(req.params.id, (err, data) => {
      if (err) {
        return res.status(404).json(err);
      }
      if (!data) {
        return res.status(404).end();
      }
      res.status(200).json(data);
    });
  })
  .patch((req, res) => {
    List.findById(req.params.id, (err, data) => {
      if (err) {
        return res.status(404).json(err);
      }
      if (!data) {
        return res.status(404).end();
      }
      const list = data;
      if (req.body.count) {
        list.count = list.count ? list.count + 1 : 1;
      }
      if (req.body.items) {
        req.body.items.forEach(bodyItem => {
          const listItem = list.items.id(bodyItem.id);
          if (bodyItem.count) {
            listItem.count = listItem.count + 1;
          }
          if (bodyItem.picks) {
            listItem.picks = listItem.picks + 1;
          }
          if (bodyItem.matches) {
            bodyItem.matches.forEach(x => {
              let match = listItem.matches.find(y => y.itemId == x.itemId);
              if (!match) {
                match = {};
                match.itemId = x.itemId;
                match.count = 0;
                match.picks = 0;
                if (x.count) {
                  match.count = match.count + 1;
                }
                if (x.picks) {
                  match.picks = match.picks + 1;
                }
                listItem.matches.push(match);
              } else {
                if (x.count) {
                  match.count = match.count + 1;
                }
                if (x.picks) {
                  match.picks = match.picks + 1;
                }
              }

              User.findById(req.body.userId, (err, data) => {
                if (err) {
                  console.log(err);
                }
                if (!data) {
                  console.log('no data');
                }
                if (data) {
                  const user = data;
                  let userMatch = data.matches.find((z = z.matchId == match.id));
                  if (!userMatch) {
                    userMatch = {};
                    userMatch.matchId = match.id;
                    userMatch.picks = 0;
                    if (x.picks) {
                      userMatch.picks = 1;
                    }
                    user.matches.push(userMatch);
                  } else {
                    if (x.picks) {
                      userMatch.picks = 1;
                    } else {
                      userMatch.picks = 0;
                    }
                  }
                  user.save();
                }
              });
            });
          }
        });
      }
      list.save();
      res.status(200).json(req.body);
    });
  });

lists
  .route('/:id/:itemId')
  .get((req, res) => {
    List.findById(req.params.id, (err, data) => {
      if (err) {
        return res.status(404).json(err);
      }
      const item = data.items.id(req.params.itemId);
      if (!item) {
        return res.status(404).end();
      }
      item.matches.forEach(element => {
        const ref = data.items.find(x => x.id == element.itemId);
        element.name = ref.name;
        element.image = ref.image;
      });
      res.status(200).json(item);
    });
  })
  .patch((req, res) => {
    req.body.count &&
      List.findOneAndUpdate(
        {
          _id: req.params.id,
          'items._id': req.params.itemId,
        },
        {
          $inc: { 'items.$.count': 1 },
        },
        (err, item) => {
          if (err) {
            return res.status(404).json(err);
          }
        },
      );

    req.body.picks &&
      List.findOneAndUpdate(
        {
          _id: req.params.id,
          'items._id': req.params.itemId,
        },
        {
          $inc: { 'items.$.picks': 1 },
        },
        (err, item) => {
          if (err) {
            return res.status(404).json(err);
          }
        },
      );

    res.status(200).json();
  });

lists
  .route('/:id/:itemId/:itemMatchId')
  .get((req, res) => {
    List.findById(req.params.id, (err, data) => {
      if (err) {
        return res.status(404).json(err);
      }
      const item = data.items.id(req.params.itemId);
      if (!item) {
        return res.status(404).end();
      }
      const match = item.matches.find(x => x.toObject().itemId == req.params.itemMatchId);
      if (!match) {
        return res.status(404).end();
      }
      res.status(200).json(match);
    });
  })
  .patch((req, res) => {
    List.findById(req.params.id, (err, data) => {
      const item = data.items.find(x => x.id == req.params.itemId);
      let match = item.matches.find(x => x.toObject().itemId == req.params.itemMatchId);
      if (!match) {
        match = {};
        match.itemId = req.params.itemMatchId;
        match.count = 0;
        match.picks = 0;
        if (req.body.count) {
          match.count = match.count + 1;
        }
        if (req.body.picks) {
          match.picks = match.picks + 1;
        }
        item.matches.push(match);
      } else {
        if (req.body.count) {
          match.count = match.count ? match.count + 1 : 1;
        }
        if (req.body.picks) {
          match.picks = match.picks ? match.picks + 1 : 1;
        }
      }
      data.save(err => {
        if (err) {
          return res.status(404).json(err);
        }
        return res.status(200).json(match);
      });
    });
  });

export default lists;
