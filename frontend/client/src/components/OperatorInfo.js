import React from 'react';
import { Link } from 'react-router-dom';

function OperatorInfo() {
  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー部分 */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              当サイトと運営者について
            </h1>
          </div>
        </div>
      </div>
      
      {/* サイト説明セクション */}
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                <strong className="text-blue-900">シンセイダー（当サイト）</strong>は、補助金を申請のややこしさを無くし、申請ハードルを下げることで、忙しくリソースがないから補助金が必要なのに補助金の取得にリソースを使う矛盾を解決することに貢献し、皆さんの本業にかける時間を少しでも増やしたいと考えて作成・運営するサイトです。
              </p>
              <p>
                当サイトの運営者が中小企業庁長官より任命された<strong className="text-blue-900">「アトツギ甲子園地域アンバサダー」</strong>であることから、条件が合えば補助金申請時の加点要素となる<a href="https://atotsugi-koshien.go.jp/" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline hover:text-blue-800 font-semibold">「アトツギ甲子園」</a>へのエントリー支援も併せて行っています。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        {/* プロフィールカード */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">運営者</h3>
          <div className="space-y-3">
            <p className="text-gray-900 font-medium text-lg">羽生田大陸（ハニュウダ　リク）</p>
            <div className="flex items-center gap-3">
              <p className="text-gray-700 font-medium">株式会社羽生田鉄工所 専務取締役</p>
              <a 
                href="https://www.hanyuda.co.jp/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                ウェブサイト
              </a>
            </div>
            <p className="text-gray-600 text-sm">第3回大会ファイナリスト</p>
            <p className="text-gray-600 text-sm">アトツギ甲子園長野地域アンバサダー</p>
          </div>
        </div>
        
        {/* コンタクトセクション */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 text-white">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-3">お気軽にご相談ください</h3>
            <p className="text-gray-300 leading-relaxed">
              アトツギ甲子園申請に関するサポートは、羽生田大陸（当サイト運営者）が窓口となり各SNSのDMからお願いします。<br />
              過去の出場経験と地域アンバサダーとしての知見を活かし、みなさんの挑戦をサポートいたします。
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="https://x.com/rikuhnd" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              X（Twitter）でDM
            </a>
            
            <a 
              href="https://www.facebook.com/rickr19" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              FacebookでDM
            </a>
            
            <Link 
              to="/contact"
              className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              サイトから相談
            </Link>
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