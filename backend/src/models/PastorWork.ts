import { Schema, model, Document } from 'mongoose';

export interface IPastorWork extends Document {
  title: string;
  author: string;
  coverImage: string;
  description: string;
  purchaseUrl: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const PastorWorkSchema = new Schema<IPastorWork>(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    coverImage: { type: String, required: true },
    description: { type: String, required: true },
    purchaseUrl: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default model<IPastorWork>('PastorWork', PastorWorkSchema);
