import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { formApi } from '../api';

interface FormItem {
  _id: string;
  title: string;
  description: string;
  type: 'event' | 'group_buy';
  coverImage?: string;
  price?: number;
  deadline: string;
  totalLimit?: number;
}

const TYPE_LABELS = { event: '活動報名', group_buy: '團購' };
const TYPE_COLORS = {
  event: 'bg-blue-100 text-blue-700',
  group_buy: 'bg-green-100 text-green-700',
};

export default function Forms() {
  const [searchParams, setSearchParams] = useSearchParams();
  const typeFilter = (searchParams.get('type') ?? '') as '' | 'event' | 'group_buy';

  const [forms, setForms] = useState<FormItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    formApi.getOpen(typeFilter || undefined)
      .then((r) => setForms(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [typeFilter]);

  const tabs: { value: '' | 'event' | 'group_buy'; label: string }[] = [
    { value: '', label: '全部' },
    { value: 'event', label: '活動報名' },
    { value: 'group_buy', label: '團購' },
  ];

  return (
    <main className="flex-1">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">活動報名 / 團購</h1>
        <p className="text-gray-500 mb-8">歡迎參與教會各項活動，或加入團購專案</p>

        {/* 分類 tab */}
        <div className="flex gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSearchParams(tab.value ? { type: tab.value } : {})}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                typeFilter === tab.value
                  ? 'bg-yellow-400 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-16">載入中…</p>
        ) : forms.length === 0 ? (
          <p className="text-center text-gray-400 py-16">目前無開放報名的活動</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form) => (
              <Link
                key={form._id}
                to={`/forms/${form._id}`}
                className="rounded-xl overflow-hidden shadow hover:shadow-md transition bg-white"
              >
                {form.coverImage ? (
                  <img src={form.coverImage} alt={form.title} className="w-full h-48 object-cover" />
                ) : (
                  <div className="w-full h-48 bg-yellow-50 flex items-center justify-center">
                    <span className="text-yellow-300 text-5xl">
                      {form.type === 'group_buy' ? '🛍️' : '📋'}
                    </span>
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_COLORS[form.type]}`}>
                      {TYPE_LABELS[form.type]}
                    </span>
                  </div>
                  <h2 className="font-semibold text-gray-800 mb-1 line-clamp-2">{form.title}</h2>
                  {form.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-2">{form.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                    <span>截止：{new Date(form.deadline).toLocaleDateString('zh-TW')}</span>
                    {form.price ? (
                      <span className="font-semibold text-yellow-600">NT$ {form.price.toLocaleString()} / 份</span>
                    ) : null}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
