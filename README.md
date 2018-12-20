# Crawler: Hotel Village Le Canton

[![Build Status][ci-img]][ci]
[![Coverage Status][coveralls-img]][coveralls]

[ci-img]:          https://travis-ci.org/Sorackb/crawler_le_canton.svg
[ci]:              https://travis-ci.org/Sorackb/crawler_le_canton
[coveralls-img]:   https://coveralls.io/repos/github/Sorackb/crawler_le_canton/badge.svg?branch=master
[coveralls]:       https://coveralls.io/github/Sorackb/crawler_le_canton?branch=master

Robô de busca de preços de reserva em tempo real para o Hotel Village Le Canton.


## Instalação

Clone o respositório com o comando a seguir:

```
git clone https://github.com/Sorackb/crawler_le_canton.git
```

Navegue até a pasta:

```
cd crawler_le_canton
```

Instale as dependências:

```
npm i
```

## Execução

Para executar o servidor utilize o seguinte comando:

```
npm start
```

A porta padrão de execução do servidor é a `3000`. Para alterá-la altere o valor da variável de ambiente `PORT`. A execução com a porta `9696` seria como o seguinte exemplo:

```
set PORT=9696 && npm start
```

---

A execução é dada pelo endereço `http://[HOST]:[PORTA]`. No exemplo inicial a execução é dada por `http://localhost:3000`.

### Métodos Disponíveis

`POST /buscar`

### Parâmetros para o Corpo da Requisição

| Parâmetro | Requerido | Tipo | Formato | Exemplo |
| --- | --- | --- | --- | --- |
| checkin | Sim | String | DD/MM/AAAA | 21/12/2018 |
| checkout | Sim | String | DD/MM/AAAA | 22/12/2018 |

#### Exemplo:

```
POST /buscar HTTP/1.1
Host: 127.0.0.1:3000
Content-Type: application/json
cache-control: no-cache
{
	"checkin": "21/12/2018",
	"checkout": "22/12/2018"
}
```

### Resultado

Um `JSON` contendo um `array` nomeado como `quartos` em que cada elemento possui os seguinte atributos:

| Nome | Tipo | Observação |
| --- | --- | --- |
| nome | String | O nome do quarto |
| descricao | String | A descrição disponível sobre o quarto |
| precos | Array | Os preços encontrados para o quarto disponível |
| preco | Float | O menor preço encontrado |
| imagens | Array | Cada elemento do `array` representa o nome de uma imagem do quarto referido disponível na url `/imagens/[nome]`. Exemplo: `http://localhost:3000/imagens/152609.jpg` |

#### Exemplo:

```json
{
    "quartos": [
        {
            "nome": "Luxo Superior",
            "descricao": "Exclusividade e requinte. Todos os quartos luxo superior contam com Ar climatizado, TV LCD 32”, SKY, frigobar, telefone, cofre e secador ... ",
            "precos": [
                {
                    "descricao": "Tarifa",
                    "extras": "Não Reembolsável+Pensão Completa+Internet Wi-Fi+Estacionamento",
                    "preco": "R$ 1.575,00"
                }
            ],
            "preco": 1575,
            "imagens": [
                "152623.jpg",
                "152624.jpg",
                "152625.jpg"
            ]
        }
    ]
}
```

## Testes

Para iniciar a execução dos testes utilize o comando:

```
npm test
```