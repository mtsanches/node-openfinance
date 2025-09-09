const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Endpoint para Pix Imediato
app.post("/api/pix/imediato", async (req, res) => {
  try {
    const { banco, chave, valor } = req.body;

    // Payload que será enviado para a API real
    const payload = {
      banco,
      chave,
      valor,
      tipo: "imediato",
    };

    // Exemplo: chamada para endpoint Pix do OpenFinance (mock)
    // Substitua pela URL real do banco
    const response = await fetch(
      "https://httpbin.org/post", //"https://api.banco.com.br/openfinance/pix/imediato",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          //Authorization: `Bearer ${process.env.OPENFINANCE_TOKEN}`, // usar token válido
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erro ao processar Pix Imediato", details: err.message });
  }
});

// Endpoint para Pix Agendado
app.post("/api/pix/agendado", async (req, res) => {
  try {
    const { banco, chave, valor, data: dataAgendamento } = req.body;

    // Payload que será enviado para a API real
    const payload = {
      banco,
      chave,
      valor,
      dataAgendamento,
      tipo: "agendado",
    };

    const response = await fetch(
      "https://api.banco.com.br/openfinance/pix/agendado",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENFINANCE_TOKEN}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erro ao processar Pix Agendado", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
