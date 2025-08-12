import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import config from '../config';

function UpdateHistory() {
  const [versionData, setVersionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVersionHistory();
  }, []);

  const fetchVersionHistory = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/version-history`);
      if (!response.ok) {
        throw new Error('バージョン履歴の取得に失敗しました');
      }
      const data = await response.json();
      setVersionData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            <span className="ml-3 text-lg text-gray-600">読み込み中...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <div className="text-center">
            <p className="text-red-600 text-lg">{error}</p>
            <button 
              onClick={fetchVersionHistory}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              再試行
            </button>
          </div>
        </div>
      </div>
    );
  }

  const metadata = versionData?.metadata || {};
  const subsidies = versionData?.subsidies || {};
  const updatePolicy = versionData?.update_policy || {};

  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー部分 */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              情報更新履歴・参照元
            </h1>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              補助金情報の更新状況と参照した公式資料
            </p>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        {/* 全体情報 */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            システム情報
          </h2>
          <div className="grid md:grid-cols-2 gap-4 text-gray-700">
            <div>
              <p><strong>最終更新日：</strong> {metadata.last_updated || '未設定'}</p>
              <p><strong>バージョン：</strong> {metadata.version || '未設定'}</p>
            </div>
            <div>
              <p><strong>管理者：</strong> {metadata.maintainer || '未設定'}</p>
              <p><strong>更新頻度：</strong> {updatePolicy.check_frequency || '未設定'}</p>
            </div>
          </div>
        </div>

        {/* 補助金別情報 */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">補助金別更新状況</h2>
          
          <div className="grid gap-6">
            {Object.entries(subsidies).map(([subsidyId, subsidyInfo]) => (
              <div key={subsidyId} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {getSubsidyDisplayName(subsidyId)}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        v{subsidyInfo.version}
                      </span>
                      <span className="text-sm text-gray-500">
                        {subsidyInfo.last_updated}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* 参照元情報 */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      参照元資料
                    </h4>
                    <div className="space-y-2">
                      {subsidyInfo.source_references?.map((ref, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{ref.title}</p>
                              <p className="text-sm text-gray-600 mt-1">
                                バージョン: {ref.version} | 参照日: {ref.accessed_date}
                              </p>
                            </div>
                            <a 
                              href={ref.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="ml-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              公式サイト
                            </a>
                          </div>
                        </div>
                      )) || <p className="text-gray-500 text-sm">参照元情報が設定されていません</p>}
                    </div>
                  </div>

                  {/* 更新履歴 */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      更新履歴
                    </h4>
                    <div className="space-y-3">
                      {subsidyInfo.change_history?.map((change, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 border-l-4 border-blue-400 bg-blue-50 rounded-r-lg">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                v{change.version}
                              </span>
                              <span className="text-sm text-gray-600">{change.date}</span>
                              <span className="text-sm text-gray-500">by {change.author}</span>
                            </div>
                            <p className="text-gray-800 text-sm">{change.changes}</p>
                            {change.reference_updated && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
                                公式資料更新対応
                              </span>
                            )}
                          </div>
                        </div>
                      )) || <p className="text-gray-500 text-sm">更新履歴がありません</p>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
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

// 補助金IDから表示名を取得
function getSubsidyDisplayName(subsidyId) {
  const displayNames = {
    'shinjigyo_shinshutsu': '中小企業新事業進出補助金',
    'atotsugi': 'アトツギ甲子園',
    'monodukuri_r7_21th': 'ものづくり・商業・サービス生産性向上促進補助金',
    'jigyou_shoukei_ma': '事業承継・M&A補助金',
    'gotech_rd_support': 'Go-Tech事業（成長型中小企業等研究開発支援事業）',
    'shoukuritsuka_ippan': '中小企業省力化投資補助金'
  };
  return displayNames[subsidyId] || subsidyId;
}

export default UpdateHistory;