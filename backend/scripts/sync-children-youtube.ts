/**
 * 同步腳本：從泰山幸福教會 YouTube 頻道抓取「幸福兒童樂園」影片
 * 與 MongoDB 比對後，將缺少的影片匯入
 *
 * 執行方式：
 *   MONGODB_URI=mongodb://localhost:27017/church \
 *   YOUTUBE_API_KEY=你的金鑰 \
 *   npx ts-node scripts/sync-children-youtube.ts
 */

import mongoose from 'mongoose';
import Media from '../src/models/Media';

const CHANNEL_ID = 'UC-3KJcwsHGVAgFbZS8zEe_w';
const KEYWORD = '幸福兒童樂園';
const MAX_RESULTS = 50;

interface YouTubeSearchItem {
  id: { videoId: string };
  snippet: { title: string; publishedAt: string };
}

interface YouTubeSearchResponse {
  items: YouTubeSearchItem[];
  nextPageToken?: string;
}

function parseDateFromTitle(title: string, fallback: string): Date {
  const match = title.match(/【(\d{8})】/);
  if (match) {
    const s = match[1];
    return new Date(`${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`);
  }
  return new Date(fallback);
}

function buildDescription(title: string): string {
  return title.replace(/^幸福兒童樂園【\d{8}】\s*/, '').trim();
}

async function fetchAllVideos(apiKey: string): Promise<YouTubeSearchItem[]> {
  const all: YouTubeSearchItem[] = [];
  let pageToken: string | undefined;
  let page = 1;

  do {
    const params = new URLSearchParams({
      part: 'snippet',
      channelId: CHANNEL_ID,
      q: KEYWORD,
      type: 'video',
      maxResults: String(MAX_RESULTS),
      order: 'date', // 最新在前，抓完後反轉為最舊在前
      key: apiKey,
    });
    if (pageToken) params.set('pageToken', pageToken);

    const url = `https://www.googleapis.com/youtube/v3/search?${params}`;
    console.log(`  抓取第 ${page} 頁...`);

    const res = await fetch(url);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`YouTube API 錯誤 ${res.status}: ${text}`);
    }

    const data = (await res.json()) as YouTubeSearchResponse;
    all.push(...(data.items ?? []));
    pageToken = data.nextPageToken;
    page++;
  } while (pageToken);

  // 去重（YouTube 搜尋偶爾會回傳重複項目）
  const seen = new Set<string>();
  const unique = all.filter((item) => {
    if (seen.has(item.id.videoId)) return false;
    seen.add(item.id.videoId);
    return true;
  });

  // 反轉為最舊在前，使 publishedAt 排序時舊影片先出現
  return unique.reverse();
}

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!mongoUri) {
    console.error('請設定環境變數 MONGODB_URI');
    process.exit(1);
  }
  if (!apiKey) {
    console.error('請設定環境變數 YOUTUBE_API_KEY');
    process.exit(1);
  }

  console.log('連接 MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('連接成功\n');

  console.log('從 YouTube 抓取幸福兒童樂園影片...');
  const videos = await fetchAllVideos(apiKey);
  console.log(`YouTube 共找到 ${videos.length} 筆（去重後）\n`);

  // 取得 DB 現有的 children 影片 ID 集合
  const existing = await Media.find({ category: 'children' }).select('youtubeId').lean();
  const existingIds = new Set(existing.map((m) => m.youtubeId));
  console.log(`MongoDB 現有幸福兒童樂園影片：${existingIds.size} 筆`);

  let inserted = 0;
  let skipped = 0;

  for (const item of videos) {
    const videoId = item.id.videoId;
    const title = item.snippet.title;

    if (existingIds.has(videoId)) {
      skipped++;
      continue;
    }

    await Media.create({
      title,
      youtubeId: videoId,
      category: 'children',
      description: buildDescription(title),
      isPlaylist: false,
      isActive: true,
      order: 0,
      publishedAt: parseDateFromTitle(title, item.snippet.publishedAt),
    });
    inserted++;
    console.log(`  + ${title}`);
  }

  console.log('\n========================================');
  console.log(`同步完成`);
  console.log(`  新增：${inserted} 筆`);
  console.log(`  略過（已存在）：${skipped} 筆`);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('同步失敗：', err);
  process.exit(1);
});
