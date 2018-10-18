import express from 'express';
import bodyParser from 'body-parser';
import user from './routes/user';
import login from './routes/login';
import location from './routes/location';
import friend from './routes/friend';
import country from './routes/country';

const app = express();
app.use(
  bodyParser.json({
    limit: '50mb',
  }),
);

app.use('/login', login);
app.use('/user', user);
app.use('/location', location);
app.use('/friend', friend);
app.use('/country', country);

app.listen(3000, err => {
  if (err) {
    return console.log(err);
  }
  console.log('Listening on port 3000');
});
