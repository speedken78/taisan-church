import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { newsApi } from '../api';

interface NewsItem {
  _id: string;
  title: string;
  coverImage?: string;
  publishedAt: string;
}

export default function News() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    newsApi.getAll()
      .then((r) => setNews(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="flex-1">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">最新消息</h1>
        {loading ? (
          <p className="text-center text-gray-400 py-16">載入中…</p>
        ) : news.length === 0 ? (
          <p className="text-center text-gray-400 py-16">目前無消息</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item) => (
              <Link
                key={item._id}
                to={`/news/${item._id}`}
                className="rounded-xl overflow-hidden shadow hover:shadow-md transition"
              >
                {item.coverImage ? (
                  <img src={item.coverImage} alt={item.title} className="w-full h-48 object-cover" />
                ) : (
                  <div className="w-full h-48 bg-yellow-100 flex items-center justify-center">
                    <span className="text-yellow-400 text-4xl">📰</span>
                  </div>
                )}
                <div className="p-4">
                  <p className="text-xs text-gray-400 mb-1">
                    {new Date(item.publishedAt).toLocaleDateString('zh-TW')}
                  </p>
                  <h2 className="font-semibold text-gray-800 line-clamp-2">{item.title}</h2>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
