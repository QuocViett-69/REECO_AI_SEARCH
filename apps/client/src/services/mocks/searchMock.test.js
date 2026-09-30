import { mockSearch } from './searchMock';

jest.setTimeout(10000);

test('exact fixture query returns its captured results', async () => {
  const { status, body } = await mockSearch('CS655');
  expect(status).toBe(200);
  expect(body.results[0].model).toBe('CS655');
});

test('similar Vietnamese query without diacritics maps to a fixture', async () => {
  const { body } = await mockSearch('cam bien do do am dat');
  expect(body.results.length).toBeGreaterThan(0);
});

test('special queries preview error and empty states', async () => {
  expect((await mockSearch('!empty')).body.results).toEqual([]);
  expect((await mockSearch('!unavailable')).status).toBe(503);
  expect((await mockSearch('!invalid')).status).toBe(400);
  await expect(mockSearch('!error')).rejects.toThrow();
});

test('follow-up context keeps only scoped products', async () => {
  const { body } = await mockSearch('SDI-12', 10, {
    base_query: 'soil moisture sensor',
    previous_query: 'soil moisture sensor',
    product_ids: ['CSI_CS655'],
  });
  expect(body.context_applied).toBe(true);
  body.results.forEach((r) => expect(r.product_id).toBe('CSI_CS655'));
});
