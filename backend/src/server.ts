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

const app = express();
const PORT = process.env.PORT || 5001;

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
