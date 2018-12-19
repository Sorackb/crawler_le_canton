const express = require('express');
const bodyParser = require('body-parser');
const principal = require('./rota/principal');

const app = express();

app.set('trust proxy', true);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', principal);

const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`Servidor GMC sendo executado na porta ${server.address().port}`);
});