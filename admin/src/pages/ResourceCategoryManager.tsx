import { useEffect, useState } from 'react';
import { resourceCategoryApi } from '../api';

interface Category {
  _id: string;
  name: string;
  order: number;
}

export default function ResourceCategoryManager() {
  const [list, setList] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [order, setOrder] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () =>
    resourceCategoryApi.getAll().then((r) => setList(r.data)).catch(() => {});

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditItem(null);
    setName('');
    setOrder(list.length + 1);
    setError('');
    setShowForm(true);
  };

  const openEdit = (item: Category) => {
    setEditItem(item);
    setName(item.name);
    setOrder(item.order);
    setError('');
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editItem) {
        await resourceCategoryApi.update(editItem._id, { name, order });
      } else {
        await resourceCategoryApi.create({ name, order });
      }
      setShowForm(false);
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || '儲存失敗');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定刪除此分類？')) return;
    try {
      await resourceCategoryApi.remove(id);
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg || '刪除失敗');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">資源分類管理</h1>
        <button onClick={openNew} className="bg-yellow-400 hover:bg-yellow-500 text-white text-sm font-semibold px-4 py-2 rounded-full">
          + 新增分類
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold mb-4">{editItem ? '編輯分類' : '新增分類'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分類名稱</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">排列順序</label>
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 text-white font-semibold py-2 rounded-full">
                  {saving ? '儲存中…' : '儲存'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-full hover:bg-gray-50">
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs">
            <tr>
              <th className="px-4 py-3 text-left">分類名稱</th>
              <th className="px-4 py-3 text-left">順序</th>
              <th className="px-4 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {list.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
                <td className="px-4 py-3 text-gray-400">{item.order}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button onClick={() => openEdit(item)} className="text-yellow-500 hover:underline text-xs">編輯</button>
                  <button onClick={() => handleDelete(item._id)} className="text-red-400 hover:underline text-xs">刪除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="text-center text-gray-400 py-8">尚無分類</p>}
      </div>
    </div>
  );
}
