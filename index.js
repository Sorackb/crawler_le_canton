/* eslint-disable no-console */
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const principal = require('./rota/principal');

const app = express();

app.set('trust proxy', true);
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
// URLs que não sejam de serviço são entregues como arquivos públicos dentro da pasta "publico"
app.use(express.static('./publico'));
app.use('/', principal);

const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`Servidor GMC sendo executado na porta ${server.address().port}`);
});

const parar = async () => {
  server.close();
};

// Para realizar os testes
module.exports = app;
module.exports.parar = parar;
