// Run with local staging online: node --test scripts/staging/local.test.mjs
import assert from 'node:assert/strict';
import test from 'node:test';

test('staging API permits browser searches from both staging sites only', async () => {
  for (const origin of [
    'http://127.0.0.1:4173',
    'http://127.0.0.1:4174',
    'http://untrusted.example',
  ]) {
    const response = await fetch('http://127.0.0.1:3100/api/v1/search', {
      method: 'OPTIONS',
      headers: {
        Origin: origin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type,authorization',
      },
      signal: AbortSignal.timeout(5000),
    });
    assert.equal(response.status, 204);
    assert.equal(
      response.headers.get('access-control-allow-origin'),
      origin === 'http://untrusted.example' ? null : origin,
      origin,
    );
  }
});
