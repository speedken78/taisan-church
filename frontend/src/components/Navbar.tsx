import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const navLinks = [
  { to: '/about', label: '關於我們' },
  { to: '/services', label: '聚會資訊' },
  { to: '/news', label: '最新消息' },
  { to: '/media', label: '影音資源' },
  { to: '/pastor-works', label: '牧師著作' },
  { to: '/groups', label: '小組牧區' },
  { to: '/forms', label: '活動報名' },
  { to: '/contact', label: '聯絡我們' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center">
          <img src="/assets/logo.jpg" alt="泰山幸福教會" className="h-10 w-auto object-contain" />
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex gap-6 text-sm font-medium">
          {navLinks.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  isActive ? 'text-yellow-500 border-b-2 border-yellow-400 pb-1' : 'text-gray-600 hover:text-yellow-500'
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <Link
          to="/offering"
          className="hidden md:block bg-yellow-400 hover:bg-yellow-500 text-white text-sm font-semibold px-4 py-2 rounded-full transition"
        >
          線上奉獻
        </Link>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-gray-600"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="開啟選單"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t px-4 pb-4">
          <ul className="flex flex-col gap-3 mt-3 text-sm font-medium">
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    isActive ? 'text-yellow-500' : 'text-gray-600'
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
            <li>
              <Link
                to="/offering"
                onClick={() => setMenuOpen(false)}
                className="block bg-yellow-400 text-white text-center py-2 rounded-full"
              >
                線上奉獻
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
