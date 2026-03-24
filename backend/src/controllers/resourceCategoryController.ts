import { Request, Response } from 'express';
import ResourceCategory from '../models/ResourceCategory';
import Resource from '../models/Resource';

// 公開：取得所有分類（依 order 排序）
export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  const categories = await ResourceCategory.find().sort({ order: 1, createdAt: 1 }).select('-__v');
  res.json(categories);
};

// CMS：新增分類
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  const { name, order } = req.body;
  if (!name) {
    res.status(400).json({ message: '分類名稱為必填' });
    return;
  }
  const category = await ResourceCategory.create({ name, order: order ?? 0 });
  res.status(201).json(category);
};

// CMS：更新分類
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  const { name, order } = req.body;
  const category = await ResourceCategory.findById(req.params.id);
  if (!category) {
    res.status(404).json({ message: '分類不存在' });
    return;
  }
  if (name !== undefined) category.name = name;
  if (order !== undefined) category.order = order;
  await category.save();
  res.json(category);
};

// CMS：刪除分類（有資源時拒絕）
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  const category = await ResourceCategory.findById(req.params.id);
  if (!category) {
    res.status(404).json({ message: '分類不存在' });
    return;
  }

  const count = await Resource.countDocuments({ category: req.params.id });
  if (count > 0) {
    res.status(400).json({ message: `此分類下仍有 ${count} 筆資源，請先移除或改分類後再刪除` });
    return;
  }

  await category.deleteOne();
  res.json({ message: '刪除成功' });
};
