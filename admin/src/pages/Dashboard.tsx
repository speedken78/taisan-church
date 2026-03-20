export default function Dashboard() {
  const cards = [
    { label: '消息公告', to: '/news', icon: '📰' },
    { label: '首頁輪播', to: '/banners', icon: '🖼️' },
    { label: '影音資源', to: '/media', icon: '🎬' },
    { label: '牧師著作', to: '/pastor-works', icon: '📚' },
    { label: '小組管理', to: '/groups', icon: '👥' },
    { label: '奉獻記錄', to: '/offering', icon: '💛' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">儀表板</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map((card) => (
          <a
            key={card.to}
            href={card.to}
            className="bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center gap-2 hover:shadow-md transition"
          >
            <span className="text-4xl">{card.icon}</span>
            <span className="text-sm font-semibold text-gray-700">{card.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
