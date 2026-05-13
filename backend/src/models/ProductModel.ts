import { prisma } from '../lib/prisma';
import { NotFoundError, ValidationError } from '../shared/errors';
import type { Prisma } from '@prisma/client';

function normalizeProduct(p: any) {
  return {
    ...p,
    images: p.productImages?.length
      ? p.productImages.map((img: any) => img.url)
      : (() => { try { return p.images ? JSON.parse(p.images) : []; } catch { return []; } })(),
    specs: p.productSpecs?.length
      ? p.productSpecs.map((spec: any) => ({ label: spec.key, value: spec.value }))
      : (() => { try { return p.specs ? JSON.parse(p.specs) : []; } catch { return []; } })(),
  };
}

export const ProductModel = {
  async findMany(params: {
    where: Prisma.ProductWhereInput;
    orderBy: Prisma.ProductOrderByWithRelationInput;
    skip: number;
    take: number;
  }) {
    const products = await prisma.product.findMany({
      ...params,
      include: {
        category: true,
        productImages: { orderBy: { order: 'asc' } },
        productSpecs: true,
      },
    });
    return products.map(normalizeProduct);
  },

  count(where: Prisma.ProductWhereInput) {
    return prisma.product.count({ where });
  },

  async findById(id: number) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        reviews: { orderBy: { createdAt: 'desc' }, take: 10 },
        productImages: { orderBy: { order: 'asc' } },
        productSpecs: true,
      },
    });
    return product ? normalizeProduct(product) : null;
  },

  async findRelated(categoryId: number, excludeId: number) {
    const products = await prisma.product.findMany({
      where: { categoryId, id: { not: excludeId } },
      take: 4,
      include: {
        category: true,
        productImages: { orderBy: { order: 'asc' } },
        productSpecs: true,
      },
    });
    return products.map(normalizeProduct);
  },

  createReview(data: { productId: number; userName: string; rating: number; comment?: string }) {
    return prisma.review.create({ data });
  },

  updateRating(productId: number, rating: number, reviewCount: number) {
    return prisma.product.update({
      where: { id: productId },
      data: { rating, reviewCount },
    });
  },

  async list(query: {
    search?: string; categoryId?: number; minPrice?: number; maxPrice?: number;
    sort?: string; page: number; limit: number; featured?: string; offer?: string;
  }) {
    const where: Prisma.ProductWhereInput = {};

    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { name: { contains: query.search } },
        { description: { contains: query.search } },
      ];
    }
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.minPrice || query.maxPrice) {
      where.price = {};
      if (query.minPrice) where.price.gte = query.minPrice;
      if (query.maxPrice) where.price.lte = query.maxPrice;
    }
    if (query.featured === 'true') where.isFeatured = true;
    if (query.offer === 'true') where.isOffer = true;

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    switch (query.sort) {
      case 'price_asc': orderBy = { price: 'asc' }; break;
      case 'price_desc': orderBy = { price: 'desc' }; break;
      case 'oldest': orderBy = { createdAt: 'asc' }; break;
      case 'rating': orderBy = { rating: 'desc' }; break;
      case 'name': orderBy = { title: 'asc' }; break;
    }

    const skip = (query.page - 1) * query.limit;
    const [products, total] = await Promise.all([
      this.findMany({ where, orderBy, skip, take: query.limit }),
      this.count(where),
    ]);

    return {
      products,
      pagination: {
        page: query.page, limit: query.limit, total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  },

  async getById(id: number) {
    const product = await this.findById(id);
    if (!product) throw new NotFoundError('Producto');

    const related = await this.findRelated(product.categoryId, product.id);
    return { ...product, related };
  },

  async createReviewForProduct(productId: number, data: { userName: string; rating: number; comment?: string }) {
    const product = await this.findById(productId);
    if (!product) throw new NotFoundError('Producto');

    if (!data.userName || data.rating < 1 || data.rating > 5) {
      throw new ValidationError('Nombre y calificación (1-5) son requeridos');
    }

    await this.createReview({ productId, ...data });

    const agg = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: true,
    });

    await this.updateRating(productId, agg._avg.rating ?? 0, agg._count);
    return { message: 'Reseña creada exitosamente' };
  },
};
