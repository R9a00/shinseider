import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Phase1 from './components/Phase1';
import SubsidySelection from './components/SubsidySelection';
import SubsidyApplicationSupport from './components/SubsidyApplicationSupport';
import OperatorInfo from './components/OperatorInfo';
import PrivacyPolicy from './components/PrivacyPolicy';


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
  const [mobileOpen, setMobileOpen] = useState(false);
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
    {/* ロゴ（ロゴマーク＋ロゴタイプの可読サイズを維持） */}
    <Link to="/" className="flex items-center gap-2" aria-label="Shinseider ホーム">
      <img
        src="/shinseider_logo.png"
        alt="Shinseider"
        className={`h-32 w-auto ${scrolled ? 'h-24' : 'h-32'}`}
      />
    </Link>

    {/* ナビ（デスクトップ） */}
    <nav className="hidden items-center gap-4 md:flex" aria-label="メインナビゲーション">
      <Link to="/subsidy-selection" className="text-sm font-medium text-gray-800 hover:text-gray-900">
        シンセイ準備
      </Link>
      <Link to="/phase1" className="text-sm font-medium text-gray-800 hover:text-gray-900">
        3分診断
      </Link>
      <a href="#atotsugi" className="text-sm font-medium text-gray-800 hover:text-gray-900">
        アトツギの方へ
      </a>
      <a href="#" className="text-sm font-medium text-gray-800 hover:text-gray-900">
        下書きを開く
      </a>
      <a href="#" className="text-sm font-medium text-gray-800 hover:text-gray-900">
        相談する
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
        <section id="atotsugi" className="bg-white border-y border-gray-200" aria-labelledby="atotsugi-title">
          <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-800 mb-3">
                <svg className="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                特別メニュー
              </div>
              <h2 id="atotsugi-title" className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl mb-3">
                事業承継者（アトツギ）の方へ
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                アトツギ甲子園への申請サポートメニューもご用意しています。<br />
                中小企業庁長官任命の「アトツギ甲子園地域アンバサダー」が皆さんの挑戦をサポートします。
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* 左側：加点措置バナー */}
              <div className="lg:col-span-1">
                <div className="bg-black rounded-lg p-6 text-white h-full">
                  <div className="flex items-center space-x-2 mb-4">
                    <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <h3 className="text-xl font-bold">
                      補助金申請が有利に！
                    </h3>
                  </div>
                  <p className="text-base text-white mb-6">
                    アトツギ甲子園の地方予選進出で、以下の補助金申請時に加点措置が適用されます
                  </p>
                  
                  {/* 対象補助金をより見やすく表示 */}
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0 mt-2"></div>
                      <span className="text-white leading-relaxed">中小企業省力化投資補助金一般型</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0 mt-2"></div>
                      <span className="text-white leading-relaxed">ものづくり・商業・サービス生産性向上促進補助金</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0 mt-2"></div>
                      <span className="text-white leading-relaxed">事業承継・M&A補助金</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0 mt-2"></div>
                      <span className="text-white leading-relaxed">Go-tech事業（成長型中小企業等研究開発支援事業）</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0 mt-2"></div>
                      <span className="text-white leading-relaxed">中小企業新事業進出補助金</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 右側上：アトツギ甲子園サポート + 右側下：アンバサダー連絡先 */}
              <div className="lg:col-span-2 space-y-6">
                {/* アトツギ甲子園サポート */}
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        アトツギ甲子園サポート
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        コンペティションでの成功を目指し、申請書の作成から提出まで、経験豊富なアンバサダーが徹底的にサポートします。
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">専門アンバサダーによる個別メンタリング</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">ドラフト作成から最終提出まで完全伴走</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">壁打ち相談でアイデアをブラッシュアップ</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Link to="/subsidy-application-support/atotsugi" className="inline-flex items-center justify-center w-full rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-red-500 transition-all duration-200">
                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        アトツギ甲子園申請書を準備
                      </Link>
                      <a href="https://atotsugi-koshien.go.jp/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-full rounded-lg bg-gray-800 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-gray-700 transition-all duration-200">
                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        アトツギ甲子園について詳しく見る
                      </a>
                    </div>
                  </div>
                </div>

                {/* アンバサダー連絡カード */}
                <div className="bg-gray-800 rounded-lg shadow-md p-6 text-white">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold">
                      アンバサダー連絡先
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-gray-300 text-sm mb-3">
                        ご相談は随時承ります。経験豊富なアンバサダーが、あなたのアトツギ挑戦をサポートします。
                      </p>
                      
                      <div className="bg-white/10 rounded-lg p-3 space-y-1">
                        <div className="flex items-center space-x-2 text-gray-300 text-xs">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>対応時間: 平日 9:00-18:00</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-300 text-xs">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span>初回相談無料</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <a href="#" className="inline-flex items-center justify-center w-full rounded-lg bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow hover:bg-gray-100 transition-all duration-200">
                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        今すぐ相談する
                      </a>
                    </div>
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
              <Link to="/privacy-policy" className="hover:text-gray-900">プライバシーポリシー</Link>
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
          <Route path="/operator-info" element={<OperatorInfo />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        </Routes>
      </div>
    </Router>
  );
}