async (page) => {
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  await page.getByRole('textbox', { name: 'Tìm kiếm cảm biến khí tượng,' }).fill('thiết bị truyền dữ liệu qua cellular');
  const pending = page.waitForResponse(r => r.url().endsWith('/search') && r.request().method() === 'POST');
  await page.getByRole('button', { name: 'Tìm kiếm', exact: true }).click();
  const response = await pending;
  const result = { status: response.status(), body: await response.json() };
  await page.locator('.skeleton-card').waitFor({ state: 'hidden' });
  await page.evaluate(value => sessionStorage.setItem('search-qa-cellular-retry', JSON.stringify(value)), result);
  await page.screenshot({ path: 'output/playwright/cellular-retry.png', fullPage: true, animations: 'disabled' });
}
