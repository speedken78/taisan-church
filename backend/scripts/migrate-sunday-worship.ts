/**
 * 移轉腳本：從舊網站 taishanchurch.org.tw 抓取指定分類資料
 * 並匯入新專案的 MongoDB Media collection
 *
 * 執行方式：
 *   MONGODB_URI=mongodb://localhost:27017/church npx ts-node scripts/migrate-sunday-worship.ts
 */

import mongoose from 'mongoose';
import Media, { MediaCategory } from '../src/models/Media';

const WP_API_BASE = 'https://taishanchurch.org.tw/wp-json/wp/v2';
const PER_PAGE = 100;

// ────────────────────────────────────────────────
// 移轉目標設定
// ────────────────────────────────────────────────

interface MigrateTarget {
  label: string;
  wpCategoryId: number;
  mediaCategory: MediaCategory;
  parseDateFromTitle: (title: string, fallback: string) => Date;
  buildDescription: (title: string) => string;
}

const TARGETS: MigrateTarget[] = [
  {
    label: '主日崇拜',
    wpCategoryId: 8,
    mediaCategory: 'sunday',
    parseDateFromTitle: (title, fallback) => {
      // 格式：YYYYMMDD主日 講題 講師 經文
      const match = title.match(/^(\d{8})/);
      if (match) {
        const s = match[1];
        return new Date(`${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`);
      }
      return new Date(fallback);
    },
    buildDescription: (title) => title.replace(/^\d{8}主日\s*/, '').trim(),
  },
  {
    label: '幸福兒童樂園',
    wpCategoryId: 2,
    mediaCategory: 'children',
    parseDateFromTitle: (title, fallback) => {
      // 格式：幸福兒童樂園【YYYYMMDD】經文／主題
      const match = title.match(/【(\d{8})】/);
      if (match) {
        const s = match[1];
        return new Date(`${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`);
      }
      return new Date(fallback);
    },
    buildDescription: (title) => title.replace(/^幸福兒童樂園【\d{8}】\s*/, '').trim(),
  },
  {
    label: '裝備課程',
    wpCategoryId: 4,
    mediaCategory: 'equip',
    parseDateFromTitle: (title, fallback) => {
      // 格式：「週六裝備課」YYYYMMDD
      const match = title.match(/(\d{8})/);
      if (match) {
        const s = match[1];
        return new Date(`${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`);
      }
      return new Date(fallback);
    },
    buildDescription: (title) => title.replace(/^「週六裝備課」\s*/, '').trim(),
  },
];

// ────────────────────────────────────────────────
// 型別
// ────────────────────────────────────────────────

interface WpPost {
  id: number;
  date: string;
  title: { rendered: string };
  content: { rendered: string };
}

interface ParsedPost {
  title: string;
  youtubeId: string;
  publishedAt: Date;
  description: string;
}

// ────────────────────────────────────────────────
// 共用函式
// ────────────────────────────────────────────────

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&#8211;/g, '–')
    .replace(/&#8216;/g, '\u2018')
    .replace(/&#8217;/g, '\u2019')
    .trim();
}

function extractYouTubeId(html: string): string | null {
  const embedMatch = html.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];

  const shortMatch = html.match(/youtu\.be\/([A-Za-z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];

  return null;
}

async function fetchAllPosts(categoryId: number): Promise<WpPost[]> {
  const all: WpPost[] = [];
  let page = 1;

  while (true) {
    console.log(`  抓取第 ${page} 頁...`);
    const url =
      `${WP_API_BASE}/posts` +
      `?categories=${categoryId}` +
      `&per_page=${PER_PAGE}` +
      `&page=${page}` +
      `&_fields=id,date,title,content`;

    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 400) break;
      throw new Error(`WordPress API 回傳錯誤：${res.status}`);
    }

    const posts = (await res.json()) as WpPost[];
    if (posts.length === 0) break;
    all.push(...posts);
    if (posts.length < PER_PAGE) break;
    page++;
  }

  return all;
}

// ────────────────────────────────────────────────
// 主流程
// ────────────────────────────────────────────────

async function migrateTarget(target: MigrateTarget): Promise<void> {
  console.log(`\n========================================`);
  console.log(`移轉：${target.label}`);
  console.log(`========================================`);

  const posts = await fetchAllPosts(target.wpCategoryId);
  console.log(`共取得 ${posts.length} 筆\n`);

  const parsed: ParsedPost[] = [];
  const skipped: string[] = [];

  for (const post of posts) {
    const rawTitle = decodeHtmlEntities(post.title.rendered);
    const youtubeId = extractYouTubeId(post.content.rendered);

    if (!youtubeId) {
      skipped.push(rawTitle);
      continue;
    }

    parsed.push({
      title: rawTitle,
      youtubeId,
      publishedAt: target.parseDateFromTitle(rawTitle, post.date),
      description: target.buildDescription(rawTitle),
    });
  }

  console.log(`有效資料：${parsed.length} 筆`);
  if (skipped.length > 0) {
    console.log(`跳過（無 YouTube ID）：${skipped.length} 筆`);
    skipped.forEach((t) => console.log(`  - ${t}`));
  }

  let inserted = 0;
  let duplicates = 0;

  for (const item of parsed) {
    const exists = await Media.findOne({ youtubeId: item.youtubeId });
    if (exists) {
      duplicates++;
      continue;
    }

    await Media.create({
      title: item.title,
      youtubeId: item.youtubeId,
      category: target.mediaCategory,
      description: item.description,
      isPlaylist: false,
      isActive: true,
      order: 0,
      publishedAt: item.publishedAt,
    });
    inserted++;
  }

  console.log(`\n✓ ${target.label} 匯入完成`);
  console.log(`  新增：${inserted} 筆`);
  console.log(`  略過（重複）：${duplicates} 筆`);
}

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('請設定環境變數 MONGODB_URI');
    process.exit(1);
  }

  console.log('連接 MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('連接成功');

  for (const target of TARGETS) {
    await migrateTarget(target);
  }

  console.log('\n\n全部移轉完成！');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('移轉失敗：', err);
  process.exit(1);
});
