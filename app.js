import 'babel-core/register';
import 'babel-polyfill';
import express from 'express';
import bodyParser from 'body-parser';
import user from './routes/user';
import login from './routes/login';
import location_2 from './routes/location_2';
import friend from './routes/friend';
import country from './routes/country';
import airport from './routes/airport';
import flight from './routes/flight';
import vacation from './routes/vacation';
import world from './routes/world';
import progress from './routes/progress';
import region from './routes/region';

const app = express();
app.use(
  bodyParser.json({
    limit: '50mb',
  }),
);

app.use('/login', login);
app.use('/user', user);
app.use('/location2', location_2);
app.use('/friend', friend);
app.use('/country', country);
app.use('/airport', airport);
app.use('/flight', flight);
app.use('/vacation', vacation);
app.use('/world', world);
app.use('/progress', progress);
app.use('/region', region);

app.listen(3000, (err) => {
  if (err) {
    return console.log(err);
  }
  console.log('Listening on port 3000');
});
