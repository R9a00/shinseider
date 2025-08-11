import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const questions = [
  {
    question: 'あなたの会社の業界を教えてください',
    type: 'choice',
    options: ['製造業', '建設業', '情報通信業', '小売業', '卸売業', 'サービス業', '飲食業', '医療・介護', '教育', '運輸業', 'その他'],
    key: 'industry'
  },
  {
    question: 'あなたの年齢を教えてください',
    type: 'choice',
    options: ['20代', '30代', '40代', '50代', '60代以上'],
    key: 'age'
  },
  {
    question: '従業員数を教えてください',
    type: 'choice',
    options: ['5人未満', '5人〜20人', '21人〜50人', '51人〜100人', '101人〜300人', '301人以上'],
    key: 'employees'
  },
  {
    question: '現在検討している取り組みをすべて選んでください（複数選択可）',
    type: 'multiple',
    options: ['新製品・サービスの開発', '設備投資・機械導入', 'ITシステム導入', '工場・店舗の自動化', '環境対応・省エネ', '人材育成・スキルアップ', '海外展開', '事業承継', 'どれも該当しない'],
    key: 'initiatives'
  },
  {
    question: 'あなたもしくはご家族で事業承継について関心がありますか？',
    type: 'choice',
    options: ['はい、事業承継予定者です', 'はい、検討中です', 'はい、情報収集段階です', 'いいえ、関心はありません'],
    key: 'is_successor'
  },
  {
    question: '予定している投資規模はどれくらいですか？',
    type: 'choice',
    options: ['100万円未満', '100万円〜500万円', '500万円〜1,000万円', '1,000万円〜3,000万円', '3,000万円〜1億円', '1億円以上', 'まだ未定'],
    key: 'investment_scale'
  },
  {
    question: '補助金申請の経験はありますか？',
    type: 'choice',
    options: ['初めて', '以前に1回申請したことがある', '複数回申請経験がある', '現在も他の補助金を受給中'],
    key: 'subsidy_experience'
  },
  {
    question: 'いつ頃から取り組みを開始したいですか？',
    type: 'choice',
    options: ['すぐに開始したい', '3か月以内', '6か月以内', '1年以内', '1年以上先', 'まだ未定'],
    key: 'timeline'
  },
  {
    question: '最も重要視している点を教えてください',
    type: 'choice',
    options: ['補助率が高い', '採択率が高い', '申請手続きが簡単', '対象範囲が幅広い', '審査期間が短い', 'どれも同じくらい重要'],
    key: 'priority'
  }
];

// ローカルストレージのキー
const STORAGE_KEY = 'attg_phase1_answers';
const LAST_SAVE_KEY = 'attg_phase1_last_save';

