jest.mock('./mocks/searchMock', () => ({ isSearchMockEnabled: false }));

test.each([' \t\n ', '!@#$%^&*'])('invalid query never sends a search request: %s', async query => {
  const fetch = jest.spyOn(global, 'fetch');
  try {
    expect(await require('./api').searchProductsApi(query)).toEqual(expect.objectContaining({ error: 'invalid_input' }));
    expect(fetch).not.toHaveBeenCalled();
  } finally { fetch.mockRestore(); }
});

test('search aborts a stalled request and reports a retryable timeout', async () => {
  jest.useFakeTimers();
  const fetch = jest.spyOn(global, 'fetch').mockImplementation((_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () => reject(new Error('Aborted')));
  }));
  try {
    const { searchProductsApi } = require('./api');
    const pending = searchProductsApi('CS655');
    jest.advanceTimersByTime(45000);
    expect(await pending).toEqual(expect.objectContaining({ error: 'timeout' }));
  } finally {
    fetch.mockRestore();
    jest.useRealTimers();
  }
});

test('search uses the running site API port even when the build defaults to port 3000', async () => {
  const location = Object.getOwnPropertyDescriptor(window, 'location');
  const fetch = jest.spyOn(global, 'fetch');
  try {
    for (const [port, apiPort] of [['4173', '3100'], ['5173', '3000']]) {
      Object.defineProperty(window, 'location', {
        configurable: true, value: { hostname: '127.0.0.1', port },
      });
      let searchProductsApi;
      jest.isolateModules(() => { ({ searchProductsApi } = require('./api')); });
      fetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({
        query: 'CR1000X', mode: 'hybrid', results: [{ product_id: 'CSI_CR1000X', model: 'CR1000X' }],
      }) });
      const response = await searchProductsApi('CR1000X');
      expect(fetch).toHaveBeenLastCalledWith(`http://127.0.0.1:${apiPort}/api/v1/search`, expect.objectContaining({ method: 'POST' }));
      expect(response.results[0].model).toBe('CR1000X');
    }
  } finally {
    Object.defineProperty(window, 'location', location);
    fetch.mockRestore();
  }
});
