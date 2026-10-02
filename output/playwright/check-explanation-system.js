async (page) => {
  await page.route('http://localhost:3000/api/v1/**', route => route.continue({ url: route.request().url().replace('localhost:3000', 'localhost:3010') }));
  await page.goto('http://localhost:5173');
  await page.getByRole('textbox', { name: 'Tìm kiếm cảm biến khí tượng, quan trắc mực nước, datalogger...' }).fill('I want a system to monitor soil moisture and rainfall remotely');
  await page.getByRole('button', { name: 'Tìm kiếm', exact: true }).click();
  await page.getByRole('region', { name: 'Search guidance' }).waitFor({ timeout: 60000 });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: 'output/playwright/system-explanation-desktop.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'output/playwright/system-explanation-mobile.png' });
  const selected = await page.locator('#searchResults article').last().getAttribute('aria-label');
  await page.getByRole('button', { name: 'Explain this model for my needs', exact: true }).last().click();
  await page.waitForFunction(() => document.querySelectorAll('#searchResults article').length === 1, null, { timeout: 60000 });
  const actual = await page.locator('#searchResults article').getAttribute('aria-label');
  if (actual !== selected) throw new Error(`Wrong selected model: ${selected} -> ${actual}`);
  console.log(JSON.stringify({ selectedModel: actual, resultCount: 1, scopedExplanation: true }));
  await page.locator('#searchResults article').scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'output/playwright/selected-model-explanation-mobile.png' });
}
