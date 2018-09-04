import express from 'express';
import mongoose from 'mongoose';
import User from '../models/user';
import * as MathUtils from '../utils/MathUtils';

// clear database count, picks and matches
// mongo
// use iLike
// db.users.updateMany({}, {$set: {"matches": []}}, {})

mongoose.connect('mongodb://localhost:27017/iLike');
const users = express.Router();

users
  .route('/')
  .get((req, res) => {
    User.find({}, (err, data) => {
      if (err) {
        return res.status(404).json(err);
      }
      res.status(200).json(data);
    });
  })
  .post((req, res) => {
    const user = new User(req.body);
    User.findOne({ email: req.body.email }, (err, data) => {
      if (data) {
        return res.status(403).end();
      }
      user.save(err => {
        if (err) {
          return res.status(406).json(err);
        }
        User.findById(user.id, (err, data) => {
          if (err) {
            return res.status(404).json(err);
          }
          res.status(201).json(data);
        });
      });
    });
  });

users.route('/login').post((req, res) => {
  const user = new User(req.body);
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) {
      return res.status(404).json(err);
    }
    if (!user) {
      return res.status(404).end();
    }
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (err) {
        return res.status(401).json(err);
      }
      if (!isMatch) {
        return res.status(401).end();
      }
      res.status(200).json(user);
    });
  });
});

users
  .route('/:id')
  .get((req, res) => {
    User.findById(req.params.id, (err, data) => {
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
    User.findById(req.params.id, (err, data) => {
      if (err) {
        return res.status(404).json(err);
      }
      if (!data) {
        return res.status(404).end();
      }
      const user = data;
      if (req.body.locations) {
        req.body.locations.forEach(bodyLocation => {
          const location = {
            latitude: bodyLocation.latitude,
            longitude: bodyLocation.longitude,
            timestamp: bodyLocation.timestamp,
          };
          const duplicate = user.locations.find(
            x => x.latitude === location.latitude && x.longitude === location.longitude,
          );
          if (!duplicate) {
            user.locations.push(location);
          }
        });
      }
      user.save();
      User.findById(req.params.id, (err, data) => {
        if (err) {
          return res.status(400).json(err);
        }
        res.status(200).json(req.body);
      });
    });
  });
// .patch((req, res) => {
//   User.findById(req.params.id, (err, data) => {
//     if (err) {
//       if (err) {
//         return res.status(404).json(err);
//       }
//       if (!data) {
//         return res.status(404).end();
//       }
//       const user = data;
//       if (req.body.matches) {
//         req.body.matches.forEach(el => {
//           let match = user.matches.find(x => x.matchId == el.matchId);
//           if (!match) {
//             match = {};
//             match.matchId = el.matchId;
//             match.picks = 0;
//             if (el.picks) {
//               match.picks = 1;
//             }
//             user.matches.push(match);
//           } else {
//             match.picks = match.picks - userMatch.picks;
//             if (x.picks) {
//               match.picks = 1;
//             } else {
//               userMatch.picks = 0;
//             }
//           }
//         })
//       }
//       user.save(err => {
//         if (err) {
//           return res.status(406).json(err);
//         }
//       });
//     }
//   });
// });

users.route('/:uid/locations/:lid').delete((req, res) => {
  User.findById(req.params.uid, (err, data) => {
    if (err) {
      return res.status(404).json(err);
    }
    if (!data) {
      return res.status(404).end();
    }
    const user = data;
    let locations = data.locations;
    locations = locations.filter(x => x._id != req.params.lid);
    user.locations = locations;
    user.save();
    User.findById(req.params.id, (err, data) => {
      if (err) {
        return res.status(400).json(err);
      }
      res.status(200).json(data);
    });
  });
});

users.route('/:id/locations/removeduplicates').get((req, res) => {
  User.findById(req.params.id, (err, data) => {
    if (err) {
      return res.status(404).json(err);
    }
    if (!data) {
      return res.status(404).end();
    }
    const user = data;
    let locations = data.locations;
    console.time('removeDuplicates');
    const uniqueLocations = MathUtils.removeDuplicateLocations(locations);
    // for (let i = 0; i < locations.length; i++) {
    //   const duplicate = uniqueLocations.find(
    //     x => x.latitude === locations[i].latitude && x.longitude === locations[i].longitude,
    //   );
    //   if (!duplicate) {
    //     uniqueLocations.push(locations[i]);
    //   }
    // }
    console.timeEnd('removeDuplicates');
    console.log(locations.length);
    console.log(uniqueLocations.length);
    user.locations = uniqueLocations;
    user.save();
    User.findById(req.params.id, (err, data) => {
      if (err) {
        return res.status(400).json(err);
      }
      res.status(200).json({
        before: locations.length,
        after: uniqueLocations.length,
      });
    });
  });
});

export default users;
