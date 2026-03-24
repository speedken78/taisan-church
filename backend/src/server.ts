import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import connectDB from './config/db';

import authRoutes from './routes/auth';
import newsRoutes from './routes/news';
import bannerRoutes from './routes/banners';
import mediaRoutes from './routes/media';
import pastorWorkRoutes from './routes/pastorWorks';
import groupRoutes from './routes/groups';
import offeringRoutes from './routes/offering';
import formRoutes from './routes/forms';
import resourceCategoryRoutes from './routes/resourceCategories';
import resourceRoutes from './routes/resources';

const app = express();
const PORT = process.env.PORT || 5001;

// 信任緊鄰的第一層 proxy（Nginx container）
// 讓 req.ip 正確讀取 X-Forwarded-For，rate limiting 才能依真實用戶 IP 計數
app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/pastor-works', pastorWorkRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/offering', offeringRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/resource-categories', resourceCategoryRoutes);
app.use('/api/resources', resourceRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });

export default app;
