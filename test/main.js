const chai = require('chai');
const chaiHttp = require('chai-http');

const servidor = require('../');

chai.use(chaiHttp);
chai.should();

describe('/POST buscar', () => {
  it('Deve buscar as informações de quartos disponíveis', function(done) {
    this.timeout(30000);

    chai.request(servidor).post('/buscar').send({ checkin: '25/12/2018', checkout: '26/12/2018' }).end(function(err, res) {
      res.should.have.status(200);
      res.body.should.be.a('object');

      done();
    });
  });

  it('Não deve retornar informações', function(done) {
    this.timeout(30000);

    chai.request(servidor).post('/buscar').send({ checkin: '18/12/2018', checkout: '19/12/2018' }).end(function(err, res) {
      res.should.have.status(200);
      res.body.should.be.a('object');

      done();
    });
  });

  it('O formato de data deve ser inválido para o serviço', function(done) {
    this.timeout(30000);

    chai.request(servidor).post('/buscar').send({ checkin: 'AA/12/2018', checkout: 'AA/12/2018' }).end(function(err, res) {
      res.should.have.status(500);

      done();
    });
  });

  after(async () => {
    await servidor.parar();
  });
});