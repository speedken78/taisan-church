import { Request, Response } from 'express';
import News from '../models/News';

// 公開：取得已發布的消息列表
export const getPublishedNews = async (_req: Request, res: Response): Promise<void> => {
  const news = await News.find({ isPublished: true })
    .sort({ publishedAt: -1 })
    .select('-__v');
  res.json(news);
};

// 公開：取得單筆消息
export const getNewsById = async (req: Request, res: Response): Promise<void> => {
  const news = await News.findOne({ _id: req.params.id, isPublished: true });
  if (!news) {
    res.status(404).json({ message: '消息不存在' });
    return;
  }
  res.json(news);
};

// CMS：取得所有消息（含未發布）
export const getAllNews = async (_req: Request, res: Response): Promise<void> => {
  const news = await News.find().sort({ createdAt: -1 }).select('-__v');
  res.json(news);
};

// CMS：新增消息
export const createNews = async (req: Request, res: Response): Promise<void> => {
  const { title, content, coverImage, isPublished } = req.body;
  const news = await News.create({
    title,
    content,
    coverImage,
    isPublished: isPublished ?? false,
    publishedAt: isPublished ? new Date() : undefined,
  });
  res.status(201).json(news);
};

// CMS：更新消息
export const updateNews = async (req: Request, res: Response): Promise<void> => {
  const { title, content, coverImage, isPublished } = req.body;
  const news = await News.findById(req.params.id);
  if (!news) {
    res.status(404).json({ message: '消息不存在' });
    return;
  }

  news.title = title ?? news.title;
  news.content = content ?? news.content;
  news.coverImage = coverImage ?? news.coverImage;

  // 若從未發布切換為發布，記錄發布時間
  if (isPublished !== undefined && !news.isPublished && isPublished) {
    news.publishedAt = new Date();
  }
  news.isPublished = isPublished ?? news.isPublished;

  await news.save();
  res.json(news);
};

// CMS：刪除消息
export const deleteNews = async (req: Request, res: Response): Promise<void> => {
  const news = await News.findByIdAndDelete(req.params.id);
  if (!news) {
    res.status(404).json({ message: '消息不存在' });
    return;
  }
  res.json({ message: '刪除成功' });
};
