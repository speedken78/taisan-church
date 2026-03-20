import { useEffect, useState } from 'react';
import { groupApi } from '../api';

interface Group {
  _id: string;
  name: string;
  description: string;
  leader: string;
  imageUrl?: string;
  meetingTime?: string;
  isActive: boolean;
  order: number;
}

const emptyForm = { name: '', description: '', leader: '', imageUrl: '', meetingTime: '', isActive: true, order: 0 };

export default function GroupManager() {
  const [list, setList] = useState<Group[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => groupApi.getAll().then((r) => setList(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(emptyForm); setEditId(null); setShowForm(true); };
  const openEdit = (item: Group) => {
    setForm({ name: item.name, description: item.description, leader: item.leader, imageUrl: item.imageUrl || '', meetingTime: item.meetingTime || '', isActive: item.isActive, order: item.order });
    setEditId(item._id);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) await groupApi.update(editId, form);
      else {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
        await groupApi.create(fd);
      }
      setShowForm(false);
      load();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定刪除此小組？')) return;
    await groupApi.remove(id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">小組管理</h1>
        <button onClick={openNew} className="bg-yellow-400 hover:bg-yellow-500 text-white text-sm font-semibold px-4 py-2 rounded-full">
          + 新增小組
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">{editId ? '編輯小組' : '新增小組'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              {[
                { label: '小組名稱', key: 'name', required: true },
                { label: '負責人', key: 'leader', required: true },
                { label: '聚會時間', key: 'meetingTime', required: false },
                { label: '圖片 URL（選填）', key: 'imageUrl', required: false },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                  <input type="text" value={(form as Record<string, string | boolean | number>)[f.key] as string}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    required={f.required}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">小組介紹</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300" />
              </div>
              <div className="flex gap-4 items-center">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">排序</label>
                  <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                    className="w-24 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-sm mt-4">
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
              <th className="px-4 py-3 text-left">小組名稱</th>
              <th className="px-4 py-3 text-left">負責人</th>
              <th className="px-4 py-3 text-left">聚會時間</th>
              <th className="px-4 py-3 text-left">狀態</th>
              <th className="px-4 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {list.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
                <td className="px-4 py-3 text-gray-500">{item.leader}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{item.meetingTime || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {item.isActive ? '顯示' : '隱藏'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button onClick={() => openEdit(item)} className="text-yellow-500 hover:underline text-xs">編輯</button>
                  <button onClick={() => handleDelete(item._id)} className="text-red-400 hover:underline text-xs">刪除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="text-center text-gray-400 py-8">尚無小組</p>}
      </div>
    </div>
  );
}
