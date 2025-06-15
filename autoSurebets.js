const axios = require('axios');
const fs = require('fs');

const esportes = [
  'soccer_brazil_campeonato',
  'soccer_epl',
  'soccer_italy_serie_a',
  'soccer_spain_la_liga',
  'soccer_uefa_champs_league',
  'soccer_germany_bundesliga',
];

const investimento = 100;

async function buscarSurebets() {
  const agora = new Date();
  const hora = agora.getHours();

  if (hora < 9 || hora >= 15) {
    console.log(`⏳ Fora do horário permitido. Próxima verificação em 30 minutos... (${agora.toLocaleTimeString()})`);
    return;
  }

  console.log(`🕒 Rodando análise às ${agora.toLocaleTimeString()}`);
  const resultados = [];

  for (const esporte of esportes) {
    try {
      const res = await axios.get(`https://api.the-odds-api.com/v4/sports/${esporte}/odds`, {
        params: {
          apiKey: 'b92a7b358ef5f0b9bf200491db15d9ef',
          regions: 'eu',
          markets: 'h2h,totals,spreads',
          oddsFormat: 'decimal'
        }
      });

      for (const jogo of res.data) {
        const dataJogo = new Date(jogo.commence_time);
        const diasFaltando = (dataJogo - agora) / (1000 * 60 * 60 * 24);
        if (diasFaltando > 3) continue;

        for (const casa of jogo.bookmakers) {
          for (const mercado of casa.markets) {
            if (mercado.outcomes.length < 2) continue;

            for (let i = 0; i < jogo.bookmakers.length; i++) {
              for (let j = i + 1; j < jogo.bookmakers.length; j++) {
                const casa1 = jogo.bookmakers[i];
                const casa2 = jogo.bookmakers[j];

                const mkt1 = casa1.markets.find(m => m.key === mercado.key);
                const mkt2 = casa2.markets.find(m => m.key === mercado.key);

                if (!mkt1 || !mkt2 || mkt1.outcomes.length < 2 || mkt2.outcomes.length < 2) continue;

                const a = {
                  casa: casa1.title,
                  time1: mkt1.outcomes[0].name,
                  odd1: mkt1.outcomes[0].price,
                };

                const b = {
                  casa: casa2.title,
                  time2: mkt2.outcomes[1].name,
                  odd2: mkt2.outcomes[1].price,
                };

                const soma = (1 / a.odd1) + (1 / b.odd2);
                if (soma < 1) {
                  const invA = investimento * (1 / a.odd1) / soma;
                  const invB = investimento - invA;
                  const lucro = Math.min(invA * a.odd1, invB * b.odd2) - investimento;

                  resultados.push({
                    jogo: `${jogo.home_team} vs ${jogo.away_team}`,
                    liga: jogo.sport_title || esporte,
                    mercado: mercado.key,
                    casa1: a.casa,
                    time1: a.time1,
                    odd1: a.odd1,
                    casa2: b.casa,
                    time2: b.time2,
                    odd2: b.odd2,
                    inv1: invA.toFixed(2),
                    inv2: invB.toFixed(2),
                    lucro: lucro.toFixed(2)
                  });
                }
              }
            }
          }
        }
      }

    } catch (err) {
      console.error(`❌ Erro ao buscar odds de ${esporte}:`, err.response?.data || err.message);
    }
  }

  // Salva as surebets no arquivo
  fs.writeFileSync('surebets.json', JSON.stringify({ atualizado: new Date(), surebets: resultados }, null, 2));
  console.log(`✅ ${resultados.length} surebets salvas no arquivo surebets.json\n`);
}

// Executa agora e a cada 30 minutos
buscarSurebets();
setInterval(buscarSurebets, 30 * 60 * 1000);
