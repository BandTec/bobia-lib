const { GoogleGenAI } = require("@google/genai");

let cliente;

async function perguntar(pergunta, { apiKey, modelo = "gemini-2.5-flash", contexto } = {}) {
  const chave = apiKey || process.env.MINHA_CHAVE;
  if (!chave) throw new Error("BobIA: informe apiKey ou defina MINHA_CHAVE no .env");
  cliente ??= new GoogleGenAI({ apiKey: chave });

  const instrucao = "Você é um assistente de suporte N3. Responda em um parágrafo."
    + (contexto ? `\nDados atuais:\n${JSON.stringify(contexto)}` : "");

  const r = await cliente.models.generateContent({
    model: modelo,
    contents: pergunta,
    config: { systemInstruction: instrucao },
  });
  return r.text;
}

module.exports = { perguntar };