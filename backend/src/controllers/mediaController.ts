import { Request, Response } from 'express';
import Media from '../models/Media';

export const getMediaByCategory = async (req: Request, res: Response): Promise<void> => {
  const { category } = req.params;
  const media = await Media.find({ category, isActive: true })
    .sort({ order: 1, publishedAt: -1 })
    .select('-__v');
  res.json(media);
};

export const getAllMedia = async (_req: Request, res: Response): Promise<void> => {
  const media = await Media.find().sort({ category: 1, order: 1, publishedAt: -1 }).select('-__v');
  res.json(media);
};

export const createMedia = async (req: Request, res: Response): Promise<void> => {
  const media = await Media.create(req.body);
  res.status(201).json(media);
};

export const updateMedia = async (req: Request, res: Response): Promise<void> => {
  const media = await Media.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!media) {
    res.status(404).json({ message: '影音不存在' });
    return;
  }
  res.json(media);
};

export const deleteMedia = async (req: Request, res: Response): Promise<void> => {
  const media = await Media.findByIdAndDelete(req.params.id);
  if (!media) {
    res.status(404).json({ message: '影音不存在' });
    return;
  }
  res.json({ message: '刪除成功' });
};
