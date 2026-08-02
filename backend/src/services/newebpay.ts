import crypto from 'crypto';

const HASH_KEY = process.env.NEWEBPAY_HASH_KEY as string;
const HASH_IV = process.env.NEWEBPAY_HASH_IV as string;

// AES-256-CBC 加密
export const aesEncrypt = (data: string): string => {
  const cipher = crypto.createCipheriv('aes-256-cbc', HASH_KEY, HASH_IV);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

// AES-256-CBC 解密
// 藍新的 TradeInfo 密文結尾偶爾會帶有超出標準 PKCS7 範圍（1~16）的填充位元組，
// 導致 Node 內建的 auto padding 驗證直接丟出 bad decrypt。這裡改成手動解開，
// 並自行去除結尾的控制字元（含正常 padding 與異常填充），內容本身不受影響。
export const aesDecrypt = (encrypted: string): string => {
  const decipher = crypto.createDecipheriv('aes-256-cbc', HASH_KEY, HASH_IV);
  decipher.setAutoPadding(false);
  const raw = Buffer.concat([decipher.update(Buffer.from(encrypted, 'hex')), decipher.final()]);

  let end = raw.length;
  while (end > 0 && raw[end - 1] < 0x20) end--;

  return raw.subarray(0, end).toString('utf8');
};

// SHA256 雜湊驗證
export const sha256Hash = (data: string): string => {
  return crypto.createHash('sha256').update(data).digest('hex').toUpperCase();
};

// 產生藍新交易參數
export const buildTradeInfo = (params: Record<string, string>): string => {
  const queryString = new URLSearchParams(params).toString();
  return aesEncrypt(queryString);
};

// 產生 SHA256 CheckValue
export const buildTradeSha = (tradeInfo: string): string => {
  const raw = `HashKey=${HASH_KEY}&${tradeInfo}&HashIV=${HASH_IV}`;
  return sha256Hash(raw);
};

// 驗證藍新回傳資料
export const verifyNotify = (tradeSha: string, tradeInfo: string): boolean => {
  const expected = buildTradeSha(tradeInfo);
  return expected === tradeSha;
};
