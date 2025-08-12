import React from 'react';
import { Link } from 'react-router-dom';

function Disclaimer() {
  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              免責事項
            </h1>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              シンセイダーの利用に関する重要な注意事項
            </p>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="prose prose-gray max-w-none">
          
          {/* ベータ版について */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-orange-800 mb-2">ベータ版サービスについて</h3>
                <p className="text-orange-700 leading-relaxed">
                  当サイトはベータ版であり、機能は改善途上のものです。現段階でも、ある程度使える形にはなっていると思いますが、網羅性・完全性を保証するものではありません。
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* サービスの性質 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">サービスの性質について</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  シンセイダーは、補助金申請の準備をサポートするツールです。以下の点にご注意ください：
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>申請書の作成支援を目的としており、申請の成功を保証するものではありません</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>提供される情報は参考情報であり、最新性や正確性を保証するものではありません</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>ベータ版のため、予告なく機能の変更や停止を行う場合があります</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* 利用者の責任 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">利用者の責任</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  シンセイダーをご利用いただく際は、以下の点をご理解いただき、利用者ご自身の責任でご利用ください：
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>実際の申請に際しては、必ず公式ページの最新情報を確認してください</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>申請要件や締切等の重要な情報は、公募要領等の公式文書で確認してください</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>当サイトの利用により生じた損害について、運営者は一切の責任を負いません</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* 情報の正確性 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">情報の正確性について</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  補助金制度は頻繁に変更されるため、以下の点にご注意ください：
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>補助金の募集状況、要件、締切等は予告なく変更される可能性があります</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>当サイトの情報が最新でない場合があります</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>申請前には必ず各実施機関の公式サイトで最新情報を確認してください</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* データの取り扱い */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">データの取り扱い</h2>
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">プライバシー保護</h3>
                    <p className="text-green-700 leading-relaxed">
                      入力された情報は、お使いのブラウザ内でのみ処理され、サーバーに送信・保存されることはありません。
                      詳細については<Link to="/privacy-policy" className="text-green-800 underline hover:text-green-900">プライバシーポリシー</Link>をご確認ください。
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 変更について */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">免責事項の変更</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  本免責事項は、サービスの改善に伴い予告なく変更する場合があります。
                  重要な変更については、サイト上でお知らせいたします。
                </p>
              </div>
            </section>
          </div>
        </div>

        {/* ナビゲーション */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <Link
            to="/"
            className="inline-flex items-center text-red-600 hover:text-red-700 font-medium"
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Disclaimer;