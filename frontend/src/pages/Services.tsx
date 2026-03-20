export default function Services() {
  const services = [
    { name: '主日崇拜', time: '每週日 上午 10:00', location: '主堂' },
    { name: '主日學', time: '每週日 上午 09:00', location: '教育館' },
    { name: '禱告會', time: '每週三 晚上 19:30', location: '主堂' },
    { name: '青年聚會', time: '每週五 晚上 19:30', location: '青年館' },
  ];

  return (
    <main className="flex-1">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">聚會時間</h1>

        <div className="grid gap-4 mb-10">
          {services.map((s) => (
            <div key={s.name} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                <span className="text-yellow-500 text-xl">🕊️</span>
              </div>
              <div>
                <p className="font-semibold text-gray-800">{s.name}</p>
                <p className="text-sm text-gray-500">{s.time}　｜　{s.location}</p>
              </div>
            </div>
          ))}
        </div>

        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-3 border-l-4 border-yellow-400 pl-3">教會地址</h2>
          <p className="text-gray-600 mb-4">新北市泰山區泰林路2段199號7樓</p>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3614.196549461334!2d121.4305981260653!3d25.061326537189238!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3442a63213e8401b%3A0xae842aef0bf60f15!2z57SE5pu45Lqe5rOw5bGx5bm456aP5pWZ5pyD!5e0!3m2!1szh-TW!2stw!4v1773927938609!5m2!1szh-TW!2stw"
            className="w-full h-64 rounded-xl border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="泰山幸福教會位置"
          />
        </section>
      </div>
    </main>
  );
}
