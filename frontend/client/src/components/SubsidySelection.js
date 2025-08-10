import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

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
        const response = await fetch('http://localhost:8888/subsidies');
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
      <div className="bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              シンセイ準備
            </h1>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              サポートを受けたい補助金を選択してください。<br />
              選択した補助金に応じて、最適な申請サポートを提供します。
            </p>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="mx-auto max-w-4xl px-4 py-12">
        {subsidies.length > 0 ? (
          <div className="space-y-6">
            {focusSubsidy === 'atotsugi' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-yellow-800 mb-2">
                      🏆 アトツギ甲子園申請サポート
                    </h3>
                    <p className="text-sm text-yellow-700 mb-4">
                      アトツギ甲子園の申請書準備をお手伝いします！下記の「アトツギ甲子園」を選択して、専用の42項目ミニタスクシステムで簡単に申請書を作成できます。
                    </p>
                    <div className="bg-white border border-yellow-200 rounded-md p-3">
                      <div className="flex items-center space-x-2 text-sm text-yellow-800">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>1タスク=1設問の簡単入力</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-yellow-800 mt-1">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>選択式中心で初心者でも安心</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-yellow-800 mt-1">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>統合タスクで時短入力も可能</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              利用可能な補助金一覧（{subsidies.length}件）
            </h2>
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
              {subsidies.map((subsidy) => {
                const isAtotsugiAndFocused = subsidy.id === 'atotsugi' && focusSubsidy === 'atotsugi';
                return (
                <Link
                  key={subsidy.id}
                  to={`/subsidy-application-support/${subsidy.id}`}
                  className={`group relative rounded-xl border p-6 shadow-sm transition-all duration-200 hover:shadow-md ${
                    isAtotsugiAndFocused 
                      ? 'border-yellow-400 bg-yellow-50 ring-2 ring-yellow-300 hover:bg-yellow-100' 
                      : 'border-gray-200 bg-white hover:border-red-300 hover:bg-red-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {isAtotsugiAndFocused && (
                        <div className="flex items-center space-x-1 mb-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            🎯 おすすめ
                          </span>
                        </div>
                      )}
                      <h3 className={`text-lg font-semibold mb-2 ${
                        isAtotsugiAndFocused 
                          ? 'text-yellow-900 group-hover:text-yellow-700' 
                          : 'text-gray-900 group-hover:text-red-700'
                      }`}>
                        {subsidy.name}
                        {isAtotsugiAndFocused && ' 🏆'}
                      </h3>
                      <div className={`flex items-center text-sm ${
                        isAtotsugiAndFocused 
                          ? 'text-yellow-600 group-hover:text-yellow-500' 
                          : 'text-gray-500 group-hover:text-red-600'
                      }`}>
                        <span>{isAtotsugiAndFocused ? 'ミニタスクで簡単申請書作成' : '申請サポートを開始'}</span>
                        <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
                );
              })}
            </div>
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
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <Link
              to="/"
              className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              ホームに戻る
            </Link>
            <Link
              to="/phase1"
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-red-600 hover:border-red-300"
            >
              まずは3分診断を試す
              <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubsidySelection;
