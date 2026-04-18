import { useEffect, useState } from 'react';
import { resourceCategoryApi, resourceApi } from '../api';

interface Category {
  _id: string;
  name: string;
  order: number;
}

interface Resource {
  _id: string;
  title: string;
  description?: string;
  category: Category;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  downloads: number;
  createdAt: string;
}

const FILE_ICONS: Record<string, string> = {
  pdf:  '📄',
  doc:  '📝',
  docx: '📝',
  xls:  '📊',
  xlsx: '📊',
  ppt:  '📋',
  pptx: '📋',
  jpg:  '🖼️',
  jpeg: '🖼️',
  png:  '🖼️',
  webp: '🖼️',
};

const isImage = (fileName: string) => /\.(jpg|jpeg|png|webp)$/i.test(fileName);
const isPdf   = (fileName: string) => /\.pdf$/i.test(fileName);

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Resources() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [activeCat, setActiveCat] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<Resource | null>(null);

  useEffect(() => {
    resourceCategoryApi.getAll().then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const catId = activeCat === 'all' ? undefined : activeCat;
    resourceApi.getAll(catId)
      .then((r) => setResources(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeCat]);

  // ESC 關閉燈箱
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <main className="flex-1">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">資源中心</h1>
        <p className="text-gray-500 mb-8">點擊下載按鈕即可取得相關檔案資源</p>

        {/* 分類 tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveCat('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              activeCat === 'all'
                ? 'bg-yellow-400 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            全部
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setActiveCat(cat._id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                activeCat === cat._id
                  ? 'bg-yellow-400 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* 資源列表 */}
        {loading ? (
          <p className="text-center text-gray-400 py-16">載入中…</p>
        ) : resources.length === 0 ? (
          <p className="text-center text-gray-400 py-16">目前無資源</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition"
              >
                {/* 圖片縮圖 */}
                {isImage(item.fileName) && (
                  <img
                    src={item.fileUrl}
                    alt={item.title}
                    className="w-full h-40 object-cover rounded-md mb-3 cursor-pointer"
                    onClick={() => setLightbox(item)}
                  />
                )}

                <div className="flex items-start gap-4">
                  {!isImage(item.fileName) && (
                    <div className="text-4xl select-none">
                      {FILE_ICONS[item.fileType] ?? '📁'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{item.title}</p>
                    {item.description && (
                      <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span className="bg-gray-100 px-2 py-0.5 rounded-full">{item.category.name}</span>
                      <span>{item.fileType.toUpperCase()}</span>
                      <span>{formatSize(item.fileSize)}</span>
                      <span>下載 {item.downloads} 次</span>
                    </div>
                  </div>

                  {/* 操作按鈕 */}
                  <div className="shrink-0 flex gap-2">
                    {isImage(item.fileName) ? (
                      <button
                        onClick={() => setLightbox(item)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-white text-xs font-semibold px-3 py-2 rounded-lg transition"
                      >
                        查看
                      </button>
                    ) : isPdf(item.fileName) ? (
                      <>
                        <a
                          href={item.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-center bg-blue-50 text-blue-600 px-3 py-2 rounded text-xs hover:bg-blue-100 transition"
                        >
                          預覽
                        </a>
                        <a
                          href={resourceApi.download(item._id)}
                          className="text-center bg-gray-100 text-gray-700 px-3 py-2 rounded text-xs hover:bg-gray-200 transition"
                        >
                          下載
                        </a>
                      </>
                    ) : (
                      <a
                        href={resourceApi.download(item._id)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-white text-xs font-semibold px-3 py-2 rounded-lg transition"
                      >
                        下載
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 圖片燈箱 */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightbox.fileUrl}
              alt={lightbox.title}
              className="w-full h-auto rounded-lg"
            />
            <div className="flex justify-between items-center mt-3">
              <span className="text-white text-sm">{lightbox.title}</span>
              <div className="flex gap-2">
                <a
                  href={resourceApi.download(lightbox._id)}
                  className="bg-white text-gray-800 px-4 py-2 rounded text-sm hover:bg-gray-100 transition"
                >
                  下載
                </a>
                <button
                  onClick={() => setLightbox(null)}
                  className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-500 transition"
                >
                  關閉
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
