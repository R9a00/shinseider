import React, { useState, useEffect } from 'react';

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
    return <div>データを読み込み中...</div>;
  }

  if (completed) {
    return (
      <div>
        <h2>診断完了</h2>
        <p>すべての質問に回答しました。</p>
        <button onClick={downloadWord}>Wordファイルをダウンロード</button>
      </div>
    );
  }

  return (
    <div>
      <h2>3分診断</h2>
      
      {/* データ保存状況の表示 */}
      {lastSaved && (
        <div style={{ 
          backgroundColor: '#e8f5e8', 
          padding: '10px', 
          marginBottom: '20px', 
          borderRadius: '5px',
          fontSize: '14px'
        }}>
          <strong>✓ データが自動保存されています</strong><br />
          最終保存: {lastSaved.toLocaleString()}
          <button 
            onClick={clearSavedData}
            style={{ 
              marginLeft: '10px', 
              padding: '5px 10px', 
              backgroundColor: '#ff6b6b', 
              color: 'white', 
              border: 'none', 
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            データ削除
          </button>
        </div>
      )}
      
      <div>
        <p>質問 {currentQuestion + 1} / {questions.length}</p>
        <h3>{questions[currentQuestion].question}</h3>
        <p className="example-hint">{questions[currentQuestion].example_hint}</p>
        {questions[currentQuestion].type === 'choice' ? (
          <div>
            {questions[currentQuestion].options.map((option, index) => (
              <div key={index}>
                <input
                  type="radio"
                  id={option}
                  name="choice"
                  value={option}
                  checked={answers[currentQuestion] === option}
                  onChange={handleAnswer}
                />
                <label htmlFor={option}>{option}</label>
              </div>
            ))}
          </div>
        ) : (
          <textarea
            value={answers[currentQuestion]}
            onChange={handleAnswer}
            rows="10"
            cols="80"
            placeholder="ここに回答を入力してください..."
          />
        )}
        <div>
          {currentQuestion > 0 && <button onClick={prevQuestion}>前へ</button>}
          <button onClick={nextQuestion}>
            {currentQuestion === questions.length - 1 ? '完了' : '次へ'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Phase1;
