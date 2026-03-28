import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import OfferingRecord, { OfferingStatus } from '../models/OfferingRecord';
import { buildTradeInfo, buildTradeSha, verifyNotify, aesDecrypt } from '../services/newebpay';

const MERCHANT_ID = process.env.NEWEBPAY_MERCHANT_ID as string;
const API_URL = process.env.NEWEBPAY_API_URL as string;

// 前台：建立奉獻訂單，回傳藍新所需的表單參數
export const createOffering = async (req: Request, res: Response): Promise<void> => {
  const { amount, donorName, donorEmail, donorPhone, purpose } = req.body;

  if (!amount || !donorName || !donorEmail) {
    res.status(400).json({ message: '請填寫必要欄位' });
    return;
  }

  // 產生唯一訂單號（年月日 + UUID 前8碼）
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const merchantOrderNo = `CH${dateStr}${uuidv4().replace(/-/g, '').slice(0, 8).toUpperCase()}`;

  // 建立訂單記錄
  await OfferingRecord.create({
    merchantOrderNo,
    amount: Number(amount),
    donorName,
    donorEmail,
    donorPhone,
    purpose: purpose || '一般奉獻',
    status: 'pending',
  });

  const returnUrl = `${req.protocol}://${req.get('host')}/api/offering/return`;
  const notifyUrl = `${req.protocol}://${req.get('host')}/api/offering/notify`;

  const tradeParams: Record<string, string> = {
    MerchantID: MERCHANT_ID,
    RespondType: 'JSON',
    TimeStamp: String(Math.floor(Date.now() / 1000)),
    Version: '2.0',
    MerchantOrderNo: merchantOrderNo,
    Amt: String(amount),
    ItemDesc: `泰山幸福教會 - ${purpose || '一般奉獻'}`,
    Email: donorEmail,
    ReturnURL: returnUrl,
    NotifyURL: notifyUrl,
    LoginType: '0',
  };

  const tradeInfo = buildTradeInfo(tradeParams);
  const tradeSha = buildTradeSha(tradeInfo);

  res.json({
    apiUrl: API_URL,
    merchantId: MERCHANT_ID,
    tradeInfo,
    tradeSha,
    version: '2.0',
  });
};

// 藍新非同步通知（POST）
export const notifyOffering = async (req: Request, res: Response): Promise<void> => {
  const { Status, TradeInfo, TradeSha } = req.body;

  if (!verifyNotify(TradeSha, TradeInfo)) {
    res.status(400).send('驗證失敗');
    return;
  }

  const decrypted = aesDecrypt(TradeInfo);
  const params = Object.fromEntries(new URLSearchParams(decrypted));

  const record = await OfferingRecord.findOne({ merchantOrderNo: params.MerchantOrderNo });
  if (record) {
    record.status = Status === 'SUCCESS' ? 'success' : 'failed';
    record.tradeNo = params.TradeNo || '';
    record.newebpayResponse = params as Record<string, unknown>;
    await record.save();
  }

  res.send('OK');
};

// 藍新同步回傳（POST → 導向結果頁）
export const returnOffering = async (req: Request, res: Response): Promise<void> => {
  const { Status, TradeInfo } = req.body;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (Status === 'SUCCESS' && TradeInfo) {
    const decrypted = aesDecrypt(TradeInfo);
    const params = Object.fromEntries(new URLSearchParams(decrypted));
    res.redirect(`${frontendUrl}/offering/result?status=success&orderNo=${params.MerchantOrderNo}`);
  } else {
    res.redirect(`${frontendUrl}/offering/result?status=failed`);
  }
};

// CMS：手動修正奉獻狀態
export const updateOfferingStatus = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body;

  const allowed: OfferingStatus[] = ['pending', 'success', 'failed'];
  if (!allowed.includes(status)) {
    res.status(400).json({ message: '無效的狀態值' });
    return;
  }

  const record = await OfferingRecord.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );

  if (!record) {
    res.status(404).json({ message: '找不到此奉獻記錄' });
    return;
  }

  res.json(record);
};

// CMS：查詢奉獻記錄
export const getOfferingRecords = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const [records, total] = await Promise.all([
    OfferingRecord.find().sort({ createdAt: -1 }).skip(skip).limit(limit).select('-__v'),
    OfferingRecord.countDocuments(),
  ]);

  res.json({ records, total, page, totalPages: Math.ceil(total / limit) });
};
