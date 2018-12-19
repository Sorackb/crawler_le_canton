const modelo = require('../modelo/principal');

const buscar = async ({ body: { checkin, checkout } }, res) => {
  try {
    res.send(await modelo.buscar({ checkin, checkout }));
  } catch(e) {
    console.error(e.stack);
    res.status(500).send('Ocorreu um erro interno');
  }
};

module.exports = {
  buscar,
};