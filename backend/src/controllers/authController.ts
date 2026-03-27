import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin';
import { AuthRequest } from '../middleware/auth';

export const login = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: '請輸入帳號和密碼' });
    return;
  }

  const admin = await Admin.findOne({ username });
  if (!admin) {
    res.status(401).json({ message: '帳號或密碼錯誤' });
    return;
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    res.status(401).json({ message: '帳號或密碼錯誤' });
    return;
  }

  const secret = process.env.JWT_SECRET as string;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  const token = jwt.sign({ id: admin._id }, secret, { expiresIn } as jwt.SignOptions);

  res.json({ token, username: admin.username });
};

// 新增管理員帳號（需登入後才能操作）
export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: '請輸入帳號和密碼' });
    return;
  }

  const exists = await Admin.findOne({ username });
  if (exists) {
    res.status(409).json({ message: '帳號已存在' });
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  const admin = await Admin.create({ username, password: hashed });

  res.status(201).json({ message: '管理員建立成功', id: admin._id });
};

// 修改目前登入管理員的密碼
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400).json({ message: '請輸入目前密碼與新密碼' });
    return;
  }

  if (newPassword.length < 6) {
    res.status(400).json({ message: '新密碼長度至少需要 6 個字元' });
    return;
  }

  const admin = await Admin.findById(req.adminId);
  if (!admin) {
    res.status(404).json({ message: '找不到管理員帳號' });
    return;
  }

  const isMatch = await bcrypt.compare(currentPassword, admin.password);
  if (!isMatch) {
    res.status(401).json({ message: '目前密碼不正確' });
    return;
  }

  admin.password = await bcrypt.hash(newPassword, 12);
  await admin.save();

  res.json({ message: '密碼修改成功' });
};
