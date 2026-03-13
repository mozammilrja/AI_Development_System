import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { productService } from '../services/product.service.js';

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.create(req.body);
  sendSuccess(res, product, 201);
});

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const { page = '1', limit = '10', search, category } = req.query;
  const result = await productService.getAll({
    page: parseInt(page as string),
    limit: parseInt(limit as string),
    search: search as string,
    category: category as string,
  });
  sendSuccess(res, result);
});

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getBySlug(req.params.slug);
  sendSuccess(res, product);
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.update(req.params.id, req.body);
  sendSuccess(res, product);
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  await productService.delete(req.params.id);
  sendSuccess(res, { message: 'Product deleted' });
});
