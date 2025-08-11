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
                当サイトの運営者が中小企業庁長官より任命された<strong className="text-blue-900">「アトツギ甲子園地域アンバサダー」</strong>であることから、条件が合えば補助金申請時の加点要素となる<strong className="text-blue-900">「アトツギ甲子園」</strong>へのエントリー支援も併せて行っています。
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
          <div className="space-y-2">
            <p className="text-gray-900 font-medium">羽生田大陸（ハニュウダ　リク）</p>
            <p className="text-gray-700">株式会社羽生田鉄工所 専務取締役</p>
            <p className="text-gray-600 text-sm">第3回大会ファイナリスト</p>
            <p className="text-gray-600 text-sm">長野地域アンバサダー</p>
          </div>
        </div>
        
        {/* コンテンツグリッド */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* 会社概要カード */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                事業概要
              </h3>
            </div>
            <div className="p-6 space-y-5">
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                <p className="text-gray-800 font-medium leading-relaxed">
                  <strong className="text-blue-900">140年続く長野の鉄工所</strong>。1884年（明治17年）創業の老舗でありながら、常に時代に合わせて事業を革新し続けています。
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-gray-800 leading-relaxed">「キノコから宇宙まで」圧力容器・装置・ラインを手がける鉄工所6代目</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-gray-800 leading-relaxed">CFRPのハードルを下げるコンポジットセンターの運営</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-gray-800 leading-relaxed">データ駆動形ものづくりでロスとコストを最小化する事業の開発</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* サポート内容カード */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 border-b border-red-200">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <svg className="w-6 h-6 mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                サポート内容
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-600 leading-relaxed">
                全国各地のアンバサダーとのネットワークを活用し、地域を超えた支援体制を構築しています。
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                  <svg className="w-8 h-8 text-blue-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-blue-900 text-sm font-medium">申請書類作成アドバイス</p>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                  <svg className="w-8 h-8 text-green-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <p className="text-green-900 text-sm font-medium">事業計画ブラッシュアップ</p>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
                  <svg className="w-8 h-8 text-purple-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V1a1 1 0 011-1h2a1 1 0 011 1v3z" />
                  </svg>
                  <p className="text-purple-900 text-sm font-medium">プレゼンテーション指導</p>
                </div>
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
                  <svg className="w-8 h-8 text-orange-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-orange-900 text-sm font-medium">全国アンバサダー連携</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* コンタクトセクション */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 text-white">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-3">お気軽にご相談ください</h3>
            <p className="text-gray-300 leading-relaxed">
              アトツギ甲子園申請に関するサポートは各SNSのDMからお願いします。<br />
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
              to="/#atotsugi"
              className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
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