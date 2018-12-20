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
const { writeFileSync } = require('fs');
const { resolve } = require('path');

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
const requisitar = async (url, opcoes, tentativa = 0, delay = 0) => {
  try {
    await sleep(delay);
    const { data, headers: { 'set-cookie': cookies } } = await request({ url, ...opcoes });

    return { data, cookies };
  } catch (e) {
    if (tentativa >= 5) throw e;

    return requisitar(url, opcoes, tentativa + 1, (delay || 1000) * 2);
  }
};

/**
 * Transforma um objeto em parâmetros para serem usados em uma URL
 *
 * @param {object} parametros Parâmetro a serem convertidos para URL
 *
 * @returns {string} Parâmetros devidamente formatados para URL
 */
const converter = parametros => Object.keys(parametros).map(chave => `${encodeURIComponent(chave)}=${encodeURIComponent(parametros[chave])}`).join('&');

/**
 * Baixa as imagens referentes ao quarto
 *
 * @param {array} links - Links das imagens
 * @param {array} cookies - Cookies para realizar o download
 *
 * @returns {Promise<*|void>} Representação dos nomes dos arquivos baixados
 *
 * @private
 */
const baixar = async (links, cookies) => {
  const promessas = links.map(async (link) => {
    const opcoes = {
      headers: {
        'Content-Type': 'image/jpeg',
        Cookie: cookies.map(cookie => cookie.substr(0, cookie.indexOf(';'))).join(';'),
      },
      responseType: 'arraybuffer',
      withCredentials: true,
      method: 'GET',
      timeout: 0,
    };

    const partes = link.split('=');
    const nome = partes[partes.length - 1];
    const { data } = await requisitar(`https://myreservations.omnibees.com${link}`, opcoes);
    writeFileSync(resolve('publico/imagens', nome), Buffer.from(data, 'binary'), 'binary');
    return nome;
  });

  return Promise.all(promessas);
};

/**
 * Processa o HTML e retorna as informações disponíveis
 *
 * @param {string} html - O HTML a ser analisado
 *
 * @returns {object} O objeto contendo as informações requisitadas
 *
 * @private
 */
const processar = async (html, cookies) => {
  const $ = cheerio.load(html);
  const quartos = [];
  const promessas = [];
  let quarto;

  $('table.maintable > tbody > tr').each((indice, elemento) => {
    // Cria um quarto
    if ($(elemento).hasClass('roomName')) {
      const nome = $(elemento).find('h5 > a').text();
      const descricao = $(elemento).find('p > a').text();

      const links = $(elemento).find('img').map((index, img) => $(img).attr('src')).get();
      promessas.push(baixar(links, cookies));

      quarto = {
        nome,
        descricao,
        precos: [],
      };

      quartos.push(quarto);
    } else if ($(elemento).hasClass('item')) { // Insere as informações de preço do último quarto
      const descricao = $(elemento).find('.rateName > a').text();
      const extras = $(elemento).find('.extras').text().replace(/\n/g, ' ')
        .replace(/[ ]{2,}/g, ' ')
        .trim();
      const preco = $(elemento).find('.ratePriceTable').text().replace(/\n/g, '');
      const valor = parseFloat($(elemento).find('.priceDecimal').val());

      // Insere o menor preço
      quarto.preco = quarto.preco && quarto.preco > valor ? quarto.preco : valor;

      quarto.precos.push({
        descricao,
        extras,
        preco,
      });
    }
  });

  // Aguarda o download das imagens para inserir os nomes nos quartos
  const imagens = await Promise.all(promessas);

  // Organiza os nomes das imagens em seus respectivos quartos
  for (let indice = 0; indice < imagens.length; indice += 1) {
    quartos[indice].imagens = imagens[indice];
  }

  return quartos;
};

/**
 * Busca os quartos disponíveis para as datas informadas
 *
 * @returns {Promise<*|void>} Representação da requisitação completada
 */
const buscar = async ({ checkin, checkout }) => {
  const opcoes = {
    withCredentials: true,
    method: 'GET',
    timeout: 30000,
  };

  let parametros = {
    q: '5462',
    version: 'MyReservation',
  };

  // Faz a primeira requisição para conseguir os cookies e um sid válido
  const { data, cookies } = await requisitar(`https://myreservations.omnibees.com/default.aspx?${converter(parametros)}`, opcoes);
  const inicio = data.indexOf("CheckSession('") + "CheckSession('".length;
  const sid = data.substring(inicio, data.indexOf("'", inicio + "CheckSession('".length));

  // Adiciona o sid aos cookies
  cookies.push(`${sid}_window=${sid}`);

  opcoes.headers = {
    Cookie: cookies.map(cookie => cookie.substr(0, cookie.indexOf(';'))).join(';'),
  };

  delete parametros.version;

  parametros = {
    ...parametros,
    sid,
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
    rnd: '1545232398058',
  };

  // Realiza a requisição buscando pelos parâmetros desejados
  const { data: resposta } = await requisitar(`https://myreservations.omnibees.com/Handlers/ajaxLoader.ashx?${converter(parametros)}`, opcoes);
  const quartos = await processar(resposta, cookies);

  return { quartos };
};

module.exports = {
  buscar,
};
