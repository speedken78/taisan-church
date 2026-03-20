import { Schema, model, Document } from 'mongoose';

export type MediaCategory = 'sunday' | 'children' | 'equip';

export interface IMedia extends Document {
  title: string;
  youtubeId: string;       // YouTube 影片 ID 或播放清單 ID
  category: MediaCategory;
  description?: string;
  isPlaylist: boolean;     // true = 播放清單, false = 單一影片
  isActive: boolean;
  order: number;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MediaSchema = new Schema<IMedia>(
  {
    title: { type: String, required: true, trim: true },
    youtubeId: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['sunday', 'children', 'equip'],
      required: true,
    },
    description: { type: String },
    isPlaylist: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default model<IMedia>('Media', MediaSchema);
