const puppeteer = require('puppeteer');
const axios = require('axios');

(async () => {
  const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
  const page = await browser.newPage();

  // Acessar página de futebol da Betano
await page.goto('https://www.betano.com/sport/futebol/', {
  waitUntil: 'domcontentloaded',
  timeout: 60000
});

// Espera um pouco para evitar redirecionamento
await new Promise(resolve => setTimeout(resolve, 5000));

// Faz scroll suave para baixo
await page.evaluate(() => {
  window.scrollTo(0, document.body.scrollHeight);
});

// Espera carregar os novos elementos
await new Promise(resolve => setTimeout(resolve, 10000));


  // Extrair odds
  const odds = await page.evaluate(() => {
    const eventos = document.querySelectorAll('[class*="eventRow"]');
    const lista = [];

    eventos.forEach(evento => {
      const times = evento.querySelectorAll('[class*="participant__name"]');
      const oddEl = evento.querySelectorAll('[class*="selection__odd"]');

      if (times.length >= 2 && oddEl.length >= 2) {
        lista.push({
          time1: times[0]?.innerText?.trim(),
          time2: times[1]?.innerText?.trim(),
          odd1: parseFloat(oddEl[0]?.innerText?.replace(',', '.') || 0),
          odd2: parseFloat(oddEl[1]?.innerText?.replace(',', '.') || 0)
        });
      }
    });

    return lista[0]; // Pega o primeiro evento
  });
console.log('Resultado parcial:', odds);

  await browser.close();

  
})();
