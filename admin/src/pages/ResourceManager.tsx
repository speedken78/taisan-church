import { useEffect, useState, useRef } from 'react';
import { resourceApi, resourceCategoryApi } from '../api';

interface Category {
  _id: string;
  name: string;
}

interface Resource {
  _id: string;
  title: string;
  description?: string;
  category: Category;
  fileName: string;
  fileSize: number;
  fileType: string;
  downloads: number;
  isPublished: boolean;
  createdAt: string;
}

interface FormState {
  title: string;
  description: string;
  category: string;
  isPublished: boolean;
}

const emptyForm: FormState = { title: '', description: '', category: '', isPublished: false };

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ResourceManager() {
  const [list, setList] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => resourceApi.getAll().then((r) => setList(r.data)).catch(() => {});
  const loadCats = () => resourceCategoryApi.getAll().then((r) => setCategories(r.data)).catch(() => {});

  useEffect(() => { load(); loadCats(); }, []);

  const openNew = () => {
    setForm({ ...emptyForm, category: categories[0]?._id ?? '' });
    setEditId(null);
    setError('');
    setShowForm(true);
  };

  const openEdit = (item: Resource) => {
    setForm({
      title: item.title,
      description: item.description ?? '',
      category: item.category._id,
      isPublished: item.isPublished,
    });
    setEditId(item._id);
    setError('');
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editId) {
        // 編輯：只更新文字欄位，不重新上傳檔案
        await resourceApi.update(editId, form);
      } else {
        // 新增：必須有檔案
        const file = fileRef.current?.files?.[0];
        if (!file) { setError('請選擇要上傳的檔案'); setSaving(false); return; }
        const fd = new FormData();
        fd.append('file', file);
        fd.append('title', form.title);
        fd.append('description', form.description);
        fd.append('category', form.category);
        fd.append('isPublished', String(form.isPublished));
        await resourceApi.create(fd);
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
    if (!confirm('確定刪除此資源？檔案將一併從伺服器刪除。')) return;
    try {
      await resourceApi.remove(id);
      load();
    } catch {
      alert('刪除失敗');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">資源中心</h1>
        <button onClick={openNew} className="bg-yellow-400 hover:bg-yellow-500 text-white text-sm font-semibold px-4 py-2 rounded-full">
          + 上傳資源
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">{editId ? '編輯資源' : '上傳資源'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">標題</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">說明（選填）</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分類</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  required
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
                >
                  <option value="">請選擇分類</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              {!editId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    檔案（PDF / Word / Excel / PowerPoint / 圖片，最大 30MB）
                  </label>
                  <input
                    type="file"
                    ref={fileRef}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.webp"
                    required
                    className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-sm file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
                  />
                </div>
              )}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                  className="w-4 h-4 accent-yellow-400"
                />
                <span className="text-sm text-gray-700">立即公開</span>
              </label>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 text-white font-semibold py-2 rounded-full">
                  {saving ? '上傳中…' : '儲存'}
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
              <th className="px-4 py-3 text-left">標題</th>
              <th className="px-4 py-3 text-left">分類</th>
              <th className="px-4 py-3 text-left">檔案</th>
              <th className="px-4 py-3 text-left">下載</th>
              <th className="px-4 py-3 text-left">狀態</th>
              <th className="px-4 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {list.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800 max-w-xs truncate">{item.title}</td>
                <td className="px-4 py-3 text-gray-500">{item.category.name}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  <span className="uppercase font-semibold text-gray-500">{item.fileType}</span>
                  {' '}{formatSize(item.fileSize)}
                </td>
                <td className="px-4 py-3 text-gray-400">{item.downloads}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    item.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {item.isPublished ? '已公開' : '草稿'}
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
        {list.length === 0 && <p className="text-center text-gray-400 py-8">尚無資源</p>}
      </div>
    </div>
  );
}
