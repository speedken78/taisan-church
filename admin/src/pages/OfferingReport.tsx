import { useEffect, useState } from 'react';
import { offeringApi } from '../api';

interface OfferingRecord {
  _id: string;
  merchantOrderNo: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  purpose: string;
  status: 'pending' | 'success' | 'failed';
  createdAt: string;
}

const STATUS_LABELS = { pending: '處理中', success: '成功', failed: '失敗' };
const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  success: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-500',
};

export default function OfferingReport() {
  const [records, setRecords] = useState<OfferingRecord[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = (p: number) => {
    setLoading(true);
    offeringApi.getRecords(p)
      .then((r) => {
        setRecords(r.data.records);
        setTotalPages(r.data.totalPages);
        setTotal(r.data.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(page); }, [page]);

  const handleUpdateStatus = async (id: string, status: OfferingRecord['status']) => {
    if (!confirm(`確定要將此筆狀態改為「${STATUS_LABELS[status]}」？`)) return;
    setUpdatingId(id);
    try {
      await offeringApi.updateStatus(id, status);
      setRecords((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status } : r))
      );
    } catch {
      alert('狀態更新失敗，請稍後再試');
    } finally {
      setUpdatingId(null);
    }
  };

  const successAmount = records
    .filter((r) => r.status === 'success')
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">奉獻記錄</h1>
      <p className="text-sm text-gray-500 mb-6">共 {total} 筆 ｜ 本頁成功奉獻總額：NT$ {successAmount.toLocaleString()}</p>

      {loading ? (
        <p className="text-center text-gray-400 py-8">載入中…</p>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">訂單編號</th>
                  <th className="px-4 py-3 text-left">姓名</th>
                  <th className="px-4 py-3 text-left">用途</th>
                  <th className="px-4 py-3 text-right">金額</th>
                  <th className="px-4 py-3 text-left">狀態</th>
                  <th className="px-4 py-3 text-left">時間</th>
                  <th className="px-4 py-3 text-left">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {records.map((r) => {
                  const isUpdating = updatingId === r._id;
                  return (
                  <tr key={r._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400 text-xs font-mono">{r.merchantOrderNo}</td>
                    <td className="px-4 py-3 text-gray-800">{r.donorName}</td>
                    <td className="px-4 py-3 text-gray-500">{r.purpose}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800">NT$ {r.amount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[r.status]}`}>
                        {STATUS_LABELS[r.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(r.createdAt).toLocaleDateString('zh-TW')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        {r.status !== 'success' && (
                          <button
                            onClick={() => handleUpdateStatus(r._id, 'success')}
                            disabled={isUpdating}
                            className="text-xs px-2.5 py-1 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition disabled:opacity-40"
                          >
                            標示成功
                          </button>
                        )}
                        {r.status !== 'failed' && (
                          <button
                            onClick={() => handleUpdateStatus(r._id, 'failed')}
                            disabled={isUpdating}
                            className="text-xs px-2.5 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition disabled:opacity-40"
                          >
                            標示失敗
                          </button>
                        )}
                        {r.status !== 'pending' && (
                          <button
                            onClick={() => handleUpdateStatus(r._id, 'pending')}
                            disabled={isUpdating}
                            className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition disabled:opacity-40"
                          >
                            重設
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  );
                })}

              </tbody>
            </table>
            {records.length === 0 && <p className="text-center text-gray-400 py-8">尚無奉獻記錄</p>}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">
                上一頁
              </button>
              <span className="px-3 py-1.5 text-sm text-gray-500">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">
                下一頁
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
