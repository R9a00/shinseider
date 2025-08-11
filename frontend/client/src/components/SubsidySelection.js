import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import config from '../config';

function SubsidySelection() {
  const [subsidies, setSubsidies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  
  // URLパラメータからフォーカス対象を取得
  const urlParams = new URLSearchParams(location.search);
  const focusSubsidy = urlParams.get('focus');

  useEffect(() => {
    const fetchSubsidies = async () => {
      try {
        const response = await fetch(`${config.API_BASE_URL}/subsidies`);
        if (!response.ok) {
          throw new Error('補助金リストの取得に失敗しました。');
        }
        const data = await response.json();
        setSubsidies(data.subsidies);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubsidies();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            <span className="ml-3 text-lg text-gray-600">補助金情報を読み込み中...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <div className="rounded-lg bg-red-50 border border-red-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">エラーが発生しました</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
            <div className="mt-4">
              <Link 
                to="/" 
                className="text-sm font-medium text-red-600 hover:text-red-500"
              >
                ホームに戻る →
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー部分 */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">シンセイ準備</h1>
                <p className="text-sm text-gray-600 mt-1">申請に必要な補助金を選択してください</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <a
                href="#yuguusaku"
                className="inline-flex items-center rounded-lg bg-yellow-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-yellow-600 transition-all duration-200 hover:shadow-md"
              >
                <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" />
                </svg>
                優遇策を見る
                <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="mx-auto max-w-7xl px-4 py-16">
        {subsidies.length > 0 ? (
          <div className="space-y-12">
            {focusSubsidy === 'atotsugi' && (
              <div className="relative rounded-2xl border border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 p-8 shadow-lg">
                <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-yellow-400/10 to-orange-400/10"></div>
                
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500 text-white shadow-lg">
                      <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                      <h3 className="text-2xl font-bold text-gray-900">
                        アトツギ甲子園申請サポート
                      </h3>
                      <span className="inline-flex items-center rounded-full bg-yellow-500 px-3 py-1 text-sm font-semibold text-white">
                        🏆 特別サポート
                      </span>
                    </div>
                    
                    <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                      42項目のミニタスクシステムで、アトツギ甲子園の申請書を簡単に作成できます。
                    </p>
                    
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="flex items-center space-x-3 rounded-lg bg-white/60 px-4 py-3">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-900">1タスク=1設問</span>
                      </div>
                      <div className="flex items-center space-x-3 rounded-lg bg-white/60 px-4 py-3">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-900">選択式中心</span>
                      </div>
                      <div className="flex items-center space-x-3 rounded-lg bg-white/60 px-4 py-3">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-900">統合入力対応</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
{/* 補助金セクション */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">
                利用可能な補助金
              </h2>
              <p className="text-base text-gray-600">
                {subsidies.filter(s => s.id !== 'atotsugi').length}件の補助金申請をサポートしています
              </p>
            </div>
            
            <div className="grid gap-8 sm:grid-cols-1 lg:grid-cols-2 mb-16">
              {subsidies.filter(s => s.id !== 'atotsugi').map((subsidy) => (
                <Link
                  key={subsidy.id}
                  to={`/subsidy-application-support/${subsidy.id}`}
                  className="group relative rounded-2xl border-2 border-gray-200 bg-white hover:border-red-300 hover:bg-gradient-to-br hover:from-red-50 hover:to-pink-50 p-8 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 rounded-xl p-3 bg-red-600">
                          <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold mb-3 text-gray-900 group-hover:text-red-700">
                            {subsidy.name}
                          </h3>
                          
                          <p className="text-base mb-4 text-gray-600">
                            申請に必要な情報を整理し、最適なサポートを提供
                          </p>
                          
                          <div className="inline-flex items-center text-sm font-semibold text-red-600 group-hover:text-red-700">
                            <span>シンセイ準備を開始</span>
                            <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* 優遇策セクション（下部に小さく） */}
            {subsidies.some(s => s.id === 'atotsugi') && (
              <div id="yuguusaku" className="pt-8 border-t border-gray-200">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    優遇策（加点措置）
                  </h3>
                  <p className="text-sm text-gray-500">
                    コンペティション参加で補助金申請時に有利になる制度
                  </p>
                </div>
                
                <div className="max-w-2xl mx-auto">
                  {subsidies.filter(s => s.id === 'atotsugi').map((subsidy) => {
                    const isAtotsugiAndFocused = subsidy.id === 'atotsugi' && focusSubsidy === 'atotsugi';
                    return (
                    <Link
                      key={subsidy.id}
                      to={`/subsidy-application-support/${subsidy.id}`}
                      className="group relative rounded-lg border border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50 hover:border-yellow-400 p-6 shadow transition-all duration-300 hover:shadow-md block"
                    >
                      {isAtotsugiAndFocused && (
                        <div className="absolute -top-2 left-6">
                          <span className="inline-flex items-center rounded-full bg-yellow-500 px-3 py-1 text-xs font-semibold text-white shadow">
                            <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" />
                            </svg>
                            おすすめ
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 rounded-lg p-2 bg-yellow-500">
                          <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" />
                          </svg>
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-1">
                            {subsidy.name}
                          </h4>
                          
                          <p className="text-sm text-gray-600 mb-2">
                            42項目のミニタスクシステムで簡単申請書作成
                          </p>
                          
                          <div className="inline-flex items-center text-xs font-semibold text-yellow-700">
                            <span>シンセイ準備を開始</span>
                            <svg className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.712-3.714M14 40v-4a9.971 9.971 0 01.712-3.714M8 21l4-4 4 4m0 0l4-4 4 4m-8-4v12" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              対応補助金を準備中です
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              現在、サポート対象の補助金はありません。<br />
              新しい補助金のサポートが追加されるまでお待ちください。
            </p>
            <div className="mt-6">
              <Link
                to="/"
                className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                ホームに戻る
              </Link>
            </div>
          </div>
        )}

        {/* 下部のナビゲーション */}
        <div className="mt-20 pt-12 border-t border-gray-200">
          <div className="text-center">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  どの補助金が適しているか迷っていますか？
                </h3>
                <p className="text-gray-600">
                  30秒診断で、あなたに最適な補助金を見つけることができます
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                <Link
                  to="/phase1"
                  className="inline-flex items-center rounded-xl bg-red-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200"
                >
                  <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  30秒診断を試す
                </Link>
                
                <Link
                  to="/"
                  className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  ホームに戻る
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubsidySelection;
