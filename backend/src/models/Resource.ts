import { Schema, model, Document, Types } from 'mongoose';

export interface IResource extends Document {
  title: string;
  description?: string;
  category: Types.ObjectId;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  downloads: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new Schema<IResource>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    category: { type: Schema.Types.ObjectId, ref: 'ResourceCategory', required: true },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    fileType: { type: String, required: true },
    downloads: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default model<IResource>('Resource', ResourceSchema);
