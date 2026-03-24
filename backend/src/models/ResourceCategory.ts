import { Schema, model, Document } from 'mongoose';

export interface IResourceCategory extends Document {
  name: string;
  order: number;
  createdAt: Date;
}

const ResourceCategorySchema = new Schema<IResourceCategory>(
  {
    name: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default model<IResourceCategory>('ResourceCategory', ResourceCategorySchema);
