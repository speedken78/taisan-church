import { useEffect, useState } from 'react';
import { pastorWorkApi } from '../api';

interface PastorWork {
  _id: string;
  title: string;
  author: string;
  coverImage: string;
  description: string;
  purchaseUrl: string;
  isActive: boolean;
  order: number;
}

const emptyForm = { title: '', author: '', coverImage: '', description: '', purchaseUrl: '', isActive: true, order: 0 };

export default function PastorWorkManager() {
  const [list, setList] = useState<PastorWork[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => pastorWorkApi.getAll().then((r) => setList(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(emptyForm); setEditId(null); setShowForm(true); };
  const openEdit = (item: PastorWork) => {
    setForm({ title: item.title, author: item.author, coverImage: item.coverImage, description: item.description, purchaseUrl: item.purchaseUrl, isActive: item.isActive, order: item.order });
    setEditId(item._id);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) await pastorWorkApi.update(editId, form);
      else {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
        await pastorWorkApi.create(fd);
      }
      setShowForm(false);
      load();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定刪除此著作？')) return;
    await pastorWorkApi.remove(id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">牧師著作</h1>
        <button onClick={openNew} className="bg-yellow-400 hover:bg-yellow-500 text-white text-sm font-semibold px-4 py-2 rounded-full">
          + 新增著作
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">{editId ? '編輯著作' : '新增著作'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              {[
                { label: '書名', key: 'title', type: 'text', required: true },
                { label: '作者', key: 'author', type: 'text', required: true },
                { label: '封面圖片 URL', key: 'coverImage', type: 'url', required: true },
                { label: '購買連結', key: 'purchaseUrl', type: 'url', required: true },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    value={(form as Record<string, string | boolean | number>)[f.key] as string}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    required={f.required}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">書籍簡介</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300" />
              </div>
              <div className="flex gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">排序</label>
                  <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                    className="w-24 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-sm mt-6">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-yellow-400" />
                  顯示於前台
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
          <div key={item._id} className="bg-white rounded-2xl shadow-sm p-4 flex gap-4">
            <img src={item.coverImage} alt={item.title} className="w-20 h-28 object-cover rounded-lg bg-gray-100 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800">{item.title}</p>
              <p className="text-sm text-gray-500">{item.author}</p>
              <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.description}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => openEdit(item)} className="text-yellow-500 text-xs hover:underline">編輯</button>
                <button onClick={() => handleDelete(item._id)} className="text-red-400 text-xs hover:underline">刪除</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {list.length === 0 && <p className="text-center text-gray-400 py-8">尚無著作</p>}
    </div>
  );
}
