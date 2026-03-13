import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IOrderItem {
  product: Types.ObjectId;
  variant: { sku: string; name: string; price: number };
  quantity: number;
}

export interface IOrder extends Document {
  user: Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: { street: string; city: string; state: string; zipCode: string; country: string };
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  variant: { sku: { type: String, required: true }, name: { type: String, required: true }, price: { type: Number, required: true } },
  quantity: { type: Number, required: true, min: 1 },
}, { _id: false });

const orderSchema = new Schema<IOrder>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
  },
}, { timestamps: true });

export const Order = mongoose.model<IOrder>('Order', orderSchema);
