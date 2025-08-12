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
          <p>シンセイダー（以下「当サイト」）は、利用者の入力データを一切サーバーに保存しません。補助金申請準備機能や診断機能はすべてブラウザ内で処理されます。</p>

          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">1. 取得する情報</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>問い合わせフォーム送信時の氏名・連絡先・相談内容</li>
              <li>任意で提供いただいたファイルや事業概要</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">2. 利用目的</h3>
            <p>お問い合わせフォームで取得した情報は、以下の目的でのみ利用します：</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>お問い合わせへの回答</li>
              <li>補助金申請に関するサポート提供</li>
              <li>必要に応じたアトツギ甲子園地域アンバサダーへの紹介</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">3. 第三者提供</h3>
            <p>お問い合わせ内容を第三者に提供することはありません。ただし、より良いサポートのために関係機関をご紹介したいと考える場合は、事前に利用者の同意を得た上で行います。</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">4. 保管期間と削除</h3>
            <p>お問い合わせに関するデータは、運営者のメールサーバーにのみ保管されます。削除を希望される場合は、お問い合わせフォームまたは運営者への直接連絡により、速やかに削除いたします。</p>
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