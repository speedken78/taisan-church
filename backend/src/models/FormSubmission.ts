import { Schema, model, Document } from 'mongoose';

export interface IFormSubmission extends Document {
  formId: Schema.Types.ObjectId;
  name?: string;   // requireContact = false 的表單不強制收集
  email?: string;
  phone?: string;
  answers: Map<string, string | number | string[]>;
  quantity: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'rejected';
  createdAt: Date;
}

const FormSubmissionSchema = new Schema<IFormSubmission>(
  {
    formId: { type: Schema.Types.ObjectId, ref: 'Form', required: true, index: true },
    name: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    answers: { type: Map, of: Schema.Types.Mixed, default: {} },
    quantity: { type: Number, default: 1, min: 1 },
    totalAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected'],
      default: 'pending',
      required: true,
    },
  },
  { timestamps: true }
);

// 同一表單不允許相同 email 或 phone 重複報名（由 controller 邏輯判斷）
FormSubmissionSchema.index({ formId: 1, email: 1 });
FormSubmissionSchema.index({ formId: 1, phone: 1 });

export default model<IFormSubmission>('FormSubmission', FormSubmissionSchema);
