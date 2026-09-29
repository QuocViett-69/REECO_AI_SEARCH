async (page) => {
  const queries = ['CS655', 'soil moisture sensor', 'cảm biến đo độ ẩm đất', 'soil sensor with SDI-12', 'cảm biến độ ẩm đất hỗ trợ SDI-12 và đo nhiệt độ đất', 'thiết bị dùng để quan trắc độ ẩm đất ngoài đồng', 'sensor suitable for harsh outdoor environments', 'thiết bị hoạt động ở nhiệt độ -50°C', 'thiết bị truyền dữ liệu qua cellular', 'datalogger có Wi-Fi', 'cảm biến đo nhiệt độ độ ẩm và áp suất không khí', 'cảm biến đo độ đục của nước', 'thiết bị đọc cảm biến vibrating wire', 'nguồn cấp cho hệ thống Campbell ngoài hiện trường', 'tôi cần cảm biến để theo dõi độ ẩm đất và nhiệt độ đất, ưu tiên giao tiếp SDI-12'];
  const results = [];
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (let i = 0; i < queries.length; i++) {
    if (await page.getByRole('button', { name: 'Edit', exact: true }).isVisible()) await page.getByRole('button', { name: 'Edit', exact: true }).click();
    await page.getByRole('textbox', { name: 'Tìm kiếm cảm biến khí tượng,' }).fill(queries[i]);
    const start = Date.now();
    const responsePromise = page.waitForResponse(r => r.url().endsWith('/search') && r.request().method() === 'POST', { timeout: 90000 });
    await page.getByRole('button', { name: 'Tìm kiếm', exact: true }).click();
    try {
      const response = await responsePromise;
      const body = await response.json();
      await page.locator('.skeleton-card').waitFor({ state: 'hidden', timeout: 15000 });
      const cards = await page.locator('.product-result-card').evaluateAll(nodes => nodes.map(n => ({ model: n.getAttribute('data-model'), text: n.innerText })));
      const row = { case: i + 1, query: queries[i], status: response.status(), elapsedMs: Date.now() - start, request: response.request().postDataJSON(), body, cards, ui: await page.locator('#searchResults').innerText() };
      results.push(row);
      await page.evaluate(value => sessionStorage.setItem('search-qa-15', JSON.stringify(value)), results);
      console.log('CASE_RESULT ' + JSON.stringify(row));
      await page.screenshot({ path: 'output/playwright/search-case-' + String(i + 1).padStart(2, '0') + '.png', fullPage: true, animations: 'disabled' });
    } catch (error) {
      console.log('CASE_ERROR ' + JSON.stringify({ case: i + 1, query: queries[i], error: error.message }));
      throw error;
    }
  }
  console.log('BROWSER_ERRORS ' + JSON.stringify(errors));
  await page.evaluate(value => sessionStorage.setItem('search-qa-errors', JSON.stringify(value)), errors);
}
