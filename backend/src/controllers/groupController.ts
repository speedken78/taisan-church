import { Request, Response } from 'express';
import Group from '../models/Group';

export const getActiveGroups = async (_req: Request, res: Response): Promise<void> => {
  const groups = await Group.find({ isActive: true }).sort({ order: 1 }).select('-__v');
  res.json(groups);
};

export const getAllGroups = async (_req: Request, res: Response): Promise<void> => {
  const groups = await Group.find().sort({ order: 1 }).select('-__v');
  res.json(groups);
};

export const createGroup = async (req: Request, res: Response): Promise<void> => {
  const group = await Group.create(req.body);
  res.status(201).json(group);
};

export const updateGroup = async (req: Request, res: Response): Promise<void> => {
  const group = await Group.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!group) {
    res.status(404).json({ message: '小組不存在' });
    return;
  }
  res.json(group);
};

export const deleteGroup = async (req: Request, res: Response): Promise<void> => {
  const group = await Group.findByIdAndDelete(req.params.id);
  if (!group) {
    res.status(404).json({ message: '小組不存在' });
    return;
  }
  res.json({ message: '刪除成功' });
};
