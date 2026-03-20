import { Schema, model, Document } from 'mongoose';

export interface IGroup extends Document {
  name: string;
  description: string;
  leader: string;
  imageUrl?: string;
  meetingTime?: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const GroupSchema = new Schema<IGroup>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    leader: { type: String, required: true, trim: true },
    imageUrl: { type: String },
    meetingTime: { type: String },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default model<IGroup>('Group', GroupSchema);
