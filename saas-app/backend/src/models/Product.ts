import mongoose, { Schema, Document } from 'mongoose';
import slugify from 'slugify';

export interface IProductVariant {
  sku: string;
  name: string;
  price: number;
  stock: number;
  attributes: Record<string, string>;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  category: string;
  images: string[];
  variants: IProductVariant[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const variantSchema = new Schema<IProductVariant>(
  {
    sku: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    attributes: { type: Map, of: String, default: {} },
  },
  { _id: false }
);

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    images: [{ type: String }],
    variants: [variantSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

productSchema.index({ name: 'text', description: 'text' });

export const Product = mongoose.model<IProduct>('Product', productSchema);
