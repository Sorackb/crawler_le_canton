/**
 * @file Realiza a interação com o site de buscar do Hotel Village Le Canton
 *
 * @author Lucas Bernardo
 *
 * @requires NPM:axios
 * @requires NPM:cheerio
 */

const { request } = require('axios');
const cheerio = require('cheerio');

/**
 * Aguarda o tempo determinado para completar a promessa
 *
 * @param {number} ms - O tempo em milisegundos para completar a promessa
 *
 * @returns {Promise<any>} Representação do tempo completado
 */
const sleep = ms => new Promise(res => setTimeout(res, ms));

/**
 * Tenta requisitar a URL usando até um máximo de vezes
 *
 * @param {string} url - A URL a requisitar
 * @param {object} opcoes - As opções a serem passadas para o axios
 * @param {number} tentativa - O número da tentativa atual
 * @param {number} delay - O tempo em milisegundos para aguardar antes de requisitar
 *
 * @returns {Promise<*|void>} Representação da requisitação completada
 *
 * @private
 */
const retry = async (url, opcoes, tentativa = 0, delay = 0) => {
  try {
    await sleep(delay);
    const { data } = await request({ url, ...opcoes });

    return data;
  } catch (e) {
    if (tentativa >= 5) throw e;

    return retry(url, opcoes, tentativa + 1, (delay || 1000) * 2);
  }
};

/**
 * Transforma um objeto em parâmetros para serem usados em uma URL
 *
 * @param {object} parametros Parâmetro a serem convertidos para URL
 *
 * @returns {string} Parâmetros devidamente formatados para URL
 */
const converter = (parametros) => Object.keys(parametros).map((chave) => encodeURIComponent(chave) + '=' + encodeURIComponent(parametros[chave])).join('&');

/**
 * Processa o HTML e retorna as informações disponíveis
 *
 * @param {string} html O HTML a ser analisado
 *
 * @returns {object} O objeto contendo as informações requisitadas
 */
const processar = async (html) => {
  const $ = cheerio.load(html);
  const resultado = [];

  $('.roomExcerpt').each((indice, elemento) => {
    const nome = $(elemento).find('h5 > a').text();
    const preco = $(elemento).find('.sincePriceContent h6').text();
    const descricao = $(elemento).find('p > a').text();

    resultado.push({
      nome,
      preco,
      descricao,
    })
  });

  return resultado;
};

/**
 * Busca os quartos disponíveis para as datas informadas
 *
 * @returns {Promise<*|void>} Representação da requisitação completada
 */
const buscar = async ({ checkin, checkout }) => {
  const opcoes = {
    headers: {
      Cookie: '__cfduid=deace4b4698962c027da7620cd4d295cf1545087939;ASP.NET_SessionId=cdzzwc2bkjp34vjfuthorxfr;',
    },
    withCredentials: true,
    method: 'GET',
    timeout: 30000,
  };

  const parametros = {
    ucUrl: 'SearchResultsByRoom',
    diff: 'false',
    CheckIn: `${checkin}`,
    CheckOut: `${checkout}`,
    Code: '',
    group_code: '',
    loyality_card: '',
    NRooms: '1',
    ad: '1',
    ch: '0',
    ag: '-',
    q: '5462',
    sid: '8f6b990c-a176-4e95-8bd6-3bb131efbacb',
    rnd: '1545232398058',
  };

  const resposta = await retry(`https://myreservations.omnibees.com/Handlers/ajaxLoader.ashx?${converter(parametros)}`, opcoes);
  const quartos = await processar(resposta);

  return { quartos };
};

module.exports = {
  buscar,
};