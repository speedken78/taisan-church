import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { newsApi } from '../api';

interface NewsItem {
  _id: string;
  title: string;
  content: string;
  coverImage?: string;
  publishedAt: string;
}

export default function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    newsApi.getById(id)
      .then((r) => setNews(r.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-center py-16 text-gray-400">載入中…</p>;
  if (notFound || !news) return (
    <div className="text-center py-16">
      <p className="text-gray-400 mb-4">找不到此消息</p>
      <Link to="/news" className="text-yellow-500 hover:underline">← 返回消息列表</Link>
    </div>
  );

  return (
    <main className="flex-1">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link to="/news" className="text-yellow-500 hover:underline text-sm">← 返回消息列表</Link>
        {news.coverImage && (
          <img src={news.coverImage} alt={news.title} className="w-full rounded-xl mt-4 mb-6 object-cover max-h-72" />
        )}
        <p className="text-xs text-gray-400 mb-2">
          {new Date(news.publishedAt).toLocaleDateString('zh-TW')}
        </p>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">{news.title}</h1>
        <div
          className="prose prose-gray max-w-none text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: news.content }}
        />
      </div>
    </main>
  );
}
