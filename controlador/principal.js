const modelo = require('../modelo/principal');

const FORMATO = /^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/im;

/**
 * Valida o formato de data e retorna em DDMMAAAA
 *
 * @param {string} data - A representação da data a ser validada no formato "DD/MM/AAAA"
 */
const tratar = async (data) => {
  if (!FORMATO.test(data)) {
    throw new Error('Formato de data inválido! Utilize o formato "DD/MM/AAAA".');
  }

  return data.replace(/\//g, '');
};

/**
 * Busca os quartos disponíveis para as datas informadas
 *
 * @param {object} req - O objeto representando a requisição
 * @param {object} res - O objeto representando a resposta
 *
 * @returns {Promise<*|void>} Representação da requisitação completada
 */
const buscar = async ({ body: { checkin, checkout } }, res) => {
  try {
    const [inicio, fim] = await Promise.all([tratar(checkin), tratar(checkout)]);
    res.send(await modelo.buscar({ checkin: inicio, checkout: fim }));
  } catch (e) {
    res.status(500).send(e.message || 'Ocorreu um erro interno');
  }
};

module.exports = {
  buscar,
};
