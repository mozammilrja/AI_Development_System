import { z } from 'zod';

const variantSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  price: z.number().min(0),
  stock: z.number().min(0).default(0),
  attributes: z.record(z.string()).default({}),
});

export const createProductSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  images: z.array(z.string().url()).default([]),
  variants: z.array(variantSchema).min(1, 'At least one variant is required'),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
