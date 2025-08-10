import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Phase1 from './components/Phase1';
import SubsidySelection from './components/SubsidySelection';
import SubsidyApplicationSupport from './components/SubsidyApplicationSupport';

/**
 * Shinseider Top Page (Home)
 * - 要件: React + Tailwind CSS（単一ファイルで差し替え可能）
 * - 目的: 「信頼感×親しみやすさ」「直感的導線」「価値提示」
 * - アクセシビリティ: キーボード操作/ARIA/コントラスト配慮
 * - コピー: 日本語UI（ご指定の文言を採用）
 * - 備考: ロゴは画像が無ければ内製の“Sエンブレム”プレースホルダーを表示
 */

function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* スキップリンク */}
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-black focus:px-3 focus:py-2 focus:text-white">メインへスキップ</a>

      {/* ヘッダー */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70" aria-label="グローバルヘッダー">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-6">
          {/* ロゴ */}
          <Link to="/" className="flex items-center gap-2" aria-label="Shinseider ホーム">
            <img src="/shinseider_logo.png" alt="Shinseider" className="h-32 w-auto" />
          </Link>

          {/* ナビ（デスクトップ） */}
          <nav className="hidden items-center gap-6 md:flex" aria-label="メインナビゲーション">
            <Link to="/subsidy-selection" className="text-sm font-medium text-gray-700 hover:text-gray-900">シンセイ準備</Link>
            <Link to="/phase1" className="text-sm font-medium text-gray-700 hover:text-gray-900">3分診断</Link>
            <a href="#" className="text-sm font-medium text-gray-700 hover:text-gray-900">下書きを開く</a>
            <a href="#" className="text-sm font-medium text-gray-700 hover:text-gray-900">相談する</a>
            <Link to="/subsidy-selection" className="rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-red-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700">シンセイ準備をはじめる</Link>
          </nav>

          {/* モバイルメニュー */}
          <button onClick={() => setMobileOpen((s) => !s)} className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 md:hidden" aria-expanded={mobileOpen} aria-controls="mobile-nav" aria-label="メニューを開閉">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
              {mobileOpen ? (
                <path fillRule="evenodd" d="M18.3 5.7a1 1 0 010 1.4L13.4 12l4.9 4.9a1 1 0 11-1.4 1.4L12 13.4l-4.9 4.9a1 1 0 11-1.4-1.4L10.6 12 5.7 7.1A1 1 0 117.1 5.7L12 10.6l4.9-4.9a1 1 0 011.4 0z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zm0 5.25c0-.414.336-.75.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75zm.75 4.5a.75.75 0 000 1.5h16.5a.75.75 0 000-1.5H3.75z" clipRule="evenodd" />
              )}
            </svg>
          </button>
        </div>

        {/* ドロワー */}
        {mobileOpen && (
          <div id="mobile-nav" className="border-t border-gray-100 bg-white md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
              <Link to="/subsidy-selection" className="rounded-md px-3 py-2 text-base font-medium hover:bg-gray-50">シンセイ準備</Link>
              <Link to="/phase1" className="rounded-md px-3 py-2 text-base font-medium hover:bg-gray-50">3分診断</Link>
              <a href="#" className="rounded-md px-3 py-2 text-base font-medium hover:bg-gray-50">下書きを開く</a>
              <a href="#" className="rounded-md px-3 py-2 text-base font-medium hover:bg-gray-50">相談する</a>
              <Link to="/subsidy-selection" className="mt-2 rounded-xl bg-red-700 px-4 py-2 text-center text-sm font-semibold text-white shadow hover:bg-red-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700">シンセイ準備をはじめる</Link>
            </div>
          </div>
        )}
      </header>

      {/* ヒーロー */}
      <main id="main">
        <section className="relative isolate overflow-hidden bg-gradient-to-b from-white via-white to-gray-50/50 border-t border-gray-100/50">
          {/* 背景装飾 */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 blur-3xl xl:-top-6" aria-hidden="true">
              <div className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#ff8080] to-[#9089fc] opacity-10"></div>
            </div>
          </div>
          
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 pt-8 pb-16 lg:grid-cols-2 lg:gap-16 lg:pt-12 lg:pb-24">
            <div className="w-full max-w-xl">
              <div className="space-y-8">
                {/* ヘッドライン */}
                <div className="space-y-5">
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl leading-[1.2]">
                    補助金申請の準備を支え、<br />
                    <span className="text-red-600">かける時間を最小化する。</span>
                  </h1>
                  <p className="text-lg leading-relaxed text-gray-600">
                    思考の整理から下書き、抜け漏れチェック、提出前チェックリストまで。あなたの申請作業をサポートします。
                  </p>
                </div>
                
                {/* CTAボタン */}
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Link to="/subsidy-selection" className="flex-1 rounded-xl bg-red-600 px-6 py-4 text-base font-semibold text-white shadow-sm hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 transition-all duration-200 text-center">
                      シンセイ準備をはじめる
                    </Link>
                    <Link to="/phase1" className="flex-1 rounded-xl border border-gray-300 bg-white px-6 py-4 text-base font-semibold text-gray-700 shadow-sm hover:bg-gray-50 hover:text-red-600 hover:border-red-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 transition-all duration-200 text-center">
                      まずは3分診断 →
                    </Link>
                  </div>
                  
                  {/* プライバシー表示 */}
                  <div className="pt-2">
                    <p className="text-sm text-gray-500 leading-relaxed">
                      <svg className="w-4 h-4 mr-2 text-green-600 inline" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      あなたの文章やファイルは、このブラウザの中だけで処理されます。サーバーには残りません。
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ビジュアル（UIモック） */}
            <div className="relative w-full max-w-lg mx-auto lg:mx-0 lg:ml-auto">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">申請準備を始めましょう</h3>
                    <p className="text-sm text-gray-600">最適な補助金を見つけて、効率的に申請を進められます</p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Link to="/subsidy-selection" className="group rounded-xl border border-gray-200 p-4 text-left hover:border-red-200 hover:bg-red-50 transition-all duration-200">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-red-700">シンセイ準備</p>
                        <p className="text-xs text-gray-500 group-hover:text-red-600 leading-relaxed">補助金を選んで、すぐ下書き開始</p>
                      </div>
                    </Link>
                    <Link to="/phase1" className="group rounded-xl border border-gray-200 p-4 text-left hover:border-red-200 hover:bg-red-50 transition-all duration-200">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-red-700">3分診断</p>
                        <p className="text-xs text-gray-500 group-hover:text-red-600 leading-relaxed">最適な補助金をレコメンド</p>
                      </div>
                    </Link>
                    <button className="group rounded-xl border border-gray-200 p-4 text-left hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 opacity-60">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-gray-700">抜け漏れチェック</p>
                        <p className="text-xs text-gray-500 leading-relaxed">要項に沿って自動検証（準備中）</p>
                      </div>
                    </button>
                    <button className="group rounded-xl border border-gray-200 p-4 text-left hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 opacity-60">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-gray-700">提出前チェックリスト</p>
                        <p className="text-xs text-gray-500 leading-relaxed">提出直前の総点検（準備中）</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ベネフィット */}
        <section className="border-t border-gray-100 bg-gray-50/60" aria-labelledby="benefits-title">
          <div className="mx-auto max-w-7xl px-4 py-14 lg:px-6">
            <h2 id="benefits-title" className="text-center text-2xl font-bold tracking-tight sm:text-3xl">面倒な申請よ、さらば。</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Benefit icon={IconTarget} title="最適な補助金が見つかる" desc="簡単なヒアリングで、あなたにぴったりの補助金をAIが推薦します。" />
              <Benefit icon={IconDoc} title="申請書の下書きが完成" desc="質問に答えるだけで、審査項目を満たした申請書のドラフトが自動で出来上がります。" />
              <Benefit icon={IconShield} title="抜け漏れを徹底防止" desc="公募要領に基づいた完璧なチェックリストで、面倒な確認作業から解放されます。" />
            </div>
          </div>
        </section>

        {/* アトツギ導線 */}
        <section id="atotsugi" className="bg-white" aria-labelledby="atotsugi-title">
          <div className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
            <h2 id="atotsugi-title" className="text-2xl font-bold tracking-tight sm:text-3xl">事業承継者（アトツギ）の方へ</h2>
            <div className="mt-6 grid items-center gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <p className="text-gray-700">「アトツギ甲子園」への挑戦をサポートする特別メニューをご用意しています。壁打ち相談（アンバサダー制度）で、ドラフトの磨き込みから提出まで伴走します。</p>
                <div className="mt-6">
                  <a href="#" className="rounded-xl bg-indigo-700 px-5 py-3 text-white font-semibold shadow hover:bg-indigo-800">アトツギ甲子園について詳しく見る</a>
                </div>
              </div>
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5 text-sm text-indigo-900">
                <p className="font-semibold">アンバサダー連絡先</p>
                <p className="mt-1 opacity-90">ご相談は随時承ります。フォームよりご連絡ください。</p>
                <a href="#" className="mt-4 inline-block rounded-lg bg-white px-4 py-2 font-medium text-indigo-700 ring-1 ring-inset ring-indigo-200 hover:bg-indigo-100">相談する</a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* フッター */}
      <footer className="border-t border-gray-100 bg-white" aria-label="フッター">
        <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-gray-600 lg:px-6">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <img src="/shinseider_logo.png" alt="Shinseider" className="h-12 w-auto" />
            </div>
            <nav className="flex flex-wrap items-center gap-x-6 gap-y-2" aria-label="フッターナビ">
              <a href="#" className="hover:text-gray-900">運営者情報</a>
              <a href="#" className="hover:text-gray-900">プライバシーポリシー</a>
              <a href="#" className="hover:text-gray-900">お問い合わせ</a>
            </nav>
          </div>
          <p className="mt-6 text-xs text-gray-400">© {new Date().getFullYear()} Shinseider. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

/* ------------- UIサブコンポーネント ------------- */

function Benefit({ icon: Icon, title, desc }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-white">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="font-semibold">{title}</p>
          <p className="mt-1 text-sm text-gray-600">{desc}</p>
        </div>
      </div>
    </div>
  );
}

/* ピクト（アイコンはプレーンSVG） */
function IconTarget(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={props.className} aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v3M21 12h-3M12 21v-3M3 12h3" />
    </svg>
  );
}

function IconDoc(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={props.className} aria-hidden>
      <path d="M7 3h6l4 4v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <path d="M13 3v5h5" />
      <path d="M9 13h6M9 17h6M9 9h2" />
    </svg>
  );
}

function IconShield(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={props.className} aria-hidden>
      <path d="M12 3l7 4v5c0 5-3.5 8.5-7 9-3.5-.5-7-4-7-9V7l7-4z" />
      <path d="M9.5 12.5l2 2 3.5-3.5" />
    </svg>
  );
}

export default function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/phase1" element={<Phase1 />} />
          <Route path="/subsidy-selection" element={<SubsidySelection />} />
          <Route path="/subsidy-application-support/:subsidyId" element={<SubsidyApplicationSupport />} />
        </Routes>
      </div>
    </Router>
  );
}