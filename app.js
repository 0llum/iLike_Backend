import express from 'express';
import * as Lists from './Lists';
const app = express();
app.get('/lists', (req, res) =>
  res.json(Lists.default)
);

const server = app.listen(3000, () => {
  const { address, port } = server.address();
  console.log('Listening at ' + address + ':' + port);
});