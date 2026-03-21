import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { formApi } from '../api';

interface FormField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'radio' | 'checkbox';
  options?: string[];
  placeholder?: string;
  helpText?: string;
  required: boolean;
}

interface FormData {
  _id: string;
  title: string;
  description: string;
  type: string;
  fields: FormField[];
  requireContact: boolean;
  price?: number;
  maxQuantity?: number;
  totalLimit?: number;
  deadline: string;
  submissionCount: number;
  status: 'open' | 'closed' | 'expired';
}

const FORM_TYPE_LABELS: Record<string, string> = {
  event:      '活動報名',
  group_buy:  '團購',
  volunteer:  '志工招募',
  venue:      '場地借用',
  survey:     '問卷調查',
};

export default function FormDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // 聯絡欄位
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [quantity, setQuantity] = useState(1);

  // 自訂欄位答案
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});

  useEffect(() => {
    if (!id) return;
    formApi.getById(id)
      .then((r) => setForm(r.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const setAnswer = (key: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const toggleCheckbox = (key: string, option: string) => {
    const current = (answers[key] as string[]) ?? [];
    setAnswer(
      key,
      current.includes(option) ? current.filter((v) => v !== option) : [...current, option]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !id) return;
    setError('');
    setSubmitting(true);

    try {
      await formApi.submit(id, { name, email, phone, answers, quantity });
      navigate(`/forms/result?title=${encodeURIComponent(form.title)}&type=${form.type}`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        '送出失敗，請稍後再試';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <main className="flex-1 flex items-center justify-center py-20 text-gray-400">載入中…</main>;

  if (notFound || !form) {
    return (
      <main className="flex-1 flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-gray-500 mb-4">找不到此表單</p>
          <Link to="/forms" className="text-yellow-600 hover:underline text-sm">返回活動列表</Link>
        </div>
      </main>
    );
  }

  const isClosed = form.status === 'closed';
  const isExpired = form.status === 'expired';
  const isFull = form.totalLimit && form.totalLimit > 0 && form.submissionCount >= form.totalLimit;
  const isLocked = isClosed || isExpired || !!isFull;
  const totalAmount = form.price ? form.price * quantity : 0;

  const lockedMessage = isClosed
    ? '此表單已由管理員關閉'
    : isExpired
    ? '填寫截止日期已過'
    : '已達人數上限，感謝您的關注';

  const typeLabel = FORM_TYPE_LABELS[form.type] ?? form.type;

  return (
    <main className="flex-1">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-6">
          <span className="text-xs text-yellow-600 font-medium bg-yellow-50 px-2 py-1 rounded-full">
            {typeLabel}
          </span>
          <h1 className="text-2xl font-bold text-gray-800 mt-3 mb-2">{form.title}</h1>
          {form.description && <p className="text-gray-500 text-sm">{form.description}</p>}
          <p className="text-xs text-gray-400 mt-2">
            截止日期：{new Date(form.deadline).toLocaleDateString('zh-TW')}
            {form.totalLimit && form.totalLimit > 0 ? `　剩餘名額：${Math.max(0, form.totalLimit - form.submissionCount)}` : ''}
          </p>
        </div>

        {isLocked ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
            <p className="text-gray-500 font-medium">{lockedMessage}</p>
            <Link to="/forms" className="mt-4 inline-block text-sm text-yellow-600 hover:underline">
              查看其他活動
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-2xl shadow-sm p-6">

            {/* 聯絡資料（requireContact = true 時才顯示） */}
            {form.requireContact && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">姓名 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="請輸入姓名"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="請輸入 Email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">手機號碼 <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="請輸入手機號碼"
                  />
                </div>
              </>
            )}

            {/* 數量（有設定單價且 maxQuantity > 1 時顯示） */}
            {form.price && form.maxQuantity && form.maxQuantity > 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">數量</label>
                <input
                  type="number"
                  min={1}
                  max={form.maxQuantity}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            )}

            {/* 自訂欄位 */}
            {form.fields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                {field.helpText && (
                  <p className="text-xs text-gray-400 mb-1">{field.helpText}</p>
                )}

                {field.type === 'text' && (
                  <input
                    type="text"
                    required={field.required}
                    value={(answers[field.key] as string) ?? ''}
                    onChange={(e) => setAnswer(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                )}

                {field.type === 'textarea' && (
                  <textarea
                    required={field.required}
                    value={(answers[field.key] as string) ?? ''}
                    onChange={(e) => setAnswer(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    rows={4}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                )}

                {field.type === 'number' && (
                  <input
                    type="number"
                    required={field.required}
                    value={(answers[field.key] as string) ?? ''}
                    onChange={(e) => setAnswer(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                )}

                {field.type === 'date' && (
                  <input
                    type="date"
                    required={field.required}
                    value={(answers[field.key] as string) ?? ''}
                    onChange={(e) => setAnswer(field.key, e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                )}

                {field.type === 'select' && (
                  <select
                    required={field.required}
                    value={(answers[field.key] as string) ?? ''}
                    onChange={(e) => setAnswer(field.key, e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    <option value="">請選擇</option>
                    {field.options?.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}

                {field.type === 'radio' && (
                  <div className="flex flex-wrap gap-4 mt-1">
                    {field.options?.map((opt) => (
                      <label key={opt} className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
                        <input
                          type="radio"
                          name={field.key}
                          value={opt}
                          required={field.required}
                          checked={(answers[field.key] as string) === opt}
                          onChange={() => setAnswer(field.key, opt)}
                          className="accent-yellow-400"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}

                {field.type === 'checkbox' && (
                  <div className="flex flex-wrap gap-4 mt-1">
                    {field.options?.map((opt) => (
                      <label key={opt} className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={((answers[field.key] as string[]) ?? []).includes(opt)}
                          onChange={() => toggleCheckbox(field.key, opt)}
                          className="accent-yellow-400"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* 金額小計 */}
            {totalAmount > 0 && (
              <div className="bg-yellow-50 rounded-lg px-4 py-3 text-sm text-gray-700">
                應付金額：<strong className="text-yellow-700 text-base">NT$ {totalAmount.toLocaleString()}</strong>
                <span className="text-gray-400 ml-2">（NT$ {form.price?.toLocaleString()} × {quantity} 份）</span>
              </div>
            )}

            {error && (
              <p className="text-red-500 text-sm bg-red-50 rounded-lg px-4 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
            >
              {submitting ? '送出中…' : '確認送出'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
