import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import users from './routes/users';
import lists from './routes/lists';
import coordinates from './routes/coordinates';
import user from './routes/user';
import login from './routes/login';
import location from './routes/location';

const app = express();
app.use(
  bodyParser.json({
    limit: '50mb',
  }),
);

app.use('/login', login);
app.use('/user', user);
app.use('/location', location);
app.use('/users', users);
app.use('/lists', lists);
app.use('/coordinates', coordinates);

app.listen(3000, err => {
  if (err) {
    return console.log(err);
  }
  console.log('Listening on port 3000');
});
