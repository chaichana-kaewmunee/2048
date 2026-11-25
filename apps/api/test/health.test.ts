import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app';

describe('health API', () => {
  it('returns a versioned health response without player data', async () => {
    const response = await createApp().handle(new Request('http://localhost/api/v1/health'));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      status: 'ok',
      service: 'neon-fusion-api',
      version: '1.0.0',
    });
  });

  it('returns a structured 404 for an unknown API route', async () => {
    const response = await createApp().handle(new Request('http://localhost/api/v1/missing'));

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: 'not_found' });
  });

  it('allows configured CORS origins', async () => {
    const response = await createApp().handle(
      new Request('http://localhost/api/v1/health', {
        headers: { Origin: 'https://neon.example' },
      }),
    );

    expect(response.headers.get('access-control-allow-origin')).toBe('*');
  });
});
