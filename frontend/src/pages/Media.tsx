import { useEffect, useState } from 'react';
import { mediaApi } from '../api';

type Tab = 'sunday' | 'children' | 'equip';

interface MediaItem {
  _id: string;
  title: string;
  youtubeId: string;
  isPlaylist: boolean;
  description?: string;
  publishedAt: string;
}

const TABS: { key: Tab; label: string }[] = [
  { key: 'sunday', label: '主日直播' },
  { key: 'children', label: '幸福兒童樂園' },
  { key: 'equip', label: '裝備課程' },
];

export default function Media() {
  const [activeTab, setActiveTab] = useState<Tab>('sunday');
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<MediaItem | null>(null);

  useEffect(() => {
    setLoading(true);
    mediaApi
      .getByCategory(activeTab)
      .then((r) => {
        setItems(r.data);
        setSelected(r.data[0] ?? null);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [activeTab]);

  const getEmbedUrl = (item: MediaItem) => {
    if (item.isPlaylist) {
      return `https://www.youtube.com/embed/videoseries?list=${item.youtubeId}`;
    }
    return `https://www.youtube.com/embed/${item.youtubeId}`;
  };

  return (
    <main className="flex-1">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">影音資源</h1>

        {/* Tab 切換 */}
        <div className="flex gap-2 mb-8 border-b">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 text-sm font-semibold border-b-2 -mb-px transition ${
                activeTab === tab.key
                  ? 'border-yellow-400 text-yellow-500'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-16">載入中…</p>
        ) : items.length === 0 ? (
          <p className="text-center text-gray-400 py-16">目前暫無影片</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 主播放器 */}
            <div className="lg:col-span-2">
              {selected && (
                <>
                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
                    <iframe
                      src={getEmbedUrl(selected)}
                      title={selected.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-gray-800">{selected.title}</h2>
                  {selected.description && (
                    <p className="mt-1 text-sm text-gray-500">{selected.description}</p>
                  )}
                </>
              )}
            </div>

            {/* 播放清單 */}
            <div className="flex flex-col gap-3 max-h-[480px] overflow-y-auto pr-1">
              {items.map((item) => (
                <button
                  key={item._id}
                  onClick={() => setSelected(item)}
                  className={`flex gap-3 p-3 rounded-xl text-left transition ${
                    selected?._id === item._id
                      ? 'bg-yellow-50 border border-yellow-300'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <img
                    src={`https://img.youtube.com/vi/${item.isPlaylist ? 'default' : item.youtubeId}/mqdefault.jpg`}
                    alt={item.title}
                    className="w-24 h-16 object-cover rounded-lg flex-shrink-0 bg-gray-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.png';
                    }}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 line-clamp-2">{item.title}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(item.publishedAt).toLocaleDateString('zh-TW')}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
