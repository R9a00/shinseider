import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import config from '../config';

function SystemStatus() {
  const [integrityStatus, setIntegrityStatus] = useState(null);
  const [operationalStatus, setOperationalStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [triggering, setTriggering] = useState(false);

  useEffect(() => {
    fetchSystemStatus();
  }, []);

  const fetchSystemStatus = async () => {
    try {
      const [integrityResponse, operationalResponse] = await Promise.all([
        fetch(`${config.API_BASE_URL}/system-integrity-status`),
        fetch(`${config.API_BASE_URL}/operational-status`)
      ]);

      if (!integrityResponse.ok || !operationalResponse.ok) {
        throw new Error('システム状況の取得に失敗しました');
      }

      const integrityData = await integrityResponse.json();
      const operationalData = await operationalResponse.json();

      setIntegrityStatus(integrityData);
      setOperationalStatus(operationalData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const triggerIntegrityCheck = async () => {
    setTriggering(true);
    try {
      const response = await fetch(`${config.API_BASE_URL}/trigger-integrity-check`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('チェック実行に失敗しました');
      }

      const result = await response.json();
      
      if (result.status === 'success') {
        // 成功したら5秒後にステータスを更新
        setTimeout(fetchSystemStatus, 5000);
        alert('システム完全性チェックを実行しました。結果を更新中...');
      } else {
        alert('チェック実行中にエラーが発生しました');
      }
    } catch (err) {
      alert(`エラー: ${err.message}`);
    } finally {
      setTriggering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-lg text-gray-600">ステータス確認中...</span>
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
              onClick={fetchSystemStatus}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              再試行
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'excellent': return '🎉';
      case 'good': return '✅';
      case 'warning': return '⚠️';
      case 'critical': return '❌';
      default: return '❓';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatElapsedTime = (hours) => {
    if (hours === null || hours === undefined) return '不明';
    if (hours < 1) return `${Math.round(hours * 60)}分前`;
    if (hours < 24) return `${Math.round(hours)}時間前`;
    if (hours < 720) return `${Math.round(hours / 24)}日前`; // 1か月未満
    if (hours < 8760) return `${Math.round(hours / 720)}か月前`; // 1年未満
    return `${Math.round(hours / 8760)}年前`;
  };

  const getCheckStatus = (elapsedHours) => {
    if (elapsedHours === null || elapsedHours === undefined) {
      return { status: 'not_executed', message: 'チェック未実行', color: 'text-gray-600 bg-gray-50 border-gray-200' };
    }
    if (elapsedHours > 4320) { // 6か月以上
      return { status: 'old', message: '要更新', color: 'text-red-600 bg-red-50 border-red-200' };
    }
    if (elapsedHours > 2160) { // 3か月以上
      return { status: 'outdated', message: '更新推奨', color: 'text-orange-600 bg-orange-50 border-orange-200' };
    }
    if (elapsedHours > 720) { // 1か月以上
      return { status: 'warning', message: 'やや古い', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
    }
    return { status: 'current', message: '最新', color: 'text-green-600 bg-green-50 border-green-200' };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              補助金情報の更新状況
            </h1>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              各補助金の最新情報調査がいつ実施されたか、情報が古くなっていないかを確認できます
            </p>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <section className="mx-auto max-w-4xl px-4 py-8">
        
        {/* 全体の更新状況サマリー */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              情報更新状況の記録
            </h2>
          </div>
            
            <div className="p-6">
              {integrityStatus && (
                <>
                  {/* 更新状況の要約 */}
                  <div className={`rounded-lg p-6 mb-6 border ${getCheckStatus(integrityStatus.elapsed_hours).color}`}>
                    <div className="text-center mb-4">
                      <span className="text-4xl mb-2 block">🔍</span>
                      <h3 className="text-2xl font-bold">{getCheckStatus(integrityStatus.elapsed_hours).message}</h3>
                      <p className="text-lg mt-2">
                        最後に補助金情報を調査したのは <strong>{formatElapsedTime(integrityStatus.elapsed_hours)}</strong>
                      </p>
                    </div>
                    
                    {integrityStatus.elapsed_hours > 720 && (
                      <div className="bg-white bg-opacity-50 rounded-lg p-4 mt-4">
                        <p className="text-sm text-center">
                          💡 補助金の募集要項や条件が変更されている可能性があります。管理者による情報更新が必要です。
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 補助金更新状況 */}
                  {integrityStatus.violation_count === 0 ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">✅</span>
                        <div>
                          <h3 className="font-semibold text-green-800">全ての補助金情報が最新です</h3>
                          <p className="text-sm text-green-700">すべての補助金が更新済みです</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">⚠️</span>
                        <div>
                          <h3 className="font-semibold text-yellow-800">更新が必要な補助金があります</h3>
                          <p className="text-sm text-yellow-700">{integrityStatus.violation_count}件の補助金で情報が古くなっています</p>
                        </div>
                      </div>
                    </div>
                  )}

                </>
              )}
            </div>
          </div>

        {/* このページについて */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">💡 このページについて</h2>
          <ul className="text-blue-800 space-y-2">
            <li>• 補助金情報がいつ最後に更新されたかを確認できます</li>
            <li>• 1か月以上更新されていない場合は、募集要項や条件が変更されている可能性があります</li>
            <li>• 実際の情報更新は管理者が手動で行います</li>
          </ul>
          <div className="mt-4 text-sm text-blue-700">
            <p><strong>判定基準:</strong> 1か月以内=最新、1-3か月=やや古い、3-6か月=更新推奨、6か月以上=要更新</p>
          </div>
        </div>

        {/* ナビゲーション */}
        <div className="text-center">
          <Link
            to="/update-history"
            className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
ソースデータ更新状況
          </Link>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            ホームに戻る
          </Link>
        </div>

      </section>
    </div>
  );
}

export default SystemStatus;