const axios = require('axios');

const esportes = [
  'soccer_brazil_campeonato',
  'soccer_epl',
  'soccer_italy_serie_a',
  'soccer_spain_la_liga',
  'soccer_uefa_champs_league',
  'soccer_germany_bundesliga',
];

async function fetchOdds() {
  const investimento = 100;
  let encontrou = false;

  console.log('🔎 Buscando odds em várias ligas...\n');

  for (const esporte of esportes) {
    try {
      const res = await axios.get(`https://api.the-odds-api.com/v4/sports/${esporte}/odds`, {
        params: {
          apiKey: 'b92a7b358ef5f0b9bf200491db15d9ef',
          regions: 'eu',
          markets: 'h2h',
          oddsFormat: 'decimal',
        }
      });

      for (const jogo of res.data) {
        const mercados = [];

        for (const casa of jogo.bookmakers) {
          const mercado = casa.markets.find(m => m.key === 'h2h');
          if (!mercado || mercado.outcomes.length < 2) continue;

          mercados.push({
            casa: casa.title,
            time1: mercado.outcomes[0].name,
            odd1: mercado.outcomes[0].price,
            time2: mercado.outcomes[1].name,
            odd2: mercado.outcomes[1].price,
          });
        }

        for (let i = 0; i < mercados.length; i++) {
          for (let j = i + 1; j < mercados.length; j++) {
            const a = mercados[i];
            const b = mercados[j];

            if (a.time1 !== b.time2) continue;

            const soma = (1 / a.odd1) + (1 / b.odd2);
            if (soma < 1) {
              const invA = investimento * (1 / a.odd1) / soma;
              const invB = investimento - invA;
              const lucro = Math.min(invA * a.odd1, invB * b.odd2) - investimento;

              console.log(`⚡ SUREBET DETECTADA:`);
              console.log(`🎯 ${jogo.home_team} vs ${jogo.away_team} [${esporte}]`);
              console.log(`🏠 ${a.casa}: Aposte R$${invA.toFixed(2)} em ${a.time1} (Odd ${a.odd1})`);
              console.log(`🏠 ${b.casa}: Aposte R$${invB.toFixed(2)} em ${b.time2} (Odd ${b.odd2})`);
              console.log(`💰 Lucro garantido: R$${lucro.toFixed(2)}\n`);
              encontrou = true;
            }
          }
        }
      }

    } catch (err) {
      console.error(`Erro ao buscar ${esporte}:`, err.response?.data || err.message);
    }
  }

  if (!encontrou) {
    console.log('⚠️ Nenhuma surebet encontrada nas ligas analisadas.\n');
  }
}

fetchOdds();
