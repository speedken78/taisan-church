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
export const aesDecrypt = (encrypted: string): string => {
  const decipher = crypto.createDecipheriv('aes-256-cbc', HASH_KEY, HASH_IV);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
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
