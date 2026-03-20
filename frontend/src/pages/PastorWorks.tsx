import { useEffect, useState } from 'react';
import { pastorWorkApi } from '../api';

interface PastorWork {
  _id: string;
  title: string;
  author: string;
  coverImage: string;
  description: string;
  purchaseUrl: string;
}

export default function PastorWorks() {
  const [works, setWorks] = useState<PastorWork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    pastorWorkApi.getAll()
      .then((r) => setWorks(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="flex-1">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">牧師著作</h1>
        <p className="text-gray-500 mb-8">牧師歷年出版書籍</p>

        {loading ? (
          <p className="text-center text-gray-400 py-16">載入中…</p>
        ) : works.length === 0 ? (
          <p className="text-center text-gray-400 py-16">暫無著作資料</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {works.map((work) => (
              <div key={work._id} className="flex flex-col rounded-2xl overflow-hidden shadow hover:shadow-md transition">
                <img
                  src={work.coverImage}
                  alt={work.title}
                  className="w-full h-64 object-cover bg-gray-100"
                />
                <div className="p-5 flex flex-col flex-1">
                  <h2 className="font-bold text-gray-800 text-lg mb-1">{work.title}</h2>
                  <p className="text-sm text-gray-500 mb-3">{work.author}</p>
                  <p className="text-sm text-gray-600 leading-relaxed flex-1 line-clamp-3">
                    {work.description}
                  </p>
                  <a
                    href={work.purchaseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 block text-center bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-2 rounded-full transition"
                  >
                    購買書籍
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
