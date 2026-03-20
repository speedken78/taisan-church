import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: '📊 儀表板' },
  { to: '/news', label: '📰 消息公告' },
  { to: '/banners', label: '🖼️ 首頁輪播' },
  { to: '/media', label: '🎬 影音資源' },
  { to: '/pastor-works', label: '📚 牧師著作' },
  { to: '/groups', label: '👥 小組管理' },
  { to: '/offering', label: '💛 奉獻記錄' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 text-gray-200 flex flex-col">
        <div className="px-5 py-5 border-b border-gray-700">
          <p className="text-sm font-bold text-yellow-400">泰山幸福教會</p>
          <p className="text-xs text-gray-400 mt-0.5">後台管理系統</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm transition ${
                  isActive
                    ? 'bg-yellow-400 text-white font-semibold'
                    : 'hover:bg-gray-700'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full text-sm text-gray-400 hover:text-white transition text-left px-2"
          >
            🚪 登出
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gray-50 overflow-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
