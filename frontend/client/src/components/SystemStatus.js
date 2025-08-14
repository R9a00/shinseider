import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import config from '../config';

function SystemStatus() {
  const [integrityStatus, setIntegrityStatus] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [runningTests, setRunningTests] = useState(false);

  useEffect(() => {
    fetchSystemStatus();
  }, []);

  const fetchSystemStatus = async () => {
    try {
      const [integrityResponse, testResultsResponse] = await Promise.all([
        fetch(`${config.API_BASE_URL}/system-integrity-status`),
        fetch(`${config.API_BASE_URL}/test-results`)
      ]);

      if (!integrityResponse.ok || !testResultsResponse.ok) {
        throw new Error('システム状況の取得に失敗しました');
      }

      const integrityData = await integrityResponse.json();
      const testResultsData = await testResultsResponse.json();

      setIntegrityStatus(integrityData);
      setTestResults(testResultsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const runTests = async () => {
    setRunningTests(true);
    try {
      const response = await fetch(`${config.API_BASE_URL}/run-tests`, {
        method: 'POST'
      });
      
      if (response.ok) {
        // テスト実行後、結果を再取得
        setTimeout(() => {
          fetchSystemStatus();
          setRunningTests(false);
        }, 2000);
      } else {
        setRunningTests(false);
      }
    } catch (err) {
      setRunningTests(false);
      setError('テスト実行に失敗しました');
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
              システム状況
            </h1>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              システムの動作状況、データ完全性、機能テスト結果を確認できます
            </p>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <section className="mx-auto max-w-4xl px-4 py-8">
        
        {/* システムテスト結果 */}
        {testResults && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-8">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                システム機能テスト結果
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{testResults.summary.passed}</div>
                  <div className="text-sm text-gray-600">合格</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">{testResults.summary.failed}</div>
                  <div className="text-sm text-gray-600">失敗</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{testResults.summary.success_rate.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">成功率</div>
                </div>
              </div>
              
              {/* テスト実行ボタン */}
              <div className="mb-6 text-center">
                <button
                  onClick={runTests}
                  disabled={runningTests}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${
                    runningTests 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {runningTests ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      テスト実行中...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      テスト実行
                    </>
                  )}
                </button>
              </div>
              
              {/* カテゴリ別テスト結果 */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">テスト項目詳細</h3>
                
                {/* データ完全性テスト */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                    <span className="mr-2">🔍</span>
                    データ完全性テスト ({testResults.categories.integrity?.total || 0}件)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {testResults.test_details.filter(test => test.category === 'integrity').map((test, index) => (
                      <div key={test.test_name} className="bg-white rounded-md p-3 border border-blue-200">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium text-sm text-gray-900">{test.display_name}</div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            test.status === 'passed' ? 'bg-green-100 text-green-800' : 
                            test.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {test.status === 'passed' ? '✅' : test.status === 'failed' ? '❌' : '⚠️'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">{test.description}</div>
                        {test.feature && (
                          <div className="text-xs text-blue-600 mt-1 font-medium">{test.feature}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* システム機能テスト */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                    <span className="mr-2">⚙️</span>
                    システム機能テスト ({testResults.categories.functionality?.total || 0}件)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {testResults.test_details.filter(test => test.category === 'functionality').map((test, index) => (
                      <div key={test.test_name} className="bg-white rounded-md p-3 border border-green-200">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium text-sm text-gray-900">{test.display_name}</div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            test.status === 'passed' ? 'bg-green-100 text-green-800' : 
                            test.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {test.status === 'passed' ? '✅' : test.status === 'failed' ? '❌' : '⚠️'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">{test.description}</div>
                        {test.feature && (
                          <div className="text-xs text-green-600 mt-1 font-medium">{test.feature}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 全体の更新状況サマリー */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              データ更新状況
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
            <li>• <strong>システム機能テスト:</strong> API稼働、データ取得、整合性、パフォーマンスなどの実際の機能をテスト</li>
            <li>• <strong>データ完全性テスト:</strong> 補助金情報の鮮度、日付整合性、参照情報の正確性をチェック</li>
            <li>• <strong>データ更新状況:</strong> 補助金情報がいつ最後に更新されたかを確認</li>
            <li>• テスト結果は自動で実行され、リアルタイムに更新されます</li>
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