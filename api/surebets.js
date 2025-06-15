const fs = require('fs');
const path = require('path');

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const filePath = path.resolve(process.cwd(), 'surebets.json');
    const data = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(data);

    if (!json.surebets || !Array.isArray(json.surebets)) {
      return res.json({ surebets: [] });
    }

    res.status(200).json({ surebets: json.surebets });
  } catch (error) {
    console.error('Erro ao ler surebets.json:', error.message);
    res.status(500).json({ surebets: [], erro: 'Erro ao ler o arquivo surebets.json.' });
  }
}
