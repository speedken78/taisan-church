/**
 * 初始化資源中心分類
 * 執行：npx ts-node scripts/seed-resource-categories.ts
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import ResourceCategory from '../src/models/ResourceCategory';

const INITIAL_CATEGORIES = [
  { name: '主日簡報', order: 1 },
  { name: '教材資源', order: 2 },
  { name: '行政表單', order: 3 },
  { name: '其他',     order: 4 },
];

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/church';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  for (const cat of INITIAL_CATEGORIES) {
    const exists = await ResourceCategory.findOne({ name: cat.name });
    if (exists) {
      console.log(`已存在，略過：${cat.name}`);
    } else {
      await ResourceCategory.create(cat);
      console.log(`已建立：${cat.name}`);
    }
  }

  await mongoose.disconnect();
  console.log('完成');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
