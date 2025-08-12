import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Phase1 from './components/Phase1';
import SubsidySelection from './components/SubsidySelection';
import SubsidyApplicationSupport from './components/SubsidyApplicationSupport';
import OperatorInfo from './components/OperatorInfo';
import PrivacyPolicy from './components/PrivacyPolicy';
import UpdateHistory from './components/UpdateHistory';
import Contact from './components/Contact';


// ──────────────────────────────────────────────────────────────
// Scroll hook: shrink header minimally after small scroll
function useScrolled(threshold = 24) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}
// ──────────────────────────────────────────────────────────────


/**
 * Shinseider Top Page (Home)
 * - 要件: React + Tailwind CSS（単一ファイルで差し替え可能）
 * - 目的: 「信頼感×親しみやすさ」「直感的導線」「価値提示」
 * - アクセシビリティ: キーボード操作/ARIA/コントラスト配慮
 * - コピー: 日本語UI（ご指定の文言を採用）
 * - 備考: ロゴは画像が無ければ内製の“Sエンブレム”プレースホルダーを表示
 */

function Home() {
  const scrolled = useScrolled(24);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* スキップリンク */}
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-black focus:px-3 focus:py-2 focus:text-white">メインへスキップ</a>

      {/* ヘッダー */}
      <header
  className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur-sm supports-[backdrop-filter]:bg-white/70"
  aria-label="グローバルヘッダー"
