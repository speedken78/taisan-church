export default function About() {
  return (
    <main className="flex-1">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">關於我們</h1>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-700 mb-3 border-l-4 border-yellow-400 pl-3">教會簡介</h2>
          <p className="text-gray-600 leading-relaxed">
            泰山幸福教會座落於新北市泰山區，是一個充滿愛與溫暖的基督教會。
            我們致力於服事社區，傳揚福音，幫助每一個生命找到真正的幸福與盼望。
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-700 mb-3 border-l-4 border-yellow-400 pl-3">異象與使命</h2>
          <p className="text-gray-600 leading-relaxed">
            我們的異象是成為泰山地區最具影響力的教會，透過敬拜、門訓、佈道與關懷，
            帶領更多人認識神，建立健全的家庭與社區。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-3 border-l-4 border-yellow-400 pl-3">牧者介紹</h2>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-yellow-50">
            <div className="w-16 h-16 rounded-full bg-yellow-200 flex items-center justify-center text-2xl flex-shrink-0">
              🕊️
            </div>
            <div>
              <p className="font-semibold text-gray-800">趙曉音 牧師</p>
              <p className="text-sm text-gray-500">主任牧師・泰山幸福教會</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
