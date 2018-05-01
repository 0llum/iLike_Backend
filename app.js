import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import users from './routes/users';
import lists from './routes/lists';

const app = express();
app.use(bodyParser.json());
app.use('/users', users);
app.use('/lists', lists);

app.listen(3000, err => {
  if (err) {
    return console.log(err);
  }
  console.log('Listening on port 3000');
});
