import { useSearchParams, Link } from 'react-router-dom';

export default function OfferingResult() {
  const [params] = useSearchParams();
  const status = params.get('status');
  const orderNo = params.get('orderNo');
  const isSuccess = status === 'success';

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-sm">
        {isSuccess ? (
          <>
            <div className="text-6xl mb-4">🙏</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">奉獻成功！</h1>
            <p className="text-gray-500 mb-2">感謝您的奉獻，願神記念您的心意。</p>
            {orderNo && <p className="text-xs text-gray-400 mb-6">訂單編號：{orderNo}</p>}
          </>
        ) : (
          <>
            <div className="text-6xl mb-4">😔</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">奉獻未完成</h1>
            <p className="text-gray-500 mb-6">付款未成功，如有疑問請聯絡教會。</p>
          </>
        )}
        <Link
          to="/"
          className="inline-block bg-yellow-400 hover:bg-yellow-500 text-white font-semibold px-8 py-3 rounded-full transition"
        >
          返回首頁
        </Link>
      </div>
    </main>
  );
}
