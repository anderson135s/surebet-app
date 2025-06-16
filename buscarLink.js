const puppeteer = require('puppeteer');

async function buscarLinkBetano(jogo) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto('https://www.betano.com/', { timeout: 0 });

    // Espera um tempo manual para você clicar na lupa
    console.log('🕐 Você tem 10 segundos para abrir a busca manualmente...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Agora tenta encontrar o campo de busca visível
    await page.type('input[type="text"]', jogo);
    await new Promise(resolve => setTimeout(resolve, 3000));

    const link = await page.evaluate(() => {
      const el = document.querySelector('a[href*="/sports/event"]');
      return el ? el.href : null;
    });

    console.log(`🔗 Link encontrado para "${jogo}": ${link || 'Nenhum link encontrado'}`);
    await browser.close();
    return link;

  } catch (err) {
    console.error('❌ Erro ao buscar link:', err.message);
    await browser.close();
    return null;
  }
}

// Teste
buscarLinkBetano('Flamengo');
