const modelo = require('../modelo/principal');

const tratar = async (data) => {
  return data.replace(/\//g, '');
};

const buscar = async ({ body: { checkin, checkout } }, res) => {
  try {
    const [inicio, fim] = await Promise.all([tratar(checkin), tratar(checkout)]);
    res.send(await modelo.buscar({ checkin: inicio, checkout: fim }));
  } catch(e) {
    console.error(e.stack);
    res.status(500).send('Ocorreu um erro interno');
  }
};

module.exports = {
  buscar,
};