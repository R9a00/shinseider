import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const questions = [
  {
    question: 'あなたの事業アイデアは、現在どの段階にありますか？',
    type: 'choice',
    options: ['アイデア着想段階', '事業計画策定段階', '既に事業を開始している'],
    example_hint: '最も近いものを選択してください。'
  },
  {
    question: 'あなたの事業アイデアの核となる「やりたいこと」は何ですか？既存事業の強みをどのように活かしますか？',
    type: 'text',
    example_hint: '例：既存の製造技術を活かした新製品開発、長年の顧客基盤を活用した新規サービス展開など'
  },
  {
    question: 'その事業アイデアは、社会のどのような課題を解決し、誰を、どのように幸せにしますか？具体的なインパクトを教えてください。',
    type: 'text',
    example_hint: '例：高齢化、環境問題、地域経済の衰退などの課題を解決し、顧客の生活が便利になる、環境負荷が低減される、地域に新たな雇用が生まれるなど'
  },
  {
    question: 'なぜあなた（後継者）が、この事業を「やりたい」のですか？その背景にある個人的な想いや、これまでの経験から得た動機を具体的に教えてください。',
    type: 'text',
    example_hint: '例：家業への危機感、幼い頃からの夢、社会への貢献意欲、修行時代の学び、失敗からの教訓、人との出会いなど'
  },
  {
    question: 'この事業アイデアを実現するために、現在の会社の経営資源（ヒト・モノ・カネ・情報・技術・顧客基盤など）をどのように活用しますか？具体的に記述してください。',
    type: 'text',
    example_hint: '例：熟練の職人、遊休資産、長年の取引先、蓄積されたデータ、特許技術など'
  },
  {
    question: 'この事業アイデアのターゲット市場はどこですか？その市場の規模、成長性、顧客ニーズについて、データや根拠を交えて説明してください。',
    type: 'text',
    example_hint: '例：〇〇兆円市場、年〇〇%成長、〇〇という不満を抱えている層。市場調査レポート、顧客アンケート結果など'
  },
  {
    question: '競合他社と比較した際の、あなたの事業の優位性や独自性は何ですか？どのように差別化を図りますか？',
    type: 'text',
    example_hint: '例：独自の技術、低コスト構造、優れた顧客サービスなど。競合（A社、B社）との比較を通じて具体的に'
  },
  {
    question: 'この事業アイデアを実現する上で、最も大きな課題やリスクは何だと思いますか？また、その課題をどのように乗り越え、リスクを管理しますか？',
    type: 'text',
    example_hint: '例：資金調達、人材確保、法規制、技術開発の遅延など。資金調達計画、採用戦略、専門家との連携、フェーズ分け開発など'
  },
  {
    question: 'この事業アイデアの実現に向けた、具体的な目標（短期・中期・長期）と、その達成のためのロードマップを教えてください。',
    type: 'text',
    example_hint: '例：1年後に売上〇〇円達成、3年後に市場シェア〇〇%獲得、5年後にIPOなど。フェーズごとのマイルストーン、主要なタスク、担当者など'
  },
  {
    question: 'この事業を通じて、あなたは経営者としてどのように成長したいですか？5年後の理想の姿を教えてください。',
    type: 'text',
    example_hint: '例：業界の変革者になる、従業員が誇れる会社にする、地域社会に貢献するリーダーになるなど、あなたのビジョンを自由に記述してください。'
  },
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
    newAnswers[currentQuestion] = e.target.value;
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
    const formattedDesire = data.map((answer, index) => ({
      question: questions[index].question,
      answer: answer
    }));
    try {
      const response = await fetch('http://localhost:8888/save_desire', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers: formattedDesire }),
      });
      if (!response.ok) {
        alert('保存に失敗しました。');
      } else {
        // 送信成功後にローカルストレージをクリア
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(LAST_SAVE_KEY);
        setLastSaved(null);
      }
    } catch (error) {
      console.error('Error saving diagnosis:', error);
      alert('保存中にエラーが発生しました。');
    }
  };

  const downloadWord = async () => {
    const formattedContent = questions.map((q, index) => ({
      question: q.question,
      answer: answers[index]
    }));
    try {
      const response = await fetch('http://localhost:8888/generate_textbook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: "事業承継診断レポート", content: JSON.stringify(formattedContent) }),
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "事業承継診断レポート.docx";
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        alert('Wordファイルの生成に失敗しました。');
      }
    } catch (error) {
      console.error('Error downloading word file:', error);
      alert('Wordファイルのダウンロード中にエラーが発生しました。');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            <span className="ml-3 text-lg text-gray-600">診断データを読み込み中...</span>
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
                すべての質問に回答していただき、ありがとうございました。<br />
                診断結果をWordファイルでダウンロードできます。
              </p>
            </div>
          </div>
        </div>
        
        <div className="mx-auto max-w-4xl px-4 py-12">
          <div className="text-center space-y-6">
            <button 
              onClick={downloadWord}
              className="inline-flex items-center rounded-xl bg-red-600 px-8 py-4 text-lg font-semibold text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200"
            >
              <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              診断レポートをダウンロード
            </button>
            
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
              3分診断
            </h1>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              事業承継に関する質問にお答えください。<br />
              あなたに最適な補助金をレコメンドします。
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {questions[currentQuestion].question}
          </h2>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 leading-relaxed">
              <svg className="inline h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <strong>記入例:</strong> {questions[currentQuestion].example_hint}
            </p>
          </div>

          {questions[currentQuestion].type === 'choice' ? (
            <div className="space-y-3 mb-8">
              {questions[currentQuestion].options.map((option, index) => (
                <label 
                  key={index}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="choice"
                    value={option}
                    checked={answers[currentQuestion] === option}
                    onChange={handleAnswer}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                  />
                  <span className="ml-3 text-gray-900">{option}</span>
                </label>
              ))}
            </div>
          ) : (
            <div className="mb-8">
              <textarea
                value={answers[currentQuestion]}
                onChange={handleAnswer}
                rows="8"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                placeholder="ここに回答を入力してください..."
              />
            </div>
          )}
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
