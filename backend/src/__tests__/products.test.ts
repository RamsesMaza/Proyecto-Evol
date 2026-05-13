import { describe, it, expect } from 'vitest';
import { productQuerySchema, createReviewSchema } from '../controllers/ProductController';

describe('Products Validation Schemas', () => {
  describe('productQuerySchema', () => {
    it('should apply defaults for empty query', () => {
      const result = productQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(12);
      }
    });

    it('should accept valid sort values', () => {
      const result = productQuerySchema.safeParse({ sort: 'price_asc' });
      expect(result.success).toBe(true);
    });

    it('should accept newest sort', () => {
      const result = productQuerySchema.safeParse({ sort: 'newest' });
      expect(result.success).toBe(true);
    });

    it('should reject invalid sort', () => {
      const result = productQuerySchema.safeParse({ sort: 'invalid' });
      expect(result.success).toBe(false);
    });

    it('should coerce string numbers', () => {
      const result = productQuerySchema.safeParse({ page: '3', limit: '24' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(3);
        expect(result.data.limit).toBe(24);
      }
    });
  });

  describe('createReviewSchema', () => {
    it('should accept valid review', () => {
      const result = createReviewSchema.safeParse({
        userName: 'Juan',
        rating: 5,
        comment: 'Excelente producto',
      });
      expect(result.success).toBe(true);
    });

    it('should reject rating > 5', () => {
      const result = createReviewSchema.safeParse({
        userName: 'Juan',
        rating: 6,
      });
      expect(result.success).toBe(false);
    });

    it('should reject rating < 1', () => {
      const result = createReviewSchema.safeParse({
        userName: 'Juan',
        rating: 0,
      });
      expect(result.success).toBe(false);
    });

    it('should work without comment', () => {
      const result = createReviewSchema.safeParse({
        userName: 'Juan',
        rating: 3,
      });
      expect(result.success).toBe(true);
    });
  });
});
