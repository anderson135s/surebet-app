const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Servir arquivos da pasta frontend (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'frontend')));

// Rota principal — carrega o index.html
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: path.join(__dirname, 'frontend') });
});

// Rota da API — retorna as surebets do arquivo surebets.json
app.get('/api/surebets', (req, res) => {
  try {
    const data = fs.readFileSync('surebets.json', 'utf8');
    const json = JSON.parse(data);

    if (!json.surebets || !Array.isArray(json.surebets)) {
      return res.json({ surebets: [] });
    }

    res.json(json);
  } catch (error) {
    console.error('Erro ao ler surebets.json:', error.message);
    res.status(500).json({ surebets: [], error: 'Erro ao ler o arquivo surebets.json.' });
  }
});

// Inicializa o servidor
app.listen(port, () => {
  console.log(`✅ Servidor rodando em http://localhost:${port}`);
});
