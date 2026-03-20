import { useEffect, useState } from 'react';
import { formApi } from '../api';

interface FormField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'radio' | 'checkbox';
  options: string[];
  required: boolean;
}

interface FormItem {
  _id: string;
  title: string;
  type: 'event' | 'group_buy';
  isOpen: boolean;
  deadline: string;
  totalLimit?: number;
}

const FIELD_TYPE_LABELS = {
  text: '文字',
  number: '數字',
  select: '下拉選單',
  radio: '單選',
  checkbox: '多選',
};

const emptyField = (): FormField => ({
  key: `field_${Date.now()}`,
  label: '',
  type: 'text',
  options: [],
  required: false,
});

const emptyForm = () => ({
  title: '',
  description: '',
  type: 'event' as 'event' | 'group_buy',
  price: '',
  maxQuantity: '1',
  totalLimit: '0',
  deadline: '',
  isOpen: false,
  fields: [] as FormField[],
});

export default function FormManager() {
  const [forms, setForms] = useState<FormItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    formApi.getAll()
      .then((r) => setForms(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setError('');
    setShowModal(true);
  };

  const openEdit = (item: FormItem) => {
    formApi.getById(item._id).then((r) => {
      const d = r.data;
      setForm({
        title: d.title,
        description: d.description ?? '',
        type: d.type,
        price: d.price != null ? String(d.price) : '',
        maxQuantity: String(d.maxQuantity ?? 1),
        totalLimit: String(d.totalLimit ?? 0),
        deadline: d.deadline ? d.deadline.slice(0, 10) : '',
        isOpen: d.isOpen,
        fields: (d.fields ?? []).map((f: FormField) => ({ ...f, options: f.options ?? [] })),
      });
      setEditingId(item._id);
      setError('');
      setShowModal(true);
    });
  };

  const handleSave = async () => {
    setError('');
    if (!form.title.trim()) { setError('請填寫活動名稱'); return; }
    if (!form.deadline) { setError('請填寫截止日期'); return; }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      type: form.type,
      price: form.price !== '' ? Number(form.price) : undefined,
      maxQuantity: Number(form.maxQuantity) || 1,
      totalLimit: Number(form.totalLimit) || 0,
      deadline: new Date(form.deadline).toISOString(),
      isOpen: form.isOpen,
      fields: form.fields.map((f) => ({
        key: f.key,
        label: f.label,
        type: f.type,
        options: f.options,
        required: f.required,
      })),
    };

    setSaving(true);
    try {
      if (editingId) {
        await formApi.update(editingId, payload);
      } else {
        await formApi.create(payload);
      }
      setShowModal(false);
      load();
    } catch {
      setError('儲存失敗，請稍後再試');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`確定要刪除「${title}」？所有報名紀錄將一併刪除。`)) return;
    await formApi.remove(id);
    load();
  };

  // ── 欄位編輯 ────────────────────────────────────────

  const addField = () => {
    setForm((prev) => ({ ...prev, fields: [...prev.fields, emptyField()] }));
  };

  const updateField = (index: number, patch: Partial<FormField>) => {
    setForm((prev) => {
      const fields = [...prev.fields];
      fields[index] = { ...fields[index], ...patch };
      return { ...prev, fields };
    });
  };

  const removeField = (index: number) => {
    setForm((prev) => ({ ...prev, fields: prev.fields.filter((_, i) => i !== index) }));
  };

  const moveField = (index: number, dir: -1 | 1) => {
    setForm((prev) => {
      const fields = [...prev.fields];
      const target = index + dir;
      if (target < 0 || target >= fields.length) return prev;
      [fields[index], fields[target]] = [fields[target], fields[index]];
      return { ...prev, fields };
    });
  };

  const updateOptions = (index: number, raw: string) => {
    updateField(index, { options: raw.split('\n').map((s) => s.trim()).filter(Boolean) });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">活動 / 團購管理</h1>
        <button
          onClick={openCreate}
          className="bg-yellow-400 hover:bg-yellow-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
        >
          + 新增
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-400 py-8">載入中…</p>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs">
              <tr>
                <th className="px-4 py-3 text-left">名稱</th>
                <th className="px-4 py-3 text-left">類型</th>
                <th className="px-4 py-3 text-left">截止日</th>
                <th className="px-4 py-3 text-left">狀態</th>
                <th className="px-4 py-3 text-left">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {forms.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-800 font-medium">{item.title}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {item.type === 'event' ? '活動報名' : '團購'}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(item.deadline).toLocaleDateString('zh-TW')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      item.isOpen ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {item.isOpen ? '開放中' : '未開放'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => openEdit(item)}
                        className="text-blue-500 hover:text-blue-700 text-xs"
                      >
                        編輯
                      </button>
                      <a
                        href={`/api/forms/${item._id}/submissions/export`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-green-600 hover:text-green-800 text-xs"
                      >
                        匯出
                      </a>
                      <button
                        onClick={() => handleDelete(item._id, item.title)}
                        className="text-red-400 hover:text-red-600 text-xs"
                      >
                        刪除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {forms.length === 0 && <p className="text-center text-gray-400 py-8">尚無表單</p>}
        </div>
      )}

      {/* ── Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto py-8">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-5">
              {editingId ? '編輯表單' : '新增表單'}
            </h2>

            <div className="space-y-4">
              {/* 基本設定 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">活動名稱 *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">活動說明</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    rows={2}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">類型</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as 'event' | 'group_buy' }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    <option value="event">活動報名</option>
                    <option value="group_buy">團購</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">截止日期 *</label>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">單價（NT$，選填）</label>
                  <input
                    type="number"
                    min={0}
                    value={form.price}
                    onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="不填則不顯示金額"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">每人最多數量</label>
                  <input
                    type="number"
                    min={1}
                    value={form.maxQuantity}
                    onChange={(e) => setForm((p) => ({ ...p, maxQuantity: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">人數上限（0 = 無限制）</label>
                  <input
                    type="number"
                    min={0}
                    value={form.totalLimit}
                    onChange={(e) => setForm((p) => ({ ...p, totalLimit: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isOpen"
                    checked={form.isOpen}
                    onChange={(e) => setForm((p) => ({ ...p, isOpen: e.target.checked }))}
                    className="accent-yellow-400"
                  />
                  <label htmlFor="isOpen" className="text-sm text-gray-700">開放報名</label>
                </div>
              </div>

              {/* 自訂欄位 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-700">自訂欄位</h3>
                  <button
                    type="button"
                    onClick={addField}
                    className="text-xs text-yellow-600 hover:text-yellow-800 font-medium"
                  >
                    + 新增欄位
                  </button>
                </div>

                {form.fields.length === 0 && (
                  <p className="text-xs text-gray-400 py-2">尚無自訂欄位</p>
                )}

                <div className="space-y-3">
                  {form.fields.map((field, idx) => (
                    <div key={field.key} className="border border-gray-100 rounded-xl p-3 bg-gray-50">
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                          <label className="block text-xs text-gray-400 mb-0.5">欄位名稱</label>
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => updateField(idx, { label: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            placeholder="例：T-shirt 尺寸"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-0.5">欄位類型</label>
                          <select
                            value={field.type}
                            onChange={(e) => updateField(idx, { type: e.target.value as FormField['type'] })}
                            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-yellow-400"
                          >
                            {Object.entries(FIELD_TYPE_LABELS).map(([v, l]) => (
                              <option key={v} value={v}>{l}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {['select', 'radio', 'checkbox'].includes(field.type) && (
                        <div className="mb-2">
                          <label className="block text-xs text-gray-400 mb-0.5">選項（每行一個）</label>
                          <textarea
                            value={field.options.join('\n')}
                            onChange={(e) => updateOptions(idx, e.target.value)}
                            rows={3}
                            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            placeholder={"S\nM\nL\nXL"}
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => updateField(idx, { required: e.target.checked })}
                            className="accent-yellow-400"
                          />
                          必填
                        </label>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => moveField(idx, -1)} className="text-xs text-gray-400 hover:text-gray-600">↑</button>
                          <button type="button" onClick={() => moveField(idx, 1)} className="text-xs text-gray-400 hover:text-gray-600">↓</button>
                          <button type="button" onClick={() => removeField(idx)} className="text-xs text-red-400 hover:text-red-600">刪除</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm bg-yellow-400 hover:bg-yellow-500 text-white rounded-lg font-semibold disabled:opacity-50"
              >
                {saving ? '儲存中…' : '儲存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
