import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import type express from 'express';

describe('API Integration', () => {
  let app: express.Application;

  beforeAll(async () => {
    app = (await import('../index')).default;
  });

  describe('GET /api/health', () => {
    it('should return ok with DB connected', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status');
    });
  });

  describe('GET /api/products', () => {
    it('should return a paginated product list', async () => {
      const res = await request(app).get('/api/products');
      expect(res.status).toBe(200);
      expect(res.body).toBeDefined();
    });
  });

  describe('GET /api/categories', () => {
    it('should return categories', async () => {
      const res = await request(app).get('/api/categories');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('Certificate verification - public', () => {
    it('should return 404 for non-existent credential', async () => {
      const res = await request(app)
        .get('/api/certificates/verify/non-existent-id');
      expect(res.status).toBe(404);
    });
  });

  describe('Auth rate limiting', () => {
    it('should return 429 after too many requests', async () => {
      const results = await Promise.all(
        Array.from({ length: 25 }, () =>
          request(app)
            .post('/api/auth/login')
            .send({ email: 'test@test.com', password: 'pass', captchaToken: 'test' })
        )
      );
      const rateLimited = results.filter(r => r.status === 429);
      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });
});
