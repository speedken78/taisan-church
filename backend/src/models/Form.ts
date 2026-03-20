import { Schema, model, Document } from 'mongoose';

export interface IFormField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'radio' | 'checkbox';
  options?: string[]; // select / radio / checkbox 的選項
  required: boolean;
}

export interface IForm extends Document {
  title: string;
  description: string;
  type: 'event' | 'group_buy';
  coverImage?: string;
  fields: IFormField[];
  price?: number;       // 團購單價（選填）
  maxQuantity?: number; // 每人最多可填數量
  totalLimit?: number;  // 報名人數上限（0 = 無限制）
  deadline: Date;
  isOpen: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FormFieldSchema = new Schema<IFormField>(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, enum: ['text', 'number', 'select', 'radio', 'checkbox'], required: true },
    options: [{ type: String }],
    required: { type: Boolean, default: false },
  },
  { _id: false }
);

const FormSchema = new Schema<IForm>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    type: { type: String, enum: ['event', 'group_buy'], required: true },
    coverImage: { type: String },
    fields: [FormFieldSchema],
    price: { type: Number },
    maxQuantity: { type: Number, default: 1 },
    totalLimit: { type: Number, default: 0 },
    deadline: { type: Date, required: true },
    isOpen: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default model<IForm>('Form', FormSchema);