>
  <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 md:py-3 lg:px-6">
    {/* ロゴ + タグライン */}
    <Link to="/" className="flex items-center gap-3" aria-label="シンセイダー - 補助金申請のハードルを下げる。">
      <img
        src="/shinseider_logo.png"
        alt="シンセイダー"
        className={`h-40 w-auto ${scrolled ? 'h-32' : 'h-40'} md:h-32 md:${scrolled ? 'h-24' : 'h-32'}`}
      />
      <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
        β
      </span>
      <span className="hidden sm:inline-block h-4 w-px bg-slate-300"></span>
      <span className="hidden sm:inline-block text-xs sm:text-sm leading-none text-slate-600 tracking-tight">
        補助金申請の<br className="sm:hidden" />ハードルを下げる。
      </span>
    </Link>

    {/* ナビ（デスクトップ） */}
    <nav className="hidden items-center gap-4 md:flex" aria-label="メインナビゲーション">
      <Link to="/subsidy-selection" className="text-sm font-medium text-gray-800 hover:text-gray-900">
        シンセイ準備
      </Link>
      <Link to="/phase1" className="text-sm font-medium text-gray-800 hover:text-gray-900">
        30秒診断
      </Link>
      <a href="#atotsugi" className="text-sm font-medium text-gray-800 hover:text-gray-900">
        アトツギの方へ
      </a>

      {/* CTA：サイズ/角丸/影を全体で統一 */}
      <Link
        to="/subsidy-selection"
        className="rounded-xl bg-red-600 px-5 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
      >
        シンセイ準備をはじめる
      </Link>
    </nav>
  </div>
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
            <div className="w-full max-w-xl mx-auto lg:mx-0">
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
                      まずは30秒診断 →
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

            {/* ビジュアル（ベネフィット表示） */}
            <div className="relative w-full max-w-lg mx-auto lg:mx-0 lg:ml-auto">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
                <div className="text-center space-y-2 mb-6">
                  <h3 className="text-xl font-bold text-gray-900">ややこしいシンセイよ、さらば。</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 rounded-lg border border-gray-100 hover:border-red-200 hover:bg-red-50 transition-all duration-200">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-white flex-shrink-0">
                      <IconTarget className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">最適な補助金が見つかる</p>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">簡単な質問で、あなたが利用できる補助金や優遇策をレコメンドします。</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 rounded-lg border border-gray-100 hover:border-red-200 hover:bg-red-50 transition-all duration-200">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-white flex-shrink-0">
                      <IconDoc className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">申請書の下書きが完成</p>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">提示された項目に入力をすると、審査項目を満たした申請書のドラフトが自動で出来上がります。</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 rounded-lg border border-gray-100 hover:border-red-200 hover:bg-red-50 transition-all duration-200">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-white flex-shrink-0">
                      <IconShield className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">抜け漏れを徹底防止</p>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">公募要領に基づいたチェックリストで、ややこしいシンセイから解放されます。</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* アトツギ導線 */}
        <section id="atotsugi" className="bg-gradient-to-br from-slate-50 to-gray-100 border-y border-gray-200" aria-labelledby="atotsugi-title">
          <div className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
            <div className="text-center mb-12">
              <div className="inline-flex items-center rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 text-sm font-semibold text-white shadow-lg mb-4">
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                特別メニュー
              </div>
              <h2 id="atotsugi-title" className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl mb-3">
                39歳以下の事業承継予定者（アトツギ）の方へ
              </h2>
              <p className="text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
                アトツギ甲子園という制度をご存知ですか？<br />
                当サイトではアトツギ甲子園への申請サポートをご用意しています。過去の出場経験者がみなさんの挑戦をサポートします。
              </p>
            </div>

            {/* 新しい3カードレイアウト */}
            <div className="grid gap-8 lg:grid-cols-3">
              {/* カード1: 加点措置 */}
              <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white shadow-2xl">
                <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-400/20 rounded-full -mr-10 -mt-10"></div>
                <div className="relative">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-yellow-400 rounded-lg">
                      <svg className="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold">補助金申請が有利に！</h3>
                  </div>
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    地方予選進出で各種補助金申請時に<span className="text-yellow-400 font-semibold">加点措置</span>が適用されます
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    {['省力化投資補助金', 'ものづくり補助金', '事業承継・M&A補助金', 'Go-Tech事業'].map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                        <span className="text-gray-200">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* カード2: 申請サポート */}
              <div className="relative overflow-hidden bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full -mr-16 -mt-16"></div>
                <div className="relative">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-red-500 rounded-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">シンセイをサポート</h3>
                  </div>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    地方大会進出を目指し、申請フォーマットに沿って<span className="text-red-500 font-semibold">必須要素を漏れなく</span>整えることから始めましょう。
                  </p>
                  
                  <div className="space-y-3 mb-8">
                    {[
                      '必須項目・添付の抜け防止',
                      '構成・見出し・数値の整合',
                      '壁打ち相談でブラッシュアップ'
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-3">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Link to="/subsidy-application-support/atotsugi" className="inline-flex items-center justify-center w-full rounded-xl bg-red-600 px-6 py-3 text-base font-semibold text-white shadow-lg hover:bg-red-700 transition-all duration-200">
                    <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    シンセイを準備する
                  </Link>
                </div>
              </div>

              {/* カード3: アンバサダー相談 */}
              <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 text-white shadow-2xl">
                <div className="absolute top-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mt-12"></div>
                <div className="relative">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold">アンバサダーに相談する</h3>
                  </div>
                  <p className="text-blue-100 mb-6 leading-relaxed">
                    <span className="text-white font-semibold">過去のアトツギ甲子園出場経験者</span>に、直接申請に関する相談をすることができます。
                  </p>
                  
                  <div className="bg-white/10 rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-2 text-blue-100 text-sm mb-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>2025年8月より、アトツギ甲子園地域アンバサダー制度が開始しました。</span>
                    </div>
                    <div className="flex items-center space-x-2 text-blue-100 text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>中小企業庁長官より任命された各地域の担当者が、みなさんのエントリーをサポートします。</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Link to="/operator-info" className="inline-flex items-center justify-center w-full rounded-xl bg-white px-6 py-3 text-base font-semibold text-blue-600 shadow-lg hover:bg-blue-50 transition-all duration-200">
                      <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      相談する
                    </Link>
                    <a href="https://atotsugi-koshien.go.jp/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-full rounded-xl bg-white/10 px-6 py-3 text-base font-semibold text-white border border-white/20 hover:bg-white/20 transition-all duration-200">
                      <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      アトツギ甲子園公式サイト
                    </a>
                  </div>
                </div>
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
              <Link to="/operator-info" className="hover:text-gray-900">運営者情報</Link>
              <Link to="/update-history" className="hover:text-gray-900">情報更新履歴・参照元</Link>
              <Link to="/privacy-policy" className="hover:text-gray-900">プライバシーポリシー</Link>
              <Link to="/contact" className="hover:text-gray-900">お問い合わせ</Link>
            </nav>
          </div>
          <div className="mt-6 flex items-center justify-between text-xs text-gray-400">
            <p>© {new Date().getFullYear()} Shinseider. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-medium">ベータ版</span>
              <span>機能開発中</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ------------- UIサブコンポーネント ------------- */


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
          <Route path="/operator-info" element={<OperatorInfo />} />
          <Route path="/update-history" element={<UpdateHistory />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </div>
    </Router>
  );
}