import { Request, Response } from 'express';
import PastorWork from '../models/PastorWork';

export const getActiveWorks = async (_req: Request, res: Response): Promise<void> => {
  const works = await PastorWork.find({ isActive: true }).sort({ order: 1 }).select('-__v');
  res.json(works);
};

export const getAllWorks = async (_req: Request, res: Response): Promise<void> => {
  const works = await PastorWork.find().sort({ order: 1 }).select('-__v');
  res.json(works);
};

export const createWork = async (req: Request, res: Response): Promise<void> => {
  const work = await PastorWork.create(req.body);
  res.status(201).json(work);
};

export const updateWork = async (req: Request, res: Response): Promise<void> => {
  const work = await PastorWork.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!work) {
    res.status(404).json({ message: '著作不存在' });
    return;
  }
  res.json(work);
};

export const deleteWork = async (req: Request, res: Response): Promise<void> => {
  const work = await PastorWork.findByIdAndDelete(req.params.id);
  if (!work) {
    res.status(404).json({ message: '著作不存在' });
    return;
  }
  res.json({ message: '刪除成功' });
};
