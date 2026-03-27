import { useState } from 'react';
import { authApi } from '../api';

export default function AccountManager() {
  // 新增管理員
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [registerMsg, setRegisterMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [registerLoading, setRegisterLoading] = useState(false);

  // 修改密碼
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [changeMsg, setChangeMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [changeLoading, setChangeLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterMsg(null);
    setRegisterLoading(true);
    try {
      await authApi.register(newUsername, newPassword);
      setRegisterMsg({ type: 'success', text: '管理員帳號建立成功' });
      setNewUsername('');
      setNewPassword('');
    } catch (err: any) {
      setRegisterMsg({ type: 'error', text: err.response?.data?.message || '建立失敗，請稍後再試' });
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeMsg(null);

    if (newPwd !== confirmPwd) {
      setChangeMsg({ type: 'error', text: '新密碼與確認密碼不一致' });
      return;
    }
    if (newPwd.length < 6) {
      setChangeMsg({ type: 'error', text: '新密碼長度至少需要 6 個字元' });
      return;
    }

    setChangeLoading(true);
    try {
      await authApi.changePassword(currentPassword, newPwd);
      setChangeMsg({ type: 'success', text: '密碼修改成功' });
      setCurrentPassword('');
      setNewPwd('');
      setConfirmPwd('');
    } catch (err: any) {
      setChangeMsg({ type: 'error', text: err.response?.data?.message || '修改失敗，請稍後再試' });
    } finally {
      setChangeLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">帳號管理</h1>

      {/* 新增管理員 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">新增管理員帳號</h2>
        <form onSubmit={handleRegister} className="space-y-4 max-w-sm">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">帳號</label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="輸入新管理員帳號"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">密碼</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="至少 6 個字元"
            />
          </div>
          {registerMsg && (
            <p className={`text-sm ${registerMsg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
              {registerMsg.text}
            </p>
          )}
          <button
            type="submit"
            disabled={registerLoading}
            className="bg-yellow-400 hover:bg-yellow-500 text-white text-sm font-semibold px-5 py-2 rounded-lg transition disabled:opacity-50"
          >
            {registerLoading ? '建立中...' : '建立帳號'}
          </button>
        </form>
      </div>

      {/* 修改密碼 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">修改我的密碼</h2>
        <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">目前密碼</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="輸入目前密碼"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">新密碼</label>
            <input
              type="password"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              required
              minLength={6}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="至少 6 個字元"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">確認新密碼</label>
            <input
              type="password"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="再次輸入新密碼"
            />
          </div>
          {changeMsg && (
            <p className={`text-sm ${changeMsg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
              {changeMsg.text}
            </p>
          )}
          <button
            type="submit"
            disabled={changeLoading}
            className="bg-yellow-400 hover:bg-yellow-500 text-white text-sm font-semibold px-5 py-2 rounded-lg transition disabled:opacity-50"
          >
            {changeLoading ? '修改中...' : '修改密碼'}
          </button>
        </form>
      </div>
    </div>
  );
}