function Phase1() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState(Array(questions.length).fill(''));
  const [completed, setCompleted] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // データの自動保存と復元
  useEffect(() => {
    // ページ読み込み時に保存されたデータを復元
    const savedAnswers = localStorage.getItem(STORAGE_KEY);
    const savedLastSave = localStorage.getItem(LAST_SAVE_KEY);
    
    if (savedAnswers) {
      try {
        const parsedAnswers = JSON.parse(savedAnswers);
        setAnswers(parsedAnswers);
        console.log('保存されたデータを復元しました');
      } catch (error) {
        console.error('保存データの復元に失敗しました:', error);
      }
    }
    
    if (savedLastSave) {
      setLastSaved(new Date(savedLastSave));
    }
    
    setIsLoading(false);
  }, []);

  // データの自動保存
  useEffect(() => {
    if (!isLoading) {
      const saveData = () => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
          localStorage.setItem(LAST_SAVE_KEY, new Date().toISOString());
          setLastSaved(new Date());
          console.log('データを自動保存しました');
        } catch (error) {
          console.error('データの保存に失敗しました:', error);
        }
      };

      // 入力から3秒後に自動保存
      const timeoutId = setTimeout(saveData, 3000);
      return () => clearTimeout(timeoutId);
    }
  }, [answers, isLoading]);

  // ページ離脱時の警告
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      const hasUnsavedData = answers.some(answer => answer.trim() !== '');
      if (hasUnsavedData) {
        e.preventDefault();
        e.returnValue = '入力中のデータがあります。本当にページを離れますか？';
        return '入力中のデータがあります。本当にページを離れますか？';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [answers]);

  const handleAnswer = (e) => {
    const newAnswers = [...answers];
    if (questions[currentQuestion].type === 'multiple') {
      const currentAnswers = Array.isArray(newAnswers[currentQuestion]) ? newAnswers[currentQuestion] : [];
      if (e.target.checked) {
        newAnswers[currentQuestion] = [...currentAnswers, e.target.value];
      } else {
        newAnswers[currentQuestion] = currentAnswers.filter(answer => answer !== e.target.value);
      }
    } else {
      newAnswers[currentQuestion] = e.target.value;
    }
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setCompleted(true);
      saveDiagnosis(answers);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const clearSavedData = () => {
    if (window.confirm('保存されたデータを削除しますか？この操作は取り消せません。')) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LAST_SAVE_KEY);
      setAnswers(Array(questions.length).fill(''));
      setLastSaved(null);
      alert('保存されたデータを削除しました');
    }
  };

  const saveDiagnosis = async (data) => {
    // 診断結果をローカルストレージに保存
    const diagnosisResults = data.map((answer, index) => ({
      question: questions[index].question,
      answer: answer,
      key: questions[index].key
    }));
    
    localStorage.setItem('diagnosis_results', JSON.stringify(diagnosisResults));
    
    // 入力データをクリア
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LAST_SAVE_KEY);
    setLastSaved(null);
  };

  const getSubsidyLink = (subsidyName) => {
    // 補助金名から適切なsubsidyIdを取得してリンクを生成
    if (subsidyName.includes('アトツギ甲子園')) {
      return '/subsidy-application-support/atotsugi';
    } else if (subsidyName.includes('ものづくり')) {
      return '/subsidy-application-support/monodukuri_r7_21th';
    } else if (subsidyName.includes('省力化')) {
      return '/subsidy-application-support/shoukuritsuka_ippan';
    } else if (subsidyName.includes('Go-tech') || subsidyName.includes('Go-Tech')) {
      return '/subsidy-application-support/gotech_rd_support';
    } else if (subsidyName.includes('事業承継')) {
      return '/subsidy-application-support/jigyou_shoukei_ma';
    } else if (subsidyName.includes('人材開発')) {
      return '/subsidy-application-support/jinzaikaihatsu';
    } else if (subsidyName.includes('海外展開') || subsidyName.includes('新事業進出')) {
      return '/subsidy-application-support/shinjigyo_shinshutsu';
    } else {
      // デフォルトは一覧ページ
      return '/subsidy-selection';
    }
  };

  const getRecommendations = () => {
    const diagnosisResults = JSON.parse(localStorage.getItem('diagnosis_results') || '[]');
    const responses = {};
    diagnosisResults.forEach(item => {
      if (item.key === 'initiatives' && Array.isArray(item.answer)) {
        responses[item.key] = item.answer;
      } else {
        responses[item.key] = item.answer;
      }
    });
    
    const recommendations = [];
    const initiatives = responses.initiatives || [];
    const industry = responses.industry;
    const investment = responses.investment_scale;
    const priority = responses.priority;
    
    // 製造業特化推奨
    if (industry === '製造業') {
      if (initiatives.includes('ITシステム導入') || initiatives.includes('工場・店舗の自動化') || initiatives.includes('新製品・サービスの開発')) {
        recommendations.push({
          name: 'ものづくり・商業・サービス生産性向上促進補助金',
          reason: '製造業での新製品開発・IT導入・生産性向上に最適です。補助率最大1/2。',
          match_score: 95
        });
      }
      if (initiatives.includes('設備投資・機械導入') || initiatives.includes('工場・店舗の自動化')) {
        recommendations.push({
          name: '中小企業省力化投資補助金',
          reason: '製造業の自動化・省力化設備導入を支援。補助率最大1/2。',
          match_score: 90
        });
      }
    }
    
    // IT・情報通信業特化推奨
    if (industry === '情報通信業') {
      if (initiatives.includes('新製品・サービスの開発')) {
        recommendations.push({
          name: 'Go-tech事業（成長型中小企業等研究開発支援事業）',
          reason: 'IT業界での革新的な研究開発を支援。補助率最大2/3。',
          match_score: 95
        });
      }
      if (initiatives.includes('ITシステム導入')) {
        recommendations.push({
          name: 'ものづくり・商業・サービス生産性向上促進補助金',
          reason: 'ITサービス開発・システム構築に利用可能。',
          match_score: 85
        });
      }
    }
    
    // 省力化投資補助金の適用判定
    if ((initiatives.includes('設備投資・機械導入') || initiatives.includes('工場・店舗の自動化')) && 
        !recommendations.some(r => r.name.includes('中小企業省力化'))) {
      const score = (['製造業', '建設業', '小売業', '卸売業'].includes(industry)) ? 90 : 75;
      recommendations.push({
        name: '中小企業省力化投資補助金',
        reason: '自動化・省力化設備の導入を幅広く支援。採択率が高い。',
        match_score: score
      });
    }
    
    // アトツギ甲子園特別推奨（後継者かつ年齢条件を満たす場合）
    if (responses.is_successor === 'はい、事業承継予定者です' && 
        (responses.age === '20代' || responses.age === '30代' || 
         (responses.age === '40代' && new Date().getFullYear() - 1980 <= 40))) { // 簡略的な40歳以下判定
      recommendations.unshift({
        name: 'アトツギ甲子園申請サポート',
        reason: '事業承継者向け特別プログラム。地方予選進出で各種補助金に加点測定。',
        match_score: 100,
        is_special: true
      });
    }
    
    // 事業承継関連
    if (initiatives.includes('事業承継')) {
      if (!recommendations.some(r => r.name.includes('事業承継'))) {
        recommendations.push({
          name: '事業承継・M&A補助金',
          reason: '事業承継時の設備投資や経営革新を支援。',
          match_score: 95
        });
      }
    }
    
    // 環境関連
    if (initiatives.includes('環境対応・省エネ')) {
      if (!recommendations.some(r => r.name.includes('ものづくり'))) {
        recommendations.push({
          name: 'ものづくり・商業・サービス生産性向上促進補助金',
          reason: '環境対応・省エネで加点測定。幅広い業種で利用可能。',
          match_score: 85
        });
      }
    }
    
    // 人材育成関連は他の補助金で対応
    if (initiatives.includes('人材育成・スキルアップ')) {
      if (!recommendations.some(r => r.name.includes('ものづくり'))) {
        recommendations.push({
          name: 'ものづくり・商業・サービス生産性向上促進補助金',
          reason: '人材育成を含む生産性向上の取り組みを支援。',
          match_score: 75
        });
      }
    }
    
    // 海外展開関連
    if (initiatives.includes('海外展開')) {
      recommendations.push({
        name: '中小企業新事業進出補助金',
        reason: '海外展開や新市場開拓を支援。',
        match_score: 90
      });
    }
    
    // 投資規模別フィルタリング
    if (investment) {
      if (investment === '100万円未満' || investment === '100万円〜500万円') {
        // 小規模投資は省力化が適切
        recommendations.forEach(rec => {
          if (rec.name.includes('ものづくり')) rec.match_score -= 10;
        });
      } else if (investment === '3,000万円〜1億円' || investment === '1億円以上') {
        // 大規模投資はものづくりが適切
        recommendations.forEach(rec => {
          if (rec.name.includes('ものづくり')) rec.match_score += 10;
          if (rec.name.includes('省力化')) rec.match_score -= 5;
        });
      }
    }
    
    // 優先度別調整
    if (priority === '補助率が高い') {
      recommendations.forEach(rec => {
        if (rec.name.includes('ものづくり') || rec.name.includes('Go-tech')) rec.match_score += 10;
      });
    } else if (priority === '採択率が高い') {
      recommendations.forEach(rec => {
        if (rec.name.includes('省力化')) rec.match_score += 10;
        if (rec.name.includes('ものづくり')) rec.match_score -= 5;
      });
    }
    
    // デフォルト推奨（何もマッチしない場合）
    if (recommendations.length === 0 || initiatives.includes('どれも該当しない')) {
      recommendations.push({
        name: '中小企業省力化投資補助金',
        reason: '幅広い業種で利用可能で採択率が高い一般的な補助金です。',
        match_score: 70
      });
      recommendations.push({
        name: 'ものづくり・商業・サービス生産性向上促進補助金',
        reason: '新製品開発や生産性向上に幅広く対応。補助率が高い。',
        match_score: 75
      });
    }
    
    // スコア順でソートして重複除去
    const uniqueRecommendations = recommendations.reduce((acc, current) => {
      const existing = acc.find(item => item.name === current.name);
      if (!existing) {
        acc.push(current);
      } else if (current.match_score > existing.match_score) {
        Object.assign(existing, current);
      }
      return acc;
    }, []);
    
    return uniqueRecommendations.sort((a, b) => (b.match_score || 0) - (a.match_score || 0)).slice(0, 4);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            <span className="ml-3 text-lg text-gray-600">診断を準備中...</span>
          </div>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
          <div className="mx-auto max-w-4xl px-4 py-12">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-600">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                診断完了
              </h1>
              <p className="mt-4 text-lg leading-8 text-gray-600">
                ご回答ありがとうございました。<br />
                あなたにおすすめの補助金をご紹介します。
              </p>
            </div>
          </div>
        </div>
        
        <div className="mx-auto max-w-4xl px-4 py-12">
          <div className="text-center space-y-6">
            <div className="space-y-8">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">おすすめの補助金</h2>
                <div className="space-y-6">
                  {getRecommendations().map((rec, index) => {
                    const isSpecial = rec.is_special;
                    const isFirst = index === 0;
                    
                    return (
                      <div key={index} className={`border-2 rounded-lg p-6 ${
                        isSpecial ? 'border-yellow-300 bg-yellow-50' : 
                        isFirst ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}>
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">{rec.name}</h3>
                          <div className="flex space-x-2">
                            {isSpecial && (
                              <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" />
                                </svg>
                                特別推奨
                              </span>
                            )}
                            {isFirst && !isSpecial && (
                              <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                                最おすすめ
                              </span>
                            )}
                            {rec.match_score && (
                              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                                マッチ度 {rec.match_score}%
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-600 mb-4">{rec.reason}</p>
                        <Link
                          to={getSubsidyLink(rec.name)}
                          className={`inline-flex items-center font-medium ${
                            isSpecial ? 'text-yellow-700 hover:text-yellow-800' : 'text-red-600 hover:text-red-700'
                          }`}
                        >
                          {rec.name.includes('アトツギ甲子園') ? 'アトツギ甲子園申請を始める' : '申請サポートを始める'}
                          <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <Link
                to="/subsidy-selection"
                className="inline-flex items-center rounded-xl bg-red-600 px-8 py-4 text-lg font-semibold text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200"
              >
                <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                補助金申請を開始
              </Link>
            </div>
            
            <div className="mt-8">
              <Link 
                to="/"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                ホームに戻る
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
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              30秒診断
            </h1>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              5つの簡単な質問にお答えください。<br />
              あなたの会社に最適な補助金をレコメンドします。
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* データ保存状況の表示 */}
        {lastSaved && (
          <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-green-800">
                  データが自動保存されています
                </h3>
                <p className="mt-1 text-sm text-green-700">
                  最終保存: {lastSaved.toLocaleString()}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <button 
                  onClick={clearSavedData}
                  className="rounded-md bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  データ削除
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* 進捗表示 */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>質問 {currentQuestion + 1} / {questions.length}</span>
            <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}% 完了</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-red-600 h-2 rounded-full transition-all duration-300 ease-out" 
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* 質問カード */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {questions[currentQuestion].question}
          </h2>

          <div className="space-y-3 mb-8">
            {questions[currentQuestion].options.map((option, index) => {
              const isMultiple = questions[currentQuestion].type === 'multiple';
              const currentAnswers = Array.isArray(answers[currentQuestion]) ? answers[currentQuestion] : [];
              const isChecked = isMultiple ? currentAnswers.includes(option) : answers[currentQuestion] === option;
              
              return (
                <label 
                  key={index}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type={isMultiple ? "checkbox" : "radio"}
                    name={isMultiple ? `multiple_${currentQuestion}` : "choice"}
                    value={option}
                    checked={isChecked}
                    onChange={handleAnswer}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                  />
                  <span className="ml-3 text-gray-900">{option}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* ナビゲーションボタン */}
        <div className="flex justify-between items-center">
          <div>
            {currentQuestion > 0 && (
              <button 
                onClick={prevQuestion}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                前へ
              </button>
            )}
          </div>
          
          <button 
            onClick={nextQuestion}
            className="inline-flex items-center rounded-md bg-red-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            {currentQuestion === questions.length - 1 ? '診断完了' : '次へ'}
            <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* 下部ナビゲーション */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-center">
            <Link
              to="/"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ホームに戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Phase1;
