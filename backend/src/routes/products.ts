import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      search,
      categoryId,
      minPrice,
      maxPrice,
      sort,
      page = '1',
      limit = '12',
      featured,
      offer,
    } = req.query;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search as string } },
        { name: { contains: search as string } },
        { description: { contains: search as string } },
      ];
    }
    if (categoryId) where.categoryId = Number(categoryId);
    if (minPrice) where.price = { ...where.price, gte: Number(minPrice) };
    if (maxPrice) where.price = { ...where.price, lte: Number(maxPrice) };
    if (featured === 'true') where.isFeatured = true;
    if (offer === 'true') where.isOffer = true;

    let orderBy: any = { createdAt: 'desc' };
    switch (sort) {
      case 'price_asc': orderBy = { price: 'asc' }; break;
      case 'price_desc': orderBy = { price: 'desc' }; break;
      case 'oldest': orderBy = { createdAt: 'asc' }; break;
      case 'rating': orderBy = { rating: 'desc' }; break;
      case 'name': orderBy = { title: 'asc' }; break;
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: { category: true },
      }),
      prisma.product.count({ where }),
    ]);

    const mapped = products.map((p) => ({
      ...p,
      images: p.images ? JSON.parse(p.images) : [],
      specs: p.specs ? JSON.parse(p.specs) : [],
    }));

    res.json({
      products: mapped,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        category: true,
        reviews: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });

    if (!product) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }

    const related = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
      },
      take: 4,
      include: { category: true },
    });

    res.json({
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
      specs: product.specs ? JSON.parse(product.specs) : [],
      related: related.map((r) => ({
        ...r,
        images: r.images ? JSON.parse(r.images) : [],
        specs: r.specs ? JSON.parse(r.specs) : [],
      })),
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
});

router.post('/:id/reviews', async (req: Request, res: Response) => {
  try {
    const { userName, rating, comment } = req.body;
    const productId = Number(req.params.id);

    if (!userName || !rating || rating < 1 || rating > 5) {
      res.status(400).json({ error: 'Nombre y calificación (1-5) son requeridos' });
      return;
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }

    await prisma.review.create({
      data: { productId, userName, rating, comment },
    });

    const aggregations = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: true,
    });

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: aggregations._avg.rating ?? 0,
        reviewCount: aggregations._count,
      },
    });

    res.status(201).json({ message: 'Reseña creada exitosamente' });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Error al crear la reseña' });
  }
});

export default router;
