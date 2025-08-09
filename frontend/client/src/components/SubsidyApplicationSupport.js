import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function SubsidyApplicationSupport() {
  const { subsidyId } = useParams();
  const [sections, setSections] = useState([]);
  const [subsidyName, setSubsidyName] = useState('');
  const [answers, setAnswers] = useState({});
  const [inputMode, setInputMode] = useState('guided');
  const [output, setOutput] = useState('');
  const [outputTitle, setOutputTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOutputOptions, setShowOutputOptions] = useState(false);

  useEffect(() => {
    const fetchSubsidyData = async () => {
      try {
        setLoading(true);
        const sectionsResponse = await fetch(`http://localhost:8888/get_application_questions/${subsidyId}`);
        if (!sectionsResponse.ok) {
          throw new Error('質問データの取得に失敗しました');
        }
        const sectionsData = await sectionsResponse.json();
        setSections(sectionsData.sections || []);

        const metadataResponse = await fetch(`http://localhost:8888/subsidies/${subsidyId}/metadata`);
        if (metadataResponse.ok) {
          const metadataData = await metadataResponse.json();
          setSubsidyName(metadataData.name);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (subsidyId) {
      fetchSubsidyData();
    }
  }, [subsidyId]);

  const handleAnswerChange = (sectionId, value) => {
    setAnswers(prev => ({ ...prev, [sectionId]: value }));
  };

  const handleInitialSubmit = (e) => {
    e.preventDefault();
    setShowOutputOptions(true);
  };

  const handleGenerateOutput = async (target) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8888/generate_application_advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subsidy_id: subsidyId, answers, input_mode: inputMode, target: target })
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'アウトプットの生成に失敗しました。');
      }
      const data = await response.json();
      setOutput(data.output);
      if (data.type === 'prompt') {
        setOutputTitle('AI相談用プロンプト');
      } else if (data.type === 'summary') {
        setOutputTitle('専門家への相談サマリー');
      } else if (data.type === 'reflection') {
        setOutputTitle('自己評価用の問いかけリスト');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output).then(() => {
      alert('クリップボードにコピーしました！');
    }, () => {
      alert('コピーに失敗しました。');
    });
  };

  if (loading) {
    return <div>データを読み込み中...</div>;
  }

  if (error) {
    return <div style={{color: 'red'}}>エラー: {error}</div>;
  }

  return (
    <div>
      <h2>シンセイ準備: {subsidyName}</h2>

      {!showOutputOptions ? (
        <form onSubmit={handleInitialSubmit}>
          {sections.map((section) => (
            <div key={section.id} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
              <h4 style={{ marginBottom: '10px', color: '#333' }}>{section.title}</h4>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>{section.hint}</p>
              <textarea
                value={answers[section.id] || ''}
                onChange={(e) => handleAnswerChange(section.id, e.target.value)}
                rows="5"
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '3px' }}
                placeholder="ここに回答を入力してください..."
              />
            </div>
          ))}
          <button type="submit">分析・生成する</button>
        </form>
      ) : (
        <div>
          <h3>アウトプットを選択してください</h3>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
             <button onClick={() => handleGenerateOutput('ai')} disabled={isSubmitting}>AIに相談</button>
             <button onClick={() => handleGenerateOutput('human')} disabled={isSubmitting}>専門家に相談</button>
             <button onClick={() => handleGenerateOutput('self')} disabled={isSubmitting}>自分で考える</button>
          </div>
          {isSubmitting && <div>生成中...</div>}
          {error && <div style={{color: 'red'}}>エラー: {error}</div>}
          {output && (
            <div className="output-box">
              <h3>{outputTitle}</h3>
              <textarea readOnly value={output} rows="20" style={{width: '100%'}} />
              <button onClick={copyToClipboard}>クリップボードにコピー</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SubsidyApplicationSupport;