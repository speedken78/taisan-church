import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <img
            src="/assets/logo.jpg"
            alt="泰山幸福教會"
            className="h-12 w-auto object-contain mb-3 rounded-md"
            style={{ background: 'white', padding: '6px 10px' }}
          />
          <p className="text-sm leading-relaxed">
            地址：新北市泰山區泰林路2段199號7樓<br />
            電話：02-2900-8100<br />
            Email：taishanhappinesschurch@gmail.com
          </p>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-3">快速連結</h3>
          <ul className="text-sm space-y-2">
            <li><Link to="/about" className="hover:text-yellow-400">關於我們</Link></li>
            <li><Link to="/services" className="hover:text-yellow-400">聚會資訊</Link></li>
            <li><Link to="/news" className="hover:text-yellow-400">最新消息</Link></li>
            <li><Link to="/media" className="hover:text-yellow-400">影音資源</Link></li>
            <li><Link to="/offering" className="hover:text-yellow-400">線上奉獻</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-3">關注我們</h3>
          <div className="flex gap-3">
            <a href="https://www.facebook.com/p/%E6%B3%B0%E5%B1%B1%E5%B9%B8%E7%A6%8F%E6%95%99%E6%9C%83-100066315796929/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-yellow-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3l-.5 3H13v6.8c4.56-.93 8-4.96 8-9.8z" />
              </svg>
            </a>
            <a href="https://youtube.com/channel/UC-3KJcwsHGVAgFbZS8zEe_w" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="hover:text-yellow-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21.8 8s-.2-1.4-.8-2c-.8-.8-1.6-.8-2-.9C16.8 5 12 5 12 5s-4.8 0-7 .1c-.4.1-1.2.1-2 .9-.6.6-.8 2-.8 2S2 9.6 2 11.2v1.5c0 1.6.2 3.2.2 3.2s.2 1.4.8 2c.8.8 1.8.8 2.3.8C6.8 19 12 19 12 19s4.8 0 7-.1c.4-.1 1.2-.1 2-.9.6-.6.8-2 .8-2s.2-1.6.2-3.2v-1.5C22 9.6 21.8 8 21.8 8zM9.7 14.5v-5.5l5.4 2.8-5.4 2.7z" />
              </svg>
            </a>
            {/* LINE 官方帳號尚未建立，待補 */}
          </div>
        </div>
      </div>
      <div className="border-t border-gray-700 text-center text-xs py-4 text-gray-500">
        © 2025 泰山幸福教會 All Rights Reserved.
      </div>
    </footer>
  );
}
