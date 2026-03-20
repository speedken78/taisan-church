import { Request, Response } from 'express';
import Banner from '../models/Banner';

export const getActiveBanners = async (_req: Request, res: Response): Promise<void> => {
  const banners = await Banner.find({ isActive: true }).sort({ order: 1 }).select('-__v');
  res.json(banners);
};

export const getAllBanners = async (_req: Request, res: Response): Promise<void> => {
  const banners = await Banner.find().sort({ order: 1 }).select('-__v');
  res.json(banners);
};

export const createBanner = async (req: Request, res: Response): Promise<void> => {
  const { title, imageUrl, linkUrl, order, isActive } = req.body;
  const banner = await Banner.create({ title, imageUrl, linkUrl, order, isActive });
  res.status(201).json(banner);
};

export const updateBanner = async (req: Request, res: Response): Promise<void> => {
  const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!banner) {
    res.status(404).json({ message: '輪播不存在' });
    return;
  }
  res.json(banner);
};

export const deleteBanner = async (req: Request, res: Response): Promise<void> => {
  const banner = await Banner.findByIdAndDelete(req.params.id);
  if (!banner) {
    res.status(404).json({ message: '輪播不存在' });
    return;
  }
  res.json({ message: '刪除成功' });
};
