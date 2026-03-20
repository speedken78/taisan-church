import { useEffect, useState } from 'react';
import { bannerApi } from '../api';

interface Banner {
  _id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  order: number;
  isActive: boolean;
}

const emptyForm = { title: '', imageUrl: '', linkUrl: '', order: 0, isActive: true };

export default function BannerManager() {
  const [list, setList] = useState<Banner[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => bannerApi.getAll().then((r) => setList(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(emptyForm); setEditId(null); setShowForm(true); };
  const openEdit = (item: Banner) => {
    setForm({ title: item.title, imageUrl: item.imageUrl, linkUrl: item.linkUrl || '', order: item.order, isActive: item.isActive });
    setEditId(item._id);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await bannerApi.update(editId, form);
      } else {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
        await bannerApi.create(fd);
      }
      setShowForm(false);
      load();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定刪除此輪播？')) return;
    await bannerApi.remove(id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">首頁輪播</h1>
        <button onClick={openNew} className="bg-yellow-400 hover:bg-yellow-500 text-white text-sm font-semibold px-4 py-2 rounded-full">
          + 新增輪播
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">{editId ? '編輯輪播' : '新增輪播'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">標題</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">圖片 URL</label>
                <input type="url" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} required
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">連結 URL（選填）</label>
                <input type="url" value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300" />
              </div>
              <div className="flex gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">排序</label>
                  <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                    className="w-24 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-sm mb-2">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-yellow-400" />
                  啟用
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {list.map((item) => (
          <div key={item._id} className="bg-white rounded-2xl shadow-sm overflow-hidden flex">
            <img src={item.imageUrl} alt={item.title} className="w-28 h-20 object-cover bg-gray-100 flex-shrink-0" />
            <div className="p-3 flex-1 min-w-0">
              <p className="font-medium text-gray-800 truncate">{item.title}</p>
              <p className="text-xs text-gray-400">排序：{item.order}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {item.isActive ? '啟用' : '停用'}
              </span>
              <div className="flex gap-2 mt-2">
                <button onClick={() => openEdit(item)} className="text-yellow-500 text-xs hover:underline">編輯</button>
                <button onClick={() => handleDelete(item._id)} className="text-red-400 text-xs hover:underline">刪除</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {list.length === 0 && <p className="text-center text-gray-400 py-8">尚無輪播圖片</p>}
    </div>
  );
}
