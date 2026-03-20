import { useEffect, useState } from 'react';
import { mediaApi } from '../api';

type Category = 'sunday' | 'children' | 'equip';

interface MediaItem {
  _id: string;
  title: string;
  youtubeId: string;
  category: Category;
  isPlaylist: boolean;
  isActive: boolean;
  order: number;
}

const CATEGORY_LABELS: Record<Category, string> = {
  sunday: '主日直播',
  children: '幸福兒童樂園',
  equip: '裝備課程',
};

const emptyForm = { title: '', youtubeId: '', category: 'sunday' as Category, isPlaylist: false, isActive: true, order: 0, description: '' };

export default function MediaManager() {
  const [list, setList] = useState<MediaItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => mediaApi.getAll().then((r) => setList(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(emptyForm); setEditId(null); setShowForm(true); };
  const openEdit = (item: MediaItem & { description?: string }) => {
    setForm({ title: item.title, youtubeId: item.youtubeId, category: item.category, isPlaylist: item.isPlaylist, isActive: item.isActive, order: item.order, description: item.description || '' });
    setEditId(item._id);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) await mediaApi.update(editId, form);
      else await mediaApi.create(form);
      setShowForm(false);
      load();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定刪除？')) return;
    await mediaApi.remove(id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">影音資源</h1>
        <button onClick={openNew} className="bg-yellow-400 hover:bg-yellow-500 text-white text-sm font-semibold px-4 py-2 rounded-full">
          + 新增影片
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">{editId ? '編輯影片' : '新增影片'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">標題</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">YouTube ID / 播放清單 ID</label>
                <input type="text" value={form.youtubeId} onChange={(e) => setForm({ ...form, youtubeId: e.target.value })} required
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分類</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300">
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">排序</label>
                <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300" />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="checkbox" checked={form.isPlaylist} onChange={(e) => setForm({ ...form, isPlaylist: e.target.checked })} className="accent-yellow-400" />
                  播放清單
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-yellow-400" />
                  顯示
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 text-white font-semibold py-2 rounded-full">
                  {saving ? '儲存中…' : '儲存'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-full hover:bg-gray-50">取消</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs">
            <tr>
              <th className="px-4 py-3 text-left">標題</th>
              <th className="px-4 py-3 text-left">分類</th>
              <th className="px-4 py-3 text-left">類型</th>
              <th className="px-4 py-3 text-left">狀態</th>
              <th className="px-4 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {list.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{item.title}</td>
                <td className="px-4 py-3 text-gray-500">{CATEGORY_LABELS[item.category]}</td>
                <td className="px-4 py-3 text-gray-500">{item.isPlaylist ? '播放清單' : '單一影片'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {item.isActive ? '顯示' : '隱藏'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button onClick={() => openEdit(item as MediaItem & { description?: string })} className="text-yellow-500 hover:underline text-xs">編輯</button>
                  <button onClick={() => handleDelete(item._id)} className="text-red-400 hover:underline text-xs">刪除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="text-center text-gray-400 py-8">尚無影片</p>}
      </div>
    </div>
  );
}
