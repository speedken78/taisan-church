import { useEffect, useState } from 'react';
import { formApi } from '../api';

type SubmissionStatus = 'pending' | 'confirmed' | 'rejected';

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
  status: SubmissionStatus;
  createdAt: string;
}

interface Stats {
  totalQuantity: number;
  totalAmount: number;
  confirmedQuantity: number;
  confirmedAmount: number;
  pendingCount: number;
  confirmedCount: number;
  rejectedCount: number;
  optionStats: Record<string, Record<string, number>>;
}

interface ReportData {
  form: { title: string; type: string; fields: FormField[] };
  submissions: Submission[];
  total: number;
  totalPages: number;
  stats: Stats;
}

const STATUS_TABS: { key: SubmissionStatus | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待審核' },
  { key: 'confirmed', label: '已確認' },
  { key: 'rejected', label: '已拒絕' },
];

const STATUS_BADGE: Record<SubmissionStatus, { label: string; className: string }> = {
  pending:   { label: '待審核', className: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: '已確認', className: 'bg-green-100 text-green-700' },
  rejected:  { label: '已拒絕', className: 'bg-red-100 text-red-600' },
};

export default function FormReport() {
  const [forms, setForms] = useState<FormItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [report, setReport] = useState<ReportData | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [statusTab, setStatusTab] = useState<SubmissionStatus | 'all'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    formApi.getAll().then((r) => {
      setForms(r.data);
      if (r.data.length > 0 && !selectedId) setSelectedId(r.data[0]._id);
    });
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    const status = statusTab === 'all' ? undefined : statusTab;
    formApi.getSubmissions(selectedId, page, status)
      .then((r) => setReport(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedId, page, statusTab]);

  const handleSelectForm = (id: string) => {
    setSelectedId(id);
    setPage(1);
    setStatusTab('all');
    setReport(null);
  };

  const handleStatusTab = (tab: SubmissionStatus | 'all') => {
    setStatusTab(tab);
    setPage(1);
    setReport(null);
  };

  const handleUpdateStatus = async (submissionId: string, newStatus: SubmissionStatus) => {
    setUpdatingId(submissionId);
    try {
      await formApi.updateSubmissionStatus(submissionId, newStatus);
      // 直接更新前端狀態，不重新拉整個列表
      setReport((prev) => {
        if (!prev) return prev;
        const target = prev.submissions.find((s) => s._id === submissionId);
        if (!target) return prev;
        const oldStatus = target.status;
        if (oldStatus === newStatus) return prev;

        // 同步更新統計數字
        const stats = { ...prev.stats };
        const countKey: Record<SubmissionStatus, keyof typeof stats> = {
          pending: 'pendingCount',
          confirmed: 'confirmedCount',
          rejected: 'rejectedCount',
        };
        (stats[countKey[oldStatus]] as number) -= 1;
        (stats[countKey[newStatus]] as number) += 1;
        if (oldStatus === 'confirmed') {
          stats.confirmedQuantity -= target.quantity;
          stats.confirmedAmount -= target.totalAmount;
        }
        if (newStatus === 'confirmed') {
          stats.confirmedQuantity += target.quantity;
          stats.confirmedAmount += target.totalAmount;
        }

        return {
          ...prev,
          stats,
          submissions: prev.submissions.map((s) =>
            s._id === submissionId ? { ...s, status: newStatus } : s
          ),
        };
      });
    } catch {
      alert('狀態更新失敗，請稍後再試');
    } finally {
      setUpdatingId(null);
    }
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-xs text-gray-400 mb-1">總報名筆數</p>
              <p className="text-2xl font-bold text-gray-800">
                {report.stats.pendingCount + report.stats.confirmedCount + report.stats.rejectedCount}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-yellow-400">
              <p className="text-xs text-gray-400 mb-1">待審核</p>
              <p className="text-2xl font-bold text-yellow-500">{report.stats.pendingCount}</p>
              <p className="text-xs text-gray-400 mt-0.5">尚待處理</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-400">
              <p className="text-xs text-gray-400 mb-1">已確認</p>
              <p className="text-2xl font-bold text-green-600">{report.stats.confirmedCount}</p>
              {report.stats.totalAmount > 0 && (
                <p className="text-xs text-gray-400 mt-0.5">
                  NT$ {report.stats.confirmedAmount.toLocaleString()}
                </p>
              )}
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-red-300">
              <p className="text-xs text-gray-400 mb-1">已拒絕</p>
              <p className="text-2xl font-bold text-red-500">{report.stats.rejectedCount}</p>
            </div>
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
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
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

            {/* 狀態篩選 Tab */}
            <div className="flex border-b border-gray-100 px-4">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleStatusTab(tab.key)}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${
                    statusTab === tab.key
                      ? 'border-yellow-400 text-yellow-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                  {tab.key === 'pending' && report.stats.pendingCount > 0 && (
                    <span className="ml-1.5 bg-yellow-400 text-white text-xs rounded-full px-1.5 py-0.5">
                      {report.stats.pendingCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs">
                  <tr>
                    <th className="px-4 py-3 text-left">狀態</th>
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
                    <th className="px-4 py-3 text-left">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {report.submissions.map((s) => {
                    const badge = STATUS_BADGE[s.status];
                    const isUpdating = updatingId === s._id;
                    return (
                      <tr key={s._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${badge.className}`}>
                            {badge.label}
                          </span>
                        </td>
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
                        <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                          {new Date(s.createdAt).toLocaleString('zh-TW')}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5">
                            {s.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(s._id, 'confirmed')}
                                  disabled={isUpdating}
                                  className="text-xs px-2.5 py-1 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition disabled:opacity-40"
                                >
                                  確認
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(s._id, 'rejected')}
                                  disabled={isUpdating}
                                  className="text-xs px-2.5 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition disabled:opacity-40"
                                >
                                  拒絕
                                </button>
                              </>
                            )}
                            {s.status === 'confirmed' && (
                              <button
                                onClick={() => handleUpdateStatus(s._id, 'pending')}
                                disabled={isUpdating}
                                className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition disabled:opacity-40"
                              >
                                撤銷
                              </button>
                            )}
                            {s.status === 'rejected' && (
                              <button
                                onClick={() => handleUpdateStatus(s._id, 'pending')}
                                disabled={isUpdating}
                                className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition disabled:opacity-40"
                              >
                                重新審核
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
