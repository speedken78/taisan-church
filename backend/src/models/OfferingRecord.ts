import { Schema, model, Document } from 'mongoose';

export type OfferingStatus = 'pending' | 'success' | 'failed';

export interface IOfferingRecord extends Document {
  tradeNo: string;         // 藍新交易序號
  merchantOrderNo: string; // 商店訂單編號
  amount: number;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  purpose?: string;        // 奉獻用途 (一般奉獻、十一奉獻等)
  status: OfferingStatus;
  newebpayResponse?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const OfferingRecordSchema = new Schema<IOfferingRecord>(
  {
    tradeNo: { type: String },
    merchantOrderNo: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    donorName: { type: String, required: true },
    donorEmail: { type: String, required: true },
    donorPhone: { type: String },
    purpose: { type: String, default: '感恩奉獻' },
    status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
    newebpayResponse: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default model<IOfferingRecord>('OfferingRecord', OfferingRecordSchema);
