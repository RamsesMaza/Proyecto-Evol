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

  async create(data: {
    title: string; name?: string; description?: string; fullDescription?: string;
    price: number; oldPrice?: number; categoryId: number; image?: string; stock?: number;
    isNew?: boolean; isFeatured?: boolean; isOffer?: boolean;
    images?: string[]; specs?: { key: string; value: string }[];
  }) {
    const product = await prisma.product.create({
      data: {
        title: data.title,
        name: data.name || data.title,
        description: data.description || '',
        fullDescription: data.fullDescription,
        price: data.price,
        oldPrice: data.oldPrice,
        categoryId: data.categoryId,
        image: data.image,
        stock: data.stock ?? 0,
        isNew: data.isNew ?? false,
        isFeatured: data.isFeatured ?? false,
        isOffer: data.isOffer ?? false,
        ...(data.images?.length ? {
          productImages: { create: data.images.map((url, i) => ({ url, order: i })) },
        } : {}),
        ...(data.specs?.length ? {
          productSpecs: { create: data.specs.map(s => ({ key: s.key, value: s.value })) },
        } : {}),
      },
      include: { category: true, productImages: { orderBy: { order: 'asc' } }, productSpecs: true },
    });
    return normalizeProduct(product);
  },

  async update(id: number, data: {
    title?: string; name?: string; description?: string; fullDescription?: string;
    price?: number; oldPrice?: number | null; categoryId?: number; image?: string | null; stock?: number;
    isNew?: boolean; isFeatured?: boolean; isOffer?: boolean;
    images?: string[]; specs?: { key: string; value: string }[];
  }) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Producto');

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.fullDescription !== undefined) updateData.fullDescription = data.fullDescription;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.oldPrice !== undefined) updateData.oldPrice = data.oldPrice;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.stock !== undefined) updateData.stock = data.stock;
    if (data.isNew !== undefined) updateData.isNew = data.isNew;
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
    if (data.isOffer !== undefined) updateData.isOffer = data.isOffer;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...updateData,
        ...(data.images ? {
          productImages: { deleteMany: {}, create: data.images.map((url, i) => ({ url, order: i })) },
        } : {}),
        ...(data.specs ? {
          productSpecs: { deleteMany: {}, create: data.specs.map(s => ({ key: s.key, value: s.value })) },
        } : {}),
      },
      include: { category: true, productImages: { orderBy: { order: 'asc' } }, productSpecs: true },
    });
    return normalizeProduct(product);
  },

  async delete(id: number) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Producto');
    await prisma.product.delete({ where: { id } });
    return { message: 'Producto eliminado correctamente' };
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
