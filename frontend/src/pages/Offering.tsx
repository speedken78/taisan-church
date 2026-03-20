import { useState } from 'react';
import { offeringApi } from '../api';

const PURPOSES = ['一般奉獻', '十一奉獻', '建堂奉獻', '宣教奉獻', '其他'];

export default function Offering() {
  const [form, setForm] = useState({
    amount: '',
    donorName: '',
    donorEmail: '',
    donorPhone: '',
    purpose: '一般奉獻',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (Number(form.amount) < 1) {
      setError('請輸入有效的奉獻金額');
      return;
    }

    setLoading(true);
    try {
      const res = await offeringApi.create({
        amount: Number(form.amount),
        donorName: form.donorName,
        donorEmail: form.donorEmail,
        donorPhone: form.donorPhone,
        purpose: form.purpose,
      });

      const { apiUrl, merchantId, tradeInfo, tradeSha, version } = res.data;

      // 動態建立表單並提交到藍新
      const formEl = document.createElement('form');
      formEl.method = 'POST';
      formEl.action = apiUrl;
      const fields = { MerchantID: merchantId, TradeInfo: tradeInfo, TradeSha: tradeSha, Version: version };
      Object.entries(fields).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        formEl.appendChild(input);
      });
      document.body.appendChild(formEl);
      formEl.submit();
    } catch {
      setError('建立奉獻失敗，請稍後再試');
      setLoading(false);
    }
  };

  return (
    <main className="flex-1">
      <div className="max-w-lg mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">線上奉獻</h1>
        <p className="text-gray-500 mb-8">感謝您的奉獻，支持教會事工的發展</p>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">奉獻用途</label>
            <select
              name="purpose"
              value={form.purpose}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
            >
              {PURPOSES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">奉獻金額（新台幣）</label>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="請輸入金額"
              min={1}
              required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
            <input
              type="text"
              name="donorName"
              value={form.donorName}
              onChange={handleChange}
              placeholder="請輸入姓名"
              required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="donorEmail"
              value={form.donorEmail}
              onChange={handleChange}
              placeholder="收據將寄至此信箱"
              required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">手機號碼（選填）</label>
            <input
              type="tel"
              name="donorPhone"
              value={form.donorPhone}
              onChange={handleChange}
              placeholder="09XX-XXX-XXX"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 text-white font-semibold py-3 rounded-full transition"
          >
            {loading ? '處理中…' : '前往付款'}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-4">
          本網站使用藍新金流進行安全付款處理
        </p>
      </div>
    </main>
  );
}
