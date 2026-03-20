import { useSearchParams, Link } from 'react-router-dom';

export default function FormResult() {
  const [params] = useSearchParams();
  const title = params.get('title') ?? '活動';
  const type = params.get('type') === 'group_buy' ? '團購' : '報名';

  return (
    <main className="flex-1 flex items-center justify-center py-20">
      <div className="text-center max-w-md px-4">
        <div className="text-6xl mb-6">✅</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">{type}成功！</h1>
        <p className="text-gray-500 mb-2">
          感謝您{type === '團購' ? '參與團購' : '報名'}：<strong>{title}</strong>
        </p>
        <p className="text-gray-400 text-sm mb-8">
          確認通知已寄至您的 Email，若未收到請確認垃圾信件夾，
          或聯絡我們：02-2900-8100
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/forms"
            className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold px-6 py-3 rounded-xl transition"
          >
            查看其他活動
          </Link>
          <Link
            to="/"
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl transition"
          >
            回首頁
          </Link>
        </div>
      </div>
    </main>
  );
}
