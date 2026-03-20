import { useEffect, useState } from 'react';
import { formApi } from '../api';

interface FormItem {
  _id: string;
  title: string;
  type: 'event' | 'group_buy';
  deadline: string;
}

interface FormField {
  key: string;
  label: string;
  type: string;
}

interface Submission {
  _id: string;
  name: string;
  email: string;
  phone: string;
  quantity: number;
  totalAmount: number;
  answers: Record<string, string | string[]>;
  createdAt: string;
}

interface Stats {
  totalQuantity: number;
  totalAmount: number;
  optionStats: Record<string, Record<string, number>>;
}

interface ReportData {
  form: { title: string; type: string; fields: FormField[] };
  submissions: Submission[];
  total: number;
  totalPages: number;
  stats: Stats;
}

export default function FormReport() {
  const [forms, setForms] = useState<FormItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [report, setReport] = useState<ReportData | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    formApi.getAll().then((r) => {
      setForms(r.data);
      if (r.data.length > 0 && !selectedId) setSelectedId(r.data[0]._id);
    });
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    formApi.getSubmissions(selectedId, page)
      .then((r) => setReport(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedId, page]);

  const handleSelectForm = (id: string) => {
    setSelectedId(id);
    setPage(1);
    setReport(null);
  };

  const formatAnswer = (val: string | string[] | undefined): string => {
    if (!val) return '-';
    return Array.isArray(val) ? val.join('、') : String(val);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">報名統計</h1>

      {/* 表單選擇 */}
      <div className="mb-6">
        <label className="block text-xs text-gray-500 mb-1">選擇活動 / 團購</label>
        <select
          value={selectedId}
          onChange={(e) => handleSelectForm(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 w-full max-w-sm"
        >
          {forms.map((f) => (
            <option key={f._id} value={f._id}>
              [{f.type === 'event' ? '活動' : '團購'}] {f.title}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-center text-gray-400 py-8">載入中…</p>}

      {!loading && report && (
        <>
          {/* 統計卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-xs text-gray-400 mb-1">總報名筆數</p>
              <p className="text-2xl font-bold text-gray-800">{report.total}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-xs text-gray-400 mb-1">總數量</p>
              <p className="text-2xl font-bold text-gray-800">{report.stats.totalQuantity}</p>
            </div>
            {report.stats.totalAmount > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-4">
                <p className="text-xs text-gray-400 mb-1">總金額</p>
                <p className="text-2xl font-bold text-yellow-600">
                  NT$ {report.stats.totalAmount.toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {/* 選項分佈 */}
          {Object.entries(report.stats.optionStats).map(([key, counts]) => {
            const field = report.form.fields.find((f) => f.key === key);
            return (
              <div key={key} className="bg-white rounded-xl shadow-sm p-4 mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">{field?.label ?? key}</h3>
                <div className="space-y-2">
                  {Object.entries(counts)
                    .sort(([, a], [, b]) => b - a)
                    .map(([opt, cnt]) => {
                      const total = Object.values(counts).reduce((s, v) => s + v, 0);
                      const pct = total > 0 ? Math.round((cnt / total) * 100) : 0;
                      return (
                        <div key={opt} className="flex items-center gap-3">
                          <span className="text-sm text-gray-600 w-24 shrink-0 truncate">{opt}</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-2">
                            <div
                              className="bg-yellow-400 h-2 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-16 text-right">{cnt} ({pct}%)</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            );
          })}

          {/* 明細表格 */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
              <h3 className="text-sm font-semibold text-gray-700">報名明細</h3>
              <a
                href={`/api/forms/${selectedId}/submissions/export`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-green-600 hover:text-green-800 font-medium"
              >
                匯出 CSV
              </a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs">
                  <tr>
                    <th className="px-4 py-3 text-left">姓名</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">手機</th>
                    <th className="px-4 py-3 text-right">數量</th>
                    {report.stats.totalAmount > 0 && (
                      <th className="px-4 py-3 text-right">金額</th>
                    )}
                    {report.form.fields.map((f) => (
                      <th key={f.key} className="px-4 py-3 text-left">{f.label}</th>
                    ))}
                    <th className="px-4 py-3 text-left">報名時間</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {report.submissions.map((s) => (
                    <tr key={s._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-800">{s.name}</td>
                      <td className="px-4 py-3 text-gray-500">{s.email}</td>
                      <td className="px-4 py-3 text-gray-500">{s.phone}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{s.quantity}</td>
                      {report.stats.totalAmount > 0 && (
                        <td className="px-4 py-3 text-right text-gray-700">
                          NT$ {s.totalAmount.toLocaleString()}
                        </td>
                      )}
                      {report.form.fields.map((f) => (
                        <td key={f.key} className="px-4 py-3 text-gray-500">
                          {formatAnswer(s.answers[f.key])}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {new Date(s.createdAt).toLocaleString('zh-TW')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {report.submissions.length === 0 && (
                <p className="text-center text-gray-400 py-8">尚無報名紀錄</p>
              )}
            </div>
          </div>

          {report.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                上一頁
              </button>
              <span className="px-3 py-1.5 text-sm text-gray-500">{page} / {report.totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(report.totalPages, p + 1))}
                disabled={page === report.totalPages}
                className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                下一頁
              </button>
            </div>
          )}
        </>
      )}

      {!loading && forms.length === 0 && (
        <p className="text-center text-gray-400 py-8">尚無表單，請先至「活動 / 團購管理」新增</p>
      )}
    </div>
  );
}
