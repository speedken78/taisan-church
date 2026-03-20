import { useEffect, useState } from 'react';
import { groupApi } from '../api';

interface Group {
  _id: string;
  name: string;
  description: string;
  leader: string;
  imageUrl?: string;
  meetingTime?: string;
}

export default function Groups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    groupApi.getAll()
      .then((r) => setGroups(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="flex-1">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">小組 / 牧區</h1>
        <p className="text-gray-500 mb-8">找到適合你的小組，一起成長</p>

        {loading ? (
          <p className="text-center text-gray-400 py-16">載入中…</p>
        ) : groups.length === 0 ? (
          <p className="text-center text-gray-400 py-16">暫無小組資料</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groups.map((group) => (
              <div key={group._id} className="flex gap-4 p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow transition">
                {group.imageUrl ? (
                  <img src={group.imageUrl} alt={group.name} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-yellow-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">👥</span>
                  </div>
                )}
                <div>
                  <h2 className="font-bold text-gray-800 mb-1">{group.name}</h2>
                  <p className="text-sm text-gray-500 mb-2">負責人：{group.leader}</p>
                  {group.meetingTime && (
                    <p className="text-sm text-yellow-600 mb-2">🕐 {group.meetingTime}</p>
                  )}
                  <p className="text-sm text-gray-600 line-clamp-2">{group.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
