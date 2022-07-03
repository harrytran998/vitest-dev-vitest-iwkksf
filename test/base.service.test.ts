import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { prepareFetch, createMockApi } from 'vi-fetch';
import { generateApi } from '../src/base.service';

beforeAll(() => {
  prepareFetch(globalThis, 'fetch');
});

const baseUrl = 'http://localhost:3000';

describe('ClientBuilder generate API correctly', () => {
  const { mockFetch, mockGet } = createMockApi({ baseUrl });
  const client = generateApi(baseUrl, {
    headers: {
      'X-Factor': 'Harry Tran',
    },
  });

  beforeEach(() => {
    mockFetch.clearAll();
  });

  it('GET request', async () => {
    mockGet('/acquisitions').willResolve({ acquisitions: 'acquisitions' });
    const response = await client.acquisitions.get();
    expect(response).toStrictEqual({ acquisitions: 'acquisitions' });
  });
});
