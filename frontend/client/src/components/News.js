import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

function News() {
  const [newsData, setNewsData] = useState(null);
  const [filteredNews, setFilteredNews] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNewsData();
  }, []);

  useEffect(() => {
    if (newsData) {
      filterNews();
    }
  }, [newsData, selectedCategory]);

  const fetchNewsData = async () => {
    try {
      const response = await fetch('http://localhost:8888/news');
      if (!response.ok) {
        throw new Error('ニュースデータの取得に失敗しました');
      }
      const data = await response.json();
      setNewsData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterNews = () => {
    if (!newsData) return;
    
    let filtered = newsData.news || [];
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    // 日付の新しい順にソート
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    setFilteredNews(filtered);
  };

  const getCategoryInfo = (categoryId) => {
    if (!newsData?.categories) return null;
    return newsData.categories.find(cat => cat.id === categoryId);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
              onClick={fetchNewsData}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              再試行
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー部分 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              📢 ニュース・お知らせ
            </h1>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              補助金最新情報・システム更新情報・基礎知識をお届けします
            </p>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        {/* カテゴリーフィルター */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              すべて
            </button>
            {newsData?.categories?.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? `bg-${category.color}-600 text-white`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* ニュース一覧 */}
        <div className="space-y-6">
          {filteredNews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">該当するニュースがありません</p>
            </div>
          ) : (
            filteredNews.map((item) => {
              const categoryInfo = getCategoryInfo(item.category);
              return (
                <article
                  key={item.id}
                  className={`bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow ${
                    item.is_featured ? 'ring-2 ring-yellow-400' : ''
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* カテゴリーとメタ情報 */}
                        <div className="flex items-center space-x-3 mb-3">
                          {categoryInfo && (
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-${categoryInfo.color}-100 text-${categoryInfo.color}-800`}>
                              {categoryInfo.icon} {categoryInfo.name}
                            </span>
                          )}
                          <span className="text-sm text-gray-500">
                            {formatDate(item.date)}
                          </span>
                          <span className="text-sm text-gray-500">
                            by {item.author}
                          </span>
                          {item.reading_time && (
                            <span className="text-sm text-gray-500">
                              📖 約{item.reading_time}分
                            </span>
                          )}
                        </div>

                        {/* タイトルと要約 */}
                        <h2 className="text-xl font-bold text-gray-900 mb-3">
                          {item.is_featured && <span className="text-yellow-500 mr-2">⭐</span>}
                          {item.title}
                        </h2>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          {item.summary}
                        </p>

                        {/* タグ */}
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {item.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* 関連補助金 */}
                        {item.related_subsidies && item.related_subsidies.length > 0 && (
                          <div className="mb-4">
                            <span className="text-sm text-gray-600">関連補助金: </span>
                            {item.related_subsidies.map((subsidyId, index) => (
                              <span key={index} className="text-sm text-blue-600 mr-2">
                                {getSubsidyDisplayName(subsidyId)}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* 詳細表示（リンクなし） */}
                        <div className="text-gray-500 text-sm italic">
                          詳細ページは現在作成中です
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* 外部リンク */}
        {newsData?.external_links && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">関連する外部サイト</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* 公式サイト */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">公式サイト</h4>
                <div className="space-y-2">
                  {newsData.external_links.official_sites?.map((site, index) => (
                    <a
                      key={index}
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium text-gray-900">{site.name}</div>
                      <div className="text-sm text-gray-600">{site.description}</div>
                    </a>
                  ))}
                </div>
              </div>

              {/* ツール・システム */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">関連ツール</h4>
                <div className="space-y-2">
                  {newsData.external_links.tools?.map((tool, index) => (
                    <a
                      key={index}
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium text-gray-900">{tool.name}</div>
                      <div className="text-sm text-gray-600">{tool.description}</div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

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

// ニュース詳細ページ
function NewsDetail() {
  const { id } = useParams();
  const [newsData, setNewsData] = useState(null);
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNewsData();
  }, [id]);

  const fetchNewsData = async () => {
    try {
      const response = await fetch('http://localhost:8888/news');
      if (!response.ok) {
        throw new Error('ニュースデータの取得に失敗しました');
      }
      const data = await response.json();
      setNewsData(data);
      
      const foundArticle = data.news?.find(item => item.id === id);
      if (!foundArticle) {
        throw new Error('記事が見つかりません');
      }
      setArticle(foundArticle);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryInfo = (categoryId) => {
    if (!newsData?.categories) return null;
    return newsData.categories.find(cat => cat.id === categoryId);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  if (error || !article) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <div className="text-center">
            <p className="text-red-600 text-lg">{error || '記事が見つかりません'}</p>
            <Link
              to="/news"
              className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              ニュース一覧に戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const categoryInfo = getCategoryInfo(article.category);

  return (
    <div className="min-h-screen bg-white">
      {/* 記事ヘッダー */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <nav className="mb-4">
            <Link to="/news" className="text-blue-600 hover:text-blue-800 text-sm">
              ← ニュース一覧に戻る
            </Link>
          </nav>
          
          <div className="space-y-4">
            {/* カテゴリーとメタ情報 */}
            <div className="flex items-center space-x-3">
              {categoryInfo && (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${categoryInfo.color}-100 text-${categoryInfo.color}-800`}>
                  {categoryInfo.icon} {categoryInfo.name}
                </span>
              )}
              <span className="text-sm text-gray-600">
                {formatDate(article.date)}
              </span>
              <span className="text-sm text-gray-600">
                by {article.author}
              </span>
              {article.reading_time && (
                <span className="text-sm text-gray-600">
                  📖 約{article.reading_time}分
                </span>
              )}
            </div>

            {/* タイトル */}
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {article.is_featured && <span className="text-yellow-500 mr-2">⭐</span>}
              {article.title}
            </h1>

            {/* 要約 */}
            <p className="text-lg text-gray-600 leading-relaxed">
              {article.summary}
            </p>

            {/* タグ */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 記事本文 */}
      <article className="mx-auto max-w-4xl px-4 py-12">
        <div className="prose prose-lg max-w-none">
          <div dangerouslySetInnerHTML={{ 
            __html: article.content.replace(/\n/g, '<br/>').replace(/## /g, '<h2>').replace(/<h2>([^<]+)/g, '<h2>$1</h2>') 
          }} />
        </div>

        {/* 関連補助金 */}
        {article.related_subsidies && article.related_subsidies.length > 0 && (
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">関連する補助金</h3>
            <div className="space-y-1">
              {article.related_subsidies.map((subsidyId, index) => (
                <Link
                  key={index}
                  to={`/subsidies/${subsidyId}`}
                  className="block text-blue-600 hover:text-blue-800"
                >
                  → {getSubsidyDisplayName(subsidyId)}
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
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

export default News;
export { NewsDetail };