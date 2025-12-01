import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import OperatorInfo from './components/OperatorInfo';


/**
 * メンテナンスページ
 * 試験公開期間終了のお知らせ
 */
function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* ロゴ */}
        <div className="flex justify-center">
          <img
            src="/shinseider_logo.png"
            alt="シンセイダー"
            className="h-24 w-auto"
          />
        </div>

        {/* メインメッセージ */}
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            準備中
          </h1>

          <div className="space-y-4 text-gray-600">
            <p className="leading-relaxed">
              当サイトは試験公開の期間を終了しました。
            </p>
            <p className="leading-relaxed">
              皆様のフィードバックを受け、来年度のアップデートを検討中です。
            </p>
          </div>

          {/* お問い合わせボタン */}
          <div className="pt-4">
            <a
              href="https://shinseider.onrender.com/operator-info"
              className="inline-flex items-center justify-center w-full rounded-xl bg-blue-600 px-6 py-4 text-base font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all duration-200"
            >
              <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              ご連絡はこちらまで
            </a>
          </div>
        </div>

        {/* フッター */}
        <p className="text-sm text-gray-400">
          © {new Date().getFullYear()} Shinseider. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="App">
        <Routes>
          {/* 運営者情報ページのみアクセス可能 */}
          <Route path="/operator-info" element={<OperatorInfo />} />
          {/* その他すべてのルートはメンテナンスページを表示 */}
          <Route path="*" element={<MaintenancePage />} />
        </Routes>
      </div>
    </Router>
  );
}
