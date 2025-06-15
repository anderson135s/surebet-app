const express = require('express');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/surebets', (req, res) => {
  try {
    const data = fs.readFileSync('surebets.json', 'utf8');
    const json = JSON.parse(data);
    res.json(json);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao ler o arquivo surebets.json' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
