import React from 'react';
import { Link } from 'react-router-dom';

function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー部分 */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              プライバシーポリシー
            </h1>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              個人情報の取り扱いについて
            </p>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <section className="mx-auto max-w-4xl px-4 py-12">
        <div className="space-y-6 text-gray-700 text-sm leading-relaxed">
          <p>シンセイダー（以下「当サイト」）は、原則として利用者の入力データをサーバーに保存しません。補助金申請準備機能や診断機能はすべてブラウザ内で処理されます。</p>

          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">1. 取得する情報</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>問い合わせフォーム送信時の氏名・連絡先・相談内容</li>
              <li>任意で提供いただいたファイルや事業概要</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">2. 利用目的</h3>
            <p>取得した情報は、お問い合わせへの回答、またはご希望に応じたサポート提供のみに利用します。</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">3. 第三者提供</h3>
            <p>法令に基づく場合を除き、第三者への提供は行いません。アトツギ甲子園事務局等への情報提供が必要な場合は、事前に同意をいただきます。</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">4. 保管期間と削除</h3>
            <p>問い合わせに関するデータは対応終了後速やかに削除します。</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">5. 改定</h3>
            <p>必要に応じて本ポリシーを改定する場合があります。最新の内容は本ページでご確認ください。</p>
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

export default PrivacyPolicy;