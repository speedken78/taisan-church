import { Schema, model, Document } from 'mongoose';

export type FormFieldType = 'text' | 'textarea' | 'number' | 'date' | 'select' | 'radio' | 'checkbox';
export type FormType = 'event' | 'group_buy' | 'volunteer' | 'venue' | 'survey';

// 唯一真相來源：所有允許的表單類型。新增類型只改這裡，其他地方引用此常數。
export const FORM_TYPES: readonly FormType[] = ['event', 'group_buy', 'volunteer', 'venue', 'survey'];

export interface IFormField {
  key: string;
  label: string;
  type: FormFieldType;
  options?: string[];    // select / radio / checkbox 的選項
  placeholder?: string;  // 輸入框佔位提示
  helpText?: string;     // 欄位說明文字（顯示在 label 下方）
  required: boolean;
}

export interface IForm extends Document {
  title: string;
  description: string;
  type: FormType;
  coverImage?: string;
  fields: IFormField[];
  requireContact: boolean; // 是否強制收集姓名 / Email / 手機（問卷可設為 false）
  price?: number;          // 團購單價（選填）
  maxQuantity?: number;    // 每人最多可填數量
  totalLimit?: number;     // 報名人數上限（0 = 無限制）
  deadline: Date;
  isOpen: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FormFieldSchema = new Schema<IFormField>(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    type: {
      type: String,
      enum: ['text', 'textarea', 'number', 'date', 'select', 'radio', 'checkbox'],
      required: true,
    },
    options: [{ type: String }],
    placeholder: { type: String },
    helpText: { type: String },
    required: { type: Boolean, default: false },
  },
  { _id: false }
);

const FormSchema = new Schema<IForm>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    type: {
      type: String,
      enum: FORM_TYPES,
      required: true,
    },
    coverImage: { type: String },
    fields: [FormFieldSchema],
    requireContact: { type: Boolean, default: true },
    price: { type: Number },
    maxQuantity: { type: Number, default: 1 },
    totalLimit: { type: Number, default: 0 },
    deadline: { type: Date, required: true },
    isOpen: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default model<IForm>('Form', FormSchema);
