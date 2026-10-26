const { chromium } = require('C:/Users/ADMIN/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path = require('node:path');
const fs = require('node:fs');
(async () => {
  const browser = await chromium.launch({headless:true, executablePath:'C:/Users/ADMIN/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe'});
  try {
    const page=await browser.newPage({viewport:{width:1900,height:1800},deviceScaleFactor:2});
    await page.goto('http://127.0.0.1:8766/figures.html');
    await page.locator('.mxgraph svg').nth(11).waitFor();
    for(let i=0;i<12;i++) await page.locator('section').nth(i).screenshot({path:path.join(__dirname,'assets',`figure-${String(i+1).padStart(2,'0')}.png`)});
    console.log('Captured 12 high resolution diagram images');
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exit(1)});
