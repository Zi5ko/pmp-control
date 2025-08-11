import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import http from 'http';

// Carga el servidor Express sin llamar listen en index.js (exporta app)
import app from '../index_app'; // crea este export simple del app si tu index.js hace listen directo
// Si no quieres tocar index.js, puedes crear un server temporal:
let server;

beforeAll(() => {
  server = http.createServer(app);
  server.listen(0);
});

afterAll(() => {
  server.close();
});

describe('Auth API', () => {
  it('rechaza login sin credenciales', async () => {
    const res = await request(server).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
  });

  it('login credenciales inválidas', async () => {
    const res = await request(server).post('/api/auth/login').send({ email: 'x@y.com', password: 'bad' });
    expect([400, 401]).toContain(res.status);
  });

  it('me sin token → 401', async () => {
    const res = await request(server).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
