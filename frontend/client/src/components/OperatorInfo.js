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
          
          {/* プロフィール＆ソーシャルリンクセクション */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">プロフィール</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              「キノコから宇宙まで」圧力容器・装置・ラインを手がける鉄工所5か6代目/第3回アトツギ甲子園ファイナリスト/CFRPのハードルを下げるコンポジットセンター運営/AI×鉄工所/ Vibe cording/東京⇄長野/アトツギ甲子園地域アンバサダー。お気軽にご相談ください。
            </p>
            
            {/* ソーシャルリンクボタン */}
            <div className="flex flex-wrap gap-3">
              <a 
                href="https://x.com/rikuhnd" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                X（Twitter）
              </a>
              
              <a 
                href="https://www.facebook.com/rickr19" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </a>
              
              <Link 
                to="/#atotsugi"
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                相談する
              </Link>
            </div>
          </div>
          
          <div>
            <p><strong>連絡先：</strong> アトツギ甲子園申請サポートに関するご相談は、トップページの「アトツギの方へ」セクションやSNSのDMからお気軽にアクセスください。</p>
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