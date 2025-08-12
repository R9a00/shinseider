import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// UI Components
import Callout from './ui/Callout';
import DnaCascadeDiagram from './ui/DnaCascadeDiagram';
import NecessityPyramid from './ui/NecessityPyramid';
import ScrollspyNav from './ui/ScrollspyNav';
import SimpleDetailedToggle from './ui/SimpleDetailedToggle';

function KnowledgeBase() {
  const [knowledgeData, setKnowledgeData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('foundation');
  const [currentMode, setCurrentMode] = useState('simple');

  const [currentSection, setCurrentSection] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [readProgress, setReadProgress] = useState(0);
  
  useEffect(() => {
    fetchKnowledgeData();
  }, []);

  // スクロール進捗とScrollspy
  useEffect(() => {
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;
      const progress = (scrolled / docHeight) * 100;
      setReadProgress(Math.min(100, Math.max(0, progress)));

      // 現在のセクションを検出
      const sections = document.querySelectorAll('[data-section-id]');
      let current = '';
      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 100) {
          current = section.dataset.sectionId;
        }
      });
      setCurrentSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchKnowledgeData = async () => {
    try {
      const response = await fetch('http://localhost:8888/knowledge-base');
      if (!response.ok) {
        throw new Error('基礎知識データの取得に失敗しました');
      }
      const data = await response.json();
      setKnowledgeData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.querySelector(`[data-section-id="${sectionId}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const renderDiagram = (sectionId) => {
    if (sectionId === 'subsidy_structure_essence') {
      return <DnaCascadeDiagram />;
    }
    if (sectionId === 'acquisition_logic_analysis') {
      return <NecessityPyramid />;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            <span className="ml-3 text-lg text-slate-600">読み込み中...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <Callout variant="warning" title="エラーが発生しました">
            <p>{error}</p>
            <button 
              onClick={fetchKnowledgeData}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              再試行
            </button>
          </Callout>
        </div>
      </div>
    );
  }

  if (!knowledgeData) return null;

  const categories = knowledgeData.categories || {};
  const content = knowledgeData.content || {};
  const currentCategoryData = categories[selectedCategory];
  
  // 現在のカテゴリのセクション一覧を取得
  const sectionIds = currentCategoryData?.sections || [];
  const sections = sectionIds.map(id => [id, content[id]]).filter(([id, data]) => data);

  // ナビゲーション用のセクションリスト
  const navSections = sections.map(([id, section]) => ({
    id,
    title: section.title
  }));

  // デバッグ（一度だけ）
  if (sections.length > 0 && !window.debugShown) {
    console.log('=== DEBUG INFO ===');
    console.log('knowledgeData:', !!knowledgeData);
    console.log('sections.length:', sections.length);
    console.log('loading:', loading);
    console.log('error:', error);
    window.debugShown = true;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white">
      {/* Back Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link 
              to="/" 
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              ホームに戻る
            </Link>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Link 
          to="/"
          className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 group transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">ホームへ戻る</span>
        </Link>
      </div>

      {/* Sticky Subheader */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Left: Title */}
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold text-emerald-800">
                📚 {currentCategoryData?.name || '基礎知識'}
              </h1>
              <span className="text-sm text-emerald-600">📖 5分でマスター</span>
            </div>

            {/* Right: Toggle */}
            <SimpleDetailedToggle onChange={setCurrentMode} />
          </div>

          {/* Progress Bar */}
          {readProgress > 0 && (
            <div className="absolute bottom-0 left-0 right-0">
              <div className="h-0.5 bg-emerald-100">
                <div 
                  className="h-full bg-emerald-400 transition-all duration-300"
                  style={{ width: `${readProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Layout */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Category Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm max-w-md">
            {Object.entries(categories).map(([key, category]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  selectedCategory === key
                    ? 'bg-emerald-100 text-emerald-800 shadow-sm'
                    : 'text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Navigation */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-32">
              <ScrollspyNav
                sections={navSections}
                currentSection={currentSection}
                onSectionClick={scrollToSection}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="space-y-12">
              {sections.map(([sectionId, section]) => (
                <article key={sectionId} data-section-id={sectionId} className="scroll-mt-24">
                  <header className="mb-8">
                    <h2 className="text-2xl font-bold text-emerald-800 mb-2 flex items-center gap-2">
                      <span className="text-2xl">💡</span>
                      {section.title}
                    </h2>
                    {section.overview && (
                      <p className="text-lg text-emerald-700 leading-relaxed">
                        {section.overview}
                      </p>
                    )}
                  </header>

                  {/* Diagram */}
                  {renderDiagram(sectionId) && (
                    <div className="mb-8">
                      {renderDiagram(sectionId)}
                    </div>
                  )}

                  {/* Content based on current mode */}
                  {(section.content || section.key_points) && (
                    <div className="space-y-8">
                      {/* Simple Mode - supports both new (section.content.simple) and old (section.key_points) format */}
                      {currentMode === 'simple' && (section.content?.simple || section.key_points) && (
                        <div className="space-y-6">
                          {/* Overview */}
                          {(section.content?.simple?.overview || section.overview) && (
                            <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed">
                              <div dangerouslySetInnerHTML={{ 
                                __html: (section.content?.simple?.overview || section.overview).replace(/\n/g, '<br />') 
                              }} />
                            </div>
                          )}

                          {/* Key Points */}
                          {(() => {
                            const keyPoints = section.content?.simple?.key_points || section.key_points;
                            
                            if (!keyPoints || !window.debugShown2) {
                              if (!keyPoints) return null;
                              console.log(`Final structure for ${sectionId}:`, keyPoints);
                              window.debugShown2 = true;
                            }

                            return (
                              <div className="space-y-6">
                                {Array.isArray(keyPoints) ? (
                                  // Old format: array of objects
                                  keyPoints.map((point, idx) => {
                                    // Handle nested object structure like { "national_budget": { "title": "...", "content": "..." } }
                                    let actualPoint, title, content, examples;
                                    
                                    if (point.definition) {
                                      actualPoint = point.definition;
                                    } else if (point.characteristics) {
                                      actualPoint = point.characteristics;  
                                    } else if (point.types) {
                                      actualPoint = point.types;
                                    } else if (typeof point === 'object' && Object.keys(point).length === 1) {
                                      // Handle structure like { "national_budget": { "title": "...", "content": "..." } }
                                      const [key, value] = Object.entries(point)[0];
                                      actualPoint = value;
                                    } else {
                                      actualPoint = point;
                                    }
                                    
                                    title = actualPoint.title || point.title || `要点 ${idx + 1}`;
                                    content = actualPoint.content || actualPoint.explanation || point.content || point.explanation;
                                    examples = actualPoint.examples || point.examples || (actualPoint.example || point.example ? [actualPoint.example || point.example] : null);
                                    
                                    return (
                                      <Callout key={idx} variant="info" title={title}>
                                        <p className="mb-3">{content}</p>
                                        {examples && examples.length > 0 && (
                                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                            <h6 className="font-medium text-blue-900 mb-2">具体例</h6>
                                            <ul className="text-blue-800 text-sm space-y-1">
                                              {examples.map((example, i) => (
                                                <li key={i}>• {example}</li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                      </Callout>
                                    );
                                  })
                                ) : (
                                  // New format: object with structured points
                                  Object.entries(keyPoints).map(([pointId, point]) => (
                                    <Callout key={pointId} variant="info" title={point.title || pointId}>
                                      <p className="mb-3">{point.content || point.explanation}</p>
                                      {(point.examples || point.example) && (
                                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                          <h6 className="font-medium text-blue-900 mb-2">具体例</h6>
                                          {point.examples ? (
                                            <ul className="text-blue-800 text-sm space-y-1">
                                              {point.examples.map((example, i) => (
                                                <li key={i}>• {example}</li>
                                              ))}
                                            </ul>
                                          ) : (
                                            <p className="text-blue-800 text-sm">• {point.example}</p>
                                          )}
                                        </div>
                                      )}
                                    </Callout>
                                  ))
                                )}
                              </div>
                            );
                          })()}

                          {/* Quick Takeaway */}
                          {section.content?.simple?.quick_takeaway && (
                            <Callout variant="success" title="💡 要点まとめ">
                              <div className="whitespace-pre-line">
                                {section.content?.simple?.quick_takeaway}
                              </div>
                            </Callout>
                          )}

                          {/* Next Steps */}
                          {section.content?.simple?.next_steps && (
                            <Callout variant="info" title="🚀 次の一歩">
                              <div className="whitespace-pre-line">
                                {section.content?.simple?.next_steps}
                              </div>
                            </Callout>
                          )}

                          {/* DNA Snap Card */}
                          {section.content?.simple?.dna_snap_card && (
                            <Callout variant="warning" title="📊 制度DNAスナップカード">
                              <pre className="whitespace-pre-wrap text-sm font-mono">
                                {section.content?.simple?.dna_snap_card}
                              </pre>
                            </Callout>
                          )}
                        </div>
                      )}

                      {/* Detailed Mode */}
                      {currentMode === 'detailed' && (
                        <div className="space-y-6">
                          {/* New format: structured detailed content */}
                          {section.content?.detailed && (
                            <Callout variant="expert" title="🎯 専門家向け（詳細分析）">
                              <div className="space-y-6">
                                <div className="prose max-w-none text-slate-700">
                                  {section.content?.detailed?.abstract}
                                </div>
                                
                                {section.content?.detailed?.comprehensive_analysis && (
                                  <div className="space-y-4">
                                    {Object.entries(section.content?.detailed?.comprehensive_analysis).map(([key, value]) => (
                                      <div key={key} className="border-l-4 border-indigo-400 pl-4">
                                        <h5 className="font-semibold text-indigo-900 mb-2 capitalize">
                                          {key.replace(/_/g, ' ')}
                                        </h5>
                                        <div className="prose prose-sm max-w-none text-indigo-800">
                                          {value}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </Callout>
                          )}
                          
                          {/* Old format: show all available detailed information */}
                          {!section.content?.detailed && section.key_points && (
                            <div className="space-y-4">
                              <h4 className="text-lg font-semibold text-emerald-800 mb-4">📋 詳細情報</h4>
                              {Array.isArray(section.key_points) ? 
                                section.key_points.map((point, idx) => {
                                  const mainContent = point.definition || point.characteristics || point.types || point;
                                  const title = mainContent.title || point.title || '詳細項目';
                                  const content = mainContent.content || point.content || point.explanation;
                                  const examples = mainContent.examples || point.examples;
                                  const details = mainContent.details || point.details;
                                  const classifications = mainContent.classifications || point.classifications;
                                  
                                  return (
                                    <div key={idx} className="bg-emerald-50 rounded-lg p-6 border border-emerald-200">
                                      <h5 className="text-lg font-semibold text-emerald-800 mb-3">{title}</h5>
                                      <div className="space-y-4">
                                        {content && <p className="text-emerald-700">{content}</p>}
                                        
                                        {details && (
                                          <div>
                                            <h6 className="font-medium text-emerald-800 mb-2">詳細</h6>
                                            <ul className="list-disc list-inside text-emerald-700 space-y-1">
                                              {details.map((detail, i) => <li key={i}>{detail}</li>)}
                                            </ul>
                                          </div>
                                        )}
                                        
                                        {examples && (
                                          <div>
                                            <h6 className="font-medium text-emerald-800 mb-2">具体例</h6>
                                            <ul className="list-disc list-inside text-emerald-700 space-y-1">
                                              {examples.map((example, i) => <li key={i}>{example}</li>)}
                                            </ul>
                                          </div>
                                        )}
                                        
                                        {classifications && (
                                          <div>
                                            <h6 className="font-medium text-emerald-800 mb-2">分類</h6>
                                            <div className="space-y-3">
                                              {Object.entries(classifications).map(([key, items]) => (
                                                <div key={key}>
                                                  <p className="font-medium text-emerald-800">{key.replace(/_/g, ' ')}</p>
                                                  <div className="ml-4">
                                                    {Array.isArray(items) ? 
                                                      items.map((item, i) => (
                                                        <div key={i} className="mb-2">
                                                          <span className="font-medium">{item.name}</span>
                                                          {item.examples && (
                                                            <ul className="list-disc list-inside ml-4 text-sm">
                                                              {item.examples.map((ex, j) => <li key={j}>{ex}</li>)}
                                                            </ul>
                                                          )}
                                                        </div>
                                                      )) : 
                                                      <p>{items}</p>
                                                    }
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                }) :
                                Object.entries(section.key_points).map(([pointId, point]) => (
                                  <div key={pointId} className="bg-emerald-50 rounded-lg p-6 border border-emerald-200">
                                    <h5 className="text-lg font-semibold text-emerald-800 mb-3">{point.title}</h5>
                                    <p className="text-emerald-700">{point.content || point.explanation}</p>
                                    {point.examples && (
                                      <div className="mt-3">
                                        <h6 className="font-medium text-emerald-800 mb-2">具体例</h6>
                                        <ul className="list-disc list-inside text-emerald-700">
                                          {point.examples.map((example, i) => <li key={i}>{example}</li>)}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                ))
                              }
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>

          {/* Right Sidebar - Action Rail */}
        </div>
      </div>
    </div>
  );
}

export default KnowledgeBase;