import React from 'react';
import { Link } from 'react-router-dom';

function OperatorInfo() {
  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー部分 */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              運営者情報
            </h1>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              シンセイダー運営チームについて
            </p>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <section className="mx-auto max-w-4xl px-4 py-12">
        <div className="space-y-6 text-gray-700">
          <div>
            <p><strong>運営者：</strong> シンセイダー（Shinseider） アトツギ挑戦支援デスク</p>
          </div>
          
          <div>
            <p><strong>担当：</strong> ○○ ○○（中小企業庁長官任命 アトツギ甲子園 中部ブロック地域アンバサダー／過去ファイナリスト）</p>
          </div>
          
          <div>
            <p><strong>プロフィール：</strong> 長野県を拠点に、事業承継や経営改善の現場経験をもとに、アトツギ甲子園挑戦者の伴走支援を行っています。壁打ち相談からドラフトの磨き込み、提出前の最終チェックまで幅広くサポート。</p>
          </div>
          
          <div>
            <p><strong>連絡先：</strong> info@example.com（または専用問い合わせフォーム）</p>
          </div>
        </div>

        {/* 下部ナビゲーション */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-center">
            <Link
              to="/"
              className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              ホームに戻る
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default OperatorInfo;