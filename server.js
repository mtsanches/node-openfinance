require("dotenv").config(); // carregar variáveis do .env

const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = process.env.SERVER_PORT || 3000;
const URL_PIX_IMEDIATO =
  process.env.URL_PIX_IMEDIATO || "https://httpbin.org/post";
const URL_PIX_AGENDADO =
  process.env.URL_PIX_AGENDADO || "https://httpbin.org/post";
const AUTH_URL = process.env.URL_TOKEN || "https://httpbin.org/post"; //https://auth.mockbank.openfinancebrasil.org.br/oauth2/token
const CLIENT_ID = process.env.MOCKBANK_CLIENT_ID || "mock-client-id";
const CLIENT_SECRET =
  process.env.MOCKBANK_CLIENT_SECRET || "mock-client-secret";
const SCOPE = "payments"; // escopo que libera APIs Pix

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Função para obter token OAuth2
async function getAccessToken() {
  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");
  params.append("client_id", CLIENT_ID);
  params.append("client_secret", CLIENT_SECRET);
  params.append("scope", SCOPE);

  const response = await fetch(AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Falha ao obter token: ${errText}`);
  }

  const data = await response.json();
  data.access_token = "token_valido";
  return data.access_token;
}

// Endpoint para Pix Imediato
app.post("/api/pix/imediato", async (req, res) => {
  try {
    const token = await getAccessToken();
    const { banco, chave, valor } = req.body;

    // Payload que será enviado para a API real
    const payload = {
      creditorAccount: {
        bank: banco || "mockbank",
        number: chave,
        accountType: "CACC",
      },
      instructedAmount: {
        amount: valor,
        currency: "BRL",
      },
      paymentDate: new Date().toISOString().split("T")[0], // hoje
    };

    // Exemplo: chamada para endpoint Pix do OpenFinance (mock)
    // Substitua pela URL real do banco
    const response = await fetch(
      URL_PIX_IMEDIATO, //"https://api.banco.com.br/openfinance/pix/imediato",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // usar token válido
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erro ao processar Pix Imediato", details: err.message });
  }
});

// Endpoint para Pix Agendado
app.post("/api/pix/agendado", async (req, res) => {
  try {
    const token = await getAccessToken();
    const { banco, chave, valor, data: dataAgendamento } = req.body;

    // Payload que será enviado para a API real
    const payload = {
      creditorAccount: {
        bank: banco || "mockbank",
        number: chave,
        accountType: "CACC",
      },
      instructedAmount: {
        amount: valor,
        currency: "BRL",
      },
      paymentDate: data, // data fornecida no form
    };

    const response = await fetch(URL_PIX_AGENDADO, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const dataResp = await response.json();
    res.status(response.status).json(dataResp);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erro ao processar Pix Agendado", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
