import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import Resource from '../models/Resource';

// 公開：取得已發布的資源列表（可依分類篩選）
export const getPublishedResources = async (req: Request, res: Response): Promise<void> => {
  const filter: Record<string, unknown> = { isPublished: true };
  if (req.query.category) filter.category = req.query.category;

  const resources = await Resource.find(filter)
    .populate('category', 'name order')
    .sort({ createdAt: -1 })
    .select('-__v');
  res.json(resources);
};

// 公開：下載資源（計數 +1，回傳檔案）
export const downloadResource = async (req: Request, res: Response): Promise<void> => {
  const resource = await Resource.findOne({ _id: req.params.id, isPublished: true });
  if (!resource) {
    res.status(404).json({ message: '資源不存在' });
    return;
  }

  // 取出儲存的相對路徑，轉換為磁碟絕對路徑
  // fileUrl 格式：/uploads/files/<uuid.ext>
  const relativePath = resource.fileUrl.replace(/^\//, '');
  const filePath = path.join(__dirname, '..', '..', relativePath);

  if (!fs.existsSync(filePath)) {
    res.status(404).json({ message: '檔案不存在' });
    return;
  }

  // 先更新計數再送出檔案
  await Resource.findByIdAndUpdate(req.params.id, { $inc: { downloads: 1 } });

  res.download(filePath, resource.fileName);
};

// CMS：取得所有資源（含未發布）
export const getAllResources = async (_req: Request, res: Response): Promise<void> => {
  const resources = await Resource.find()
    .populate('category', 'name order')
    .sort({ createdAt: -1 })
    .select('-__v');
  res.json(resources);
};

// CMS：新增資源（含檔案上傳）
export const createResource = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ message: '請上傳檔案' });
    return;
  }

  const { title, description, category, isPublished } = req.body;
  if (!title || !category) {
    res.status(400).json({ message: 'title 與 category 為必填' });
    return;
  }

  const ext = path.extname(req.file.originalname).replace('.', '').toLowerCase();
  const fileUrl = `/uploads/files/${req.file.filename}`;

  const resource = await Resource.create({
    title,
    description,
    category,
    fileUrl,
    fileName: req.file.originalname,
    fileSize: req.file.size,
    fileType: ext,
    isPublished: isPublished === 'true' || isPublished === true,
  });

  const populated = await resource.populate('category', 'name order');
  res.status(201).json(populated);
};

// CMS：更新資源（不含重新上傳檔案）
export const updateResource = async (req: Request, res: Response): Promise<void> => {
  const resource = await Resource.findById(req.params.id);
  if (!resource) {
    res.status(404).json({ message: '資源不存在' });
    return;
  }

  const { title, description, category, isPublished } = req.body;
  if (title !== undefined) resource.title = title;
  if (description !== undefined) resource.description = description;
  if (category !== undefined) resource.category = category;
  if (isPublished !== undefined) resource.isPublished = isPublished === 'true' || isPublished === true;

  await resource.save();
  const populated = await resource.populate('category', 'name order');
  res.json(populated);
};

// CMS：刪除資源（同時刪除磁碟上的檔案）
export const deleteResource = async (req: Request, res: Response): Promise<void> => {
  const resource = await Resource.findById(req.params.id);
  if (!resource) {
    res.status(404).json({ message: '資源不存在' });
    return;
  }

  // 刪除磁碟檔案
  const relativePath = resource.fileUrl.replace(/^\//, '');
  const filePath = path.join(__dirname, '..', '..', relativePath);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  await resource.deleteOne();
  res.json({ message: '刪除成功' });
};
