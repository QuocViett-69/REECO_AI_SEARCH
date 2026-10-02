// Test setup for Jest / jsdom
if (typeof global.fetch === 'undefined' || !global.fetch._isMockFunction) {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ recommendations: [] }),
      text: () => Promise.resolve(''),
    })
  );
}
