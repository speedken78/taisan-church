import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bannerApi, newsApi } from '../api';

interface Banner {
  _id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
}

interface News {
  _id: string;
  title: string;
  coverImage?: string;
  publishedAt: string;
}

export default function Home() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    bannerApi.getActive().then((r) => setBanners(r.data)).catch(() => {});
    newsApi.getAll().then((r) => setNews(r.data.slice(0, 3))).catch(() => {});
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners]);

  return (
    <main className="flex-1">
      {/* Hero Banner */}
      {banners.length > 0 ? (
        <div className="relative w-full h-[480px] overflow-hidden bg-gray-100">
          {banners.map((banner, idx) => (
            <div
              key={banner._id}
              className={`absolute inset-0 transition-opacity duration-700 ${idx === currentBanner ? 'opacity-100' : 'opacity-0'}`}
            >
              <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
              {banner.linkUrl && (
                <a href={banner.linkUrl} className="absolute inset-0" aria-label={banner.title} />
              )}
            </div>
          ))}
          {banners.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentBanner(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition ${idx === currentBanner ? 'bg-yellow-400' : 'bg-white/60'}`}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-yellow-400 text-white text-center py-32 px-4">
          <h1 className="text-4xl font-bold">泰山幸福教會</h1>
          <p className="mt-3 text-lg">歡迎來到神的家</p>
        </div>
      )}

      {/* 快速導覽 */}
      <section className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { to: '/services', icon: '🕊️', label: '聚會資訊' },
          { to: '/media', icon: '📺', label: '主日直播' },
          { to: '/groups', icon: '👥', label: '小組牧區' },
          { to: '/offering', icon: '💛', label: '線上奉獻' },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-yellow-50 hover:bg-yellow-100 transition text-center"
          >
            <span className="text-3xl">{item.icon}</span>
            <span className="font-semibold text-gray-700">{item.label}</span>
          </Link>
        ))}
      </section>

      {/* 主日直播入口 */}
      <section className="bg-gray-900 text-white py-16 px-4 text-center">
        <h2 className="text-2xl font-bold mb-2">主日直播</h2>
        <p className="text-gray-400 mb-6">每週日上午 10:00 準時直播</p>
        <Link
          to="/media"
          className="inline-block bg-yellow-400 hover:bg-yellow-500 text-white font-semibold px-8 py-3 rounded-full transition"
        >
          觀看直播
        </Link>
      </section>

      {/* 最新消息 */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">最新消息</h2>
          <Link to="/news" className="text-yellow-500 hover:underline text-sm">查看全部 →</Link>
        </div>
        {news.length === 0 ? (
          <p className="text-gray-400 text-center py-8">目前無最新消息</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  <h3 className="font-semibold text-gray-800 line-clamp-2">{item.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
