import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin';

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

// 僅供初次建立管理員帳號使用（建議部署後移除此路由）
export const register = async (req: Request, res: Response): Promise<void> => {
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
