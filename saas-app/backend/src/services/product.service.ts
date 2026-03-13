import { Product, IProduct } from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import type { CreateProductInput, UpdateProductInput } from '../validators/product.validator.js';

interface PaginationOptions { page: number; limit: number; search?: string; category?: string; }

export class ProductService {
  async create(data: CreateProductInput): Promise<IProduct> {
    return Product.create(data);
  }

  async getAll(options: PaginationOptions): Promise<{ products: IProduct[]; pagination: any }> {
    const { page = 1, limit = 10, search, category } = options;
    const filter: any = { isActive: true };
    if (search) filter.$text = { $search: search };
    if (category) filter.category = category;

    const [products, total] = await Promise.all([
      Product.find(filter).skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 }),
      Product.countDocuments(filter),
    ]);
    return { products, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getBySlug(slug: string): Promise<IProduct> {
    const product = await Product.findOne({ slug, isActive: true });
    if (!product) throw new AppError('Product not found', 404);
    return product;
  }

  async update(id: string, data: UpdateProductInput): Promise<IProduct> {
    const product = await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!product) throw new AppError('Product not found', 404);
    return product;
  }

  async delete(id: string): Promise<void> {
    const product = await Product.findByIdAndUpdate(id, { isActive: false });
    if (!product) throw new AppError('Product not found', 404);
  }
}

export const productService = new ProductService();
