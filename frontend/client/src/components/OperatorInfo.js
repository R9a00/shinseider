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
            <p><strong>運営者：</strong> アトツギ甲子園長野地域アンバサダー・一号</p>
          </div>
          
          <div>
            <p><strong>担当：</strong> 羽生田 大陸（株式会社羽生田鉄工所専務取締役 中小企業庁長官任命 アトツギ甲子園 中部ブロック地域アンバサダー／第３回大会ファイナリスト）</p>
          </div>
          
          <div>
            <p><strong>プロフィール：</strong> 「キノコから宇宙まで」圧力容器・装置・ラインを手がける鉄工敀5か6代目/第3回アトツギ甲子園ファイナリスト/CFRPのハードルを下げるコンポジットセンター運営/AI×鉄工所/ Vibe cording/東京⇄長野/アトツギ甲子園地域アンバサダー。お気軽にご相談ください。</p>
            <p className="mt-3 text-sm text-blue-600">
              <a href="https://x.com/rikuhnd" target="_blank" rel="noopener noreferrer" className="hover:text-blue-800 underline">
                X（Twitter）プロフィールを見る
              </a>
            </p>
          </div>
          
          <div>
            <p><strong>連絡先：</strong> アトツギ甲子園申請サポートに関するご相談は、トップページの「アトツギの方へ」セクションからお気軽にアクセスください。</p>
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