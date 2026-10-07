# BobIA

Pergunte à IA e receba a resposta em uma linha de código. O BobIA é uma biblioteca Node.js que envolve a API do Google Gemini e foi criada para a disciplina de **Arquitetura Computacional** da Faculdade São Paulo Tech School - SPTech, como apoio ao analista de suporte N3 do projeto de IoT.

```js
const { perguntar } = require("bobia");

perguntar("O que é um byte?").then(console.log);
```

## Requisitos

- Node.js **20 ou superior** (`node -v` mostra a versão instalada)
- Uma chave de API do Google Gemini, criada gratuitamente no [Google AI Studio](https://aistudio.google.com/apikey)

## Instalação

```bash
npm install bobia
```

## Configuração da chave

O BobIA lê a chave da variável de ambiente `MINHA_CHAVE`. Crie (ou edite) o arquivo `.env` do **seu projeto**:

```env
MINHA_CHAVE='cole_aqui_a_sua_chave'
```

A biblioteca **não** carrega o arquivo `.env` sozinha. Quem carrega é o seu projeto, com o `dotenv`, antes de chamar o BobIA:

```js
require("dotenv").config();   // no topo do seu app.js
```

> **Nunca envie a chave para o GitHub.** Adicione `.env` ao `.gitignore` antes do primeiro `git push`.

## Uso rápido

```js
require("dotenv").config();
const { perguntar } = require("bobia");

perguntar("O que é um byte?")
  .then((resposta) => console.log(resposta))
  .catch((erro) => console.error(erro.message));
```

## Uso em uma API Express

Rota (`src/routes/bobia.js`):

```js
var express = require("express");
var router = express.Router();
var bobiaController = require("../controllers/bobiaController");

router.post("/perguntar", function (req, res) {
    bobiaController.perguntar(req, res);
});

module.exports = router;
```

Controller (`src/controllers/bobiaController.js`):

```js
var bobia = require("bobia");

function perguntar(req, res) {
    var pergunta = req.body.pergunta;

    if (pergunta == undefined || pergunta.trim() == "") {
        return res.status(400).send("Sua pergunta está undefined ou vazia!");
    }

    bobia.perguntar(pergunta).then(function (resposta) {
        res.status(200).json({ resposta: resposta });
    }).catch(function (erro) {
        res.status(500).json(erro.message);
    });
}

module.exports = { perguntar };
```

No `app.js`: `app.use("/bobia", bobiaRouter);`. Teste com `POST /bobia/perguntar` e o corpo `{ "pergunta": "O que é um byte?" }`.

## API

### `perguntar(pergunta, opcoes?)`

Envia a pergunta ao Gemini e devolve uma `Promise` com a resposta em texto (um parágrafo).

| Parâmetro | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `pergunta` | `string` | sim | O texto da pergunta. |
| `opcoes.apiKey` | `string` | não | Chave da API. Se omitida, usa `process.env.MINHA_CHAVE`. |
| `opcoes.modelo` | `string` | não | Modelo do Gemini. Padrão: `"gemini-2.5-flash"`. |
| `opcoes.contexto` | qualquer valor serializável em JSON | não | Dados que a IA deve considerar na resposta (por exemplo, as últimas leituras de um sensor). |

**Retorno:** `Promise<string>`.

**Erros:** a `Promise` é rejeitada se não houver chave (`BobIA: informe apiKey ou defina MINHA_CHAVE no .env`) ou se a API do Google recusar a chamada.

### Exemplo com contexto

```js
const leituras = [
  { temperatura: 24, momento: "10:01:00" },
  { temperatura: 31, momento: "10:02:00" },
];

perguntar("A temperatura está normal?", { contexto: leituras })
  .then(console.log);
```

### Exemplo trocando o modelo

```js
perguntar("O que é um byte?", { modelo: "gemini-2.5-flash-lite" });
```

## Problemas comuns

| Mensagem ou sintoma | Causa provável | O que fazer |
|---|---|---|
| `BobIA: informe apiKey ou defina MINHA_CHAVE no .env` | A variável não chegou ao processo. | Confira o nome `MINHA_CHAVE` no `.env` e se o seu app chama `require("dotenv").config()` **antes** de usar o BobIA. |
| `Cannot find module 'bobia'` | A biblioteca não está instalada neste projeto. | Rode `npm install bobia` na pasta do projeto. |
| Erro vindo do Google (chave inválida, modelo indisponível) | Chave errada, ou o modelo não está liberado para a sua chave. | Gere uma nova chave no AI Studio ou passe outro modelo em `opcoes.modelo`. |

Sobre modelos: a página de deprecações do Google informa que o acesso aos modelos da família 2.5 está limitado a quem já os utilizou. Uma chave recém-criada pode ser recusada, e nesse caso o parâmetro `modelo` resolve. Consulte a [lista de modelos e deprecações](https://ai.google.dev/gemini-api/docs/deprecations).

## Como funciona

O BobIA usa o pacote oficial [`@google/genai`](https://www.npmjs.com/package/@google/genai). A cada chamada, envia a pergunta junto de uma instrução fixa ("Você é um assistente de suporte N3. Responda em um parágrafo.") e, se houver, o `contexto` convertido para JSON.

## Licença

[MIT](LICENSE) © 2026 Matheus Matos | São Paulo Tech School - SPTech.
