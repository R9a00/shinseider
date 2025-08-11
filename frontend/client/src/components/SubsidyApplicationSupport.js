import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import config from '../config';

function SubsidyApplicationSupport() {
  const { subsidyId } = useParams();
  const [sections, setSections] = useState([]);
  const [subsidyName, setSubsidyName] = useState('');
  const [answers, setAnswers] = useState({});
  const [inputMode, setInputMode] = useState('micro_tasks'); // micro_tasks or integrated
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
        const sectionsResponse = await fetch(`${config.API_BASE_URL}/get_application_questions/${subsidyId}`);
        if (!sectionsResponse.ok) {
          throw new Error('質問データの取得に失敗しました');
        }
        const sectionsData = await sectionsResponse.json();
        setSections(sectionsData.sections || []);

        const metadataResponse = await fetch(`${config.API_BASE_URL}/subsidies/${subsidyId}/metadata`);
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


  const handleAnswerChange = (sectionId, value, taskId = null) => {
    if (taskId) {
      // ミニタスクの場合
      setAnswers(prev => ({
        ...prev,
        [sectionId]: {
          ...prev[sectionId],
          [taskId]: value
        }
      }));
    } else {
      // 通常のセクションの場合
      setAnswers(prev => ({ ...prev, [sectionId]: value }));
    }
  };

  const getIntegratedPlaceholder = (sectionId) => {
    const placeholders = {
      basic_info: `例:
氏名: 田中太郎
会社名: 株式会社田中製作所
年齢: 34歳
所在地: 東京都
承継予定: あり（来年度予定）`,

      current_business: `例:
主業種: 製造業
主力製品: 精密機械部品の加工
強み: 短納期対応、高精度加工技術、品質管理
現在の課題: 人手不足、新規顧客開拓、設備老朽化`,

      customer_problem: `例:
顧客の困りごと:
• 小ロットの試作が高額で納期が長い
• 急な仕様変更に対応してくれる業者が少ない
• 品質が安定しない

競合他社: A製作所、B工業、C技研
競合との違い:
• 当社は3日で試作対応可能（競合は2週間）
• CADデータから直接加工できる技術力
• 品質保証体制が充実`,

      solution_idea: `例:
キャッチ: 「3日で届く小ロット試作サービス」
誰に: 開発段階の製造業（ベンチャー企業、大手の開発部門）
何を: 小ロット・短納期の精密部品試作サービス
どうやって: AIを活用した自動見積もり+専用ラインで効率化
提供価値: スピード、品質、コスト削減`,

      revenue_model: `例:
収益の取り方: 単発販売（試作受託）
販売先: 新規B2B（開発部門）
販売チャネル: 直販、Web受注
単価: 5万円/件
月間件数: 50件
月間売上: 250万円
固定費: 月120万円（人件費・設備費）
現在の検証状況: テスト販売済み`,

      personal_story: `例:
なぜ私がやるのか:
父が築いた技術を受け継ぎ、さらに発展させたい。長年培った加工技術に最新のデジタル技術を組み合わせることで、業界に新しい価値を提供できると確信している。

事業承継への想い:
単に家業を継ぐのではなく、新しいビジネスモデルで成長させたい。従業員の雇用を守りながら、次世代に誇れる会社にしたい。

実現したい未来:
地域の製造業のハブとして、中小企業の開発力向上に貢献したい。技術の街として地域全体を活性化させたい。`,

      feasibility_assessment: `例:
技術成熟度: TRL6（実証済み）
体制: 営業・開発・品質は社内でカバー済み
初期投資: 300万円（設備導入・システム開発）
月次運営費: 50万円（マーケティング・維持費）
許認可: 不要
供給体制: 主要材料サプライヤーと基本合意済み

主要リスク: 受注変動、競合参入、人材確保
対策: 複数チャネル展開、独自技術の特許化、研修制度充実

マイルストーン:
2025-11: 試作システム完成
2026-01: β版サービス開始
2026-04: 本格サービスローンチ
2026-12: 月間100件達成`
    };
    
    return placeholders[sectionId] || 'まとめて入力してください...';
  };

  const renderMicroTask = (section, task, sectionIndex, taskIndex) => {
    const currentValue = answers[section.id]?.[task.task_id] || '';
    
    // 条件付きレンダリングのチェック
    if (task.conditional_on && task.conditional_value) {
      const conditionValue = answers[section.id]?.[task.conditional_on];
      if (Array.isArray(conditionValue)) {
        // multi_selectの場合
        if (!conditionValue.includes(task.conditional_value)) {
          return null; // 非表示
        }
      } else {
        // selectの場合
        if (conditionValue !== task.conditional_value) {
          return null; // 非表示
        }
      }
    }
    
    return (
      <div key={task.task_id} className="border-b border-gray-100 last:border-b-0 p-4">
        <div className="flex items-start space-x-3">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-800">
            {taskIndex + 1}
          </span>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              {task.label}
              {task.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            
            {task.type === 'text' && (
              <input
                type="text"
                value={currentValue}
                onChange={(e) => handleAnswerChange(section.id, e.target.value, task.task_id)}
                placeholder={task.placeholder || ''}
                maxLength={task.max_length}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            )}
            
            {task.type === 'number' && (
              <input
                type="number"
                value={currentValue}
                onChange={(e) => handleAnswerChange(section.id, e.target.value, task.task_id)}
                onFocus={(e) => {
                  // フォーカス時に値が空でプレースホルダーがある場合は設定
                  if (!currentValue && task.placeholder) {
                    handleAnswerChange(section.id, task.placeholder, task.task_id);
                  }
                }}
                placeholder={task.placeholder || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            )}
            
            {task.type === 'select' && (
              <select
                value={currentValue}
                onChange={(e) => handleAnswerChange(section.id, e.target.value, task.task_id)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">選択してください</option>
                {task.options?.map((option, idx) => (
                  <option key={idx} value={option}>{option}</option>
                ))}
              </select>
            )}
            
            {task.type === 'multi_select' && (
              <div className="space-y-2">
                {task.options?.map((option, idx) => {
                  const selectedValues = Array.isArray(currentValue) ? currentValue : [];
                  const isSelected = selectedValues.includes(option);
                  
                  return (
                    <label key={idx} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const newValues = e.target.checked 
                            ? [...selectedValues, option]
                            : selectedValues.filter(v => v !== option);
                          
                          // max_selections制限をチェック
                          if (task.max_selections && newValues.length > task.max_selections) {
                            return;
                          }
                          
                          handleAnswerChange(section.id, newValues, task.task_id);
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{option}</span>
                    </label>
                  );
                })}
                {task.max_selections && (
                  <p className="text-xs text-gray-500">最大{task.max_selections}個まで選択可能</p>
                )}
              </div>
            )}
            
            {task.type === 'text_array' && (
              <div className="space-y-2">
                {Array.from({ length: task.max_items || 3 }, (_, idx) => {
                  const arrayValues = Array.isArray(currentValue) ? currentValue : [];
                  return (
                    <input
                      key={idx}
                      type="text"
                      value={arrayValues[idx] || ''}
                      onChange={(e) => {
                        const newArray = [...arrayValues];
                        newArray[idx] = e.target.value;
                        // 空の末尾要素を削除
                        while (newArray.length > 0 && newArray[newArray.length - 1] === '') {
                          newArray.pop();
                        }
                        handleAnswerChange(section.id, newArray, task.task_id);
                      }}
                      placeholder={task.placeholder || `項目${idx + 1}`}
                      maxLength={task.max_length_per_item}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  );
                })}
              </div>
            )}
            
            {task.type === 'textarea' && (
              <textarea
                value={currentValue}
                onChange={(e) => handleAnswerChange(section.id, e.target.value, task.task_id)}
                placeholder={task.placeholder || ''}
                rows="4"
                maxLength={task.max_length}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
              />
            )}
            
            {task.type === 'structured_array' && (
              <div className="space-y-3">
                {/* マイルストーン用の特別レイアウト */}
                {task.task_id === 'MILESTONES' ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">事業のマイルストーン（重要な節目）</h4>
                      <p className="text-xs text-gray-600">
                        事業を進める上での重要な節目（試作完成、サービス開始、売上目標達成など）を時系列で入力してください
                      </p>
                    </div>
{(() => {
                      const arrayValues = Array.isArray(currentValue) ? currentValue : [];
                      const displayCount = Math.max(2, arrayValues.length + 1);
                      
                      return Array.from({ length: Math.min(displayCount, task.max_items || 5) }, (_, idx) => {
                        const itemValue = arrayValues[idx] || {};
                        
                        return (
                          <div key={idx} className="border border-yellow-300 rounded-lg p-4 bg-white relative">
                            <div className="flex items-center justify-between mb-3">
                              <div className="text-sm text-yellow-700 font-medium">マイルストーン {idx + 1}</div>
                              <div className="flex items-center space-x-2">
                                {Object.values(itemValue).some(v => v && v.trim() !== '') && (
                                  <div className="text-xs text-green-600">✓</div>
                                )}
                                {idx > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newArray = arrayValues.filter((_, i) => i !== idx);
                                      handleAnswerChange(section.id, newArray, task.task_id);
                                    }}
                                    className="text-red-500 hover:text-red-700 text-xs"
                                  >
                                    削除
                                  </button>
                                )}
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-1">
                                  <label className="block text-xs text-gray-600 mb-1 font-medium">時期</label>
                                  <input
                                    type="month"
                                    value={itemValue.ym || ''}
                                    onChange={(e) => {
                                      const newArray = [...arrayValues];
                                      newArray[idx] = { ...itemValue, ym: e.target.value };
                                      handleAnswerChange(section.id, newArray, task.task_id);
                                    }}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                  />
                                </div>
                                <div className="col-span-2">
                                  <label className="block text-xs text-gray-600 mb-1 font-medium">達成内容</label>
                                  <input
                                    type="text"
                                    value={itemValue.note || ''}
                                    onChange={(e) => {
                                      const newArray = [...arrayValues];
                                      newArray[idx] = { ...itemValue, note: e.target.value };
                                      handleAnswerChange(section.id, newArray, task.task_id);
                                    }}
                                    placeholder="例：試作品完成、β版リリース、売上目標達成"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs text-gray-600 mb-1 font-medium">詳細・備考（任意）</label>
                                <input
                                  type="text"
                                  value={itemValue.owner || ''}
                                  onChange={(e) => {
                                    const newArray = [...arrayValues];
                                    newArray[idx] = { ...itemValue, owner: e.target.value };
                                    handleAnswerChange(section.id, newArray, task.task_id);
                                  }}
                                  placeholder="例：予算100万円、テストユーザー10社、月間売上50万円目標"
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-gray-50"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                    
                    {/* 追加ボタン */}
                    {(() => {
                      const arrayValues = Array.isArray(currentValue) ? currentValue : [];
                      const canAdd = arrayValues.length < (task.max_items || 5);
                      
                      return canAdd && (
                        <div className="text-center">
                          <button
                            type="button"
                            onClick={() => {
                              const newArray = [...arrayValues];
                              newArray.push({ ym: '', note: '', owner: '' });
                              handleAnswerChange(section.id, newArray, task.task_id);
                            }}
                            className="inline-flex items-center px-4 py-2 border border-yellow-300 rounded-lg text-sm text-yellow-700 bg-yellow-50 hover:bg-yellow-100 transition-colors"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            マイルストーンを追加
                          </button>
                        </div>
                      );
                    })()}
                    <div className="mt-2 text-xs text-yellow-700">
                      💡 例：「2025-11, 試作完了, 予算100万円」「2026-01, β版リリース, テストユーザー10社」「2026-04, 本格サービス開始, 売上月50万円目標」
                    </div>
                  </div>
                ) : (
                  // 他の構造化配列の場合は従来通り
                  <>
                    {Array.from({ length: task.max_items || 3 }, (_, idx) => {
                      const arrayValues = Array.isArray(currentValue) ? currentValue : [];
                      const itemValue = arrayValues[idx] || {};
                      
                      return (
                        <div key={idx} className="border border-gray-200 rounded-lg p-3">
                          <div className="text-xs text-gray-500 mb-2">項目 {idx + 1}</div>
                          <div className="grid gap-2" style={{gridTemplateColumns: `repeat(${task.fields?.length || 2}, 1fr)`}}>
                            {task.fields?.map((field, fieldIdx) => (
                              <input
                                key={fieldIdx}
                                type="text"
                                value={itemValue[field] || ''}
                                onChange={(e) => {
                                  const newArray = [...arrayValues];
                                  newArray[idx] = { ...itemValue, [field]: e.target.value };
                                  while (newArray.length > 0 && 
                                    Object.values(newArray[newArray.length - 1] || {}).every(v => !v || v.trim() === '')) {
                                    newArray.pop();
                                  }
                                  handleAnswerChange(section.id, newArray, task.task_id);
                                }}
                                placeholder={task.placeholder ?? `${field}を入力`}
                                className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              />
                            )) || [
                              <input key="0" type="text" placeholder="項目1" className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />,
                              <input key="1" type="text" placeholder="項目2" className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                            ]}
                          </div>
                        </div>
                      );
                    })}
                    {task.placeholder && (
                      <p className="text-xs text-gray-500 mt-1">{task.placeholder}</p>
                    )}
                  </>
                )}
              </div>
            )}

            {/* 文字数制限表示 */}
            {(task.type === 'text' && task.max_length) && (
              <p className="text-xs text-gray-500 mt-1">
                {currentValue.length}/{task.max_length}文字
              </p>
            )}
            
            {(task.type === 'textarea' && task.max_length) && (
              <p className="text-xs text-gray-500 mt-1">
                {currentValue.length}/{task.max_length}文字
              </p>
            )}
            
            {/* 注意書き表示 */}
            {task.note && (
              <p className="text-xs text-blue-600 mt-1">
                ※ {task.note}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSection = (section, sectionIndex) => {
    // アトツギ甲子園の場合はミニタスクモードを使用
    const hasInputModes = section.input_modes && (section.input_modes.micro_tasks || section.input_modes.integrated);
    
    if (subsidyId === 'atotsugi' && hasInputModes) {
      return (
        <div key={section.id} className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-start space-x-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-yellow-600 text-sm font-medium text-white">
                {sectionIndex + 1}
              </span>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {section.title}
                </h3>
                {section.hint && (
                  <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 leading-relaxed">
                      <svg className="inline h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <strong>ヒント:</strong> {section.hint}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-100">
            {inputMode === 'micro_tasks' && section.input_modes.micro_tasks?.map((task, taskIndex) => 
              renderMicroTask(section, task, sectionIndex, taskIndex)
            )}
            
            {inputMode === 'integrated' && section.input_modes.integrated && (
              <div className="p-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <textarea
                    value={answers[section.id] || ''}
                    onChange={(e) => handleAnswerChange(section.id, e.target.value)}
                    rows="6"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder={getIntegratedPlaceholder(section.id)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // 従来形式のセクション
    return (
      <div key={section.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-start space-x-3 mb-4">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-sm font-medium text-white">
            {sectionIndex + 1}
          </span>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {section.title}
            </h3>
            {section.hint && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 leading-relaxed">
                  <svg className="inline h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <strong>ヒント:</strong> {section.hint}
                </p>
              </div>
            )}
          </div>
        </div>
        <textarea
          value={answers[section.id] || ''}
          onChange={(e) => handleAnswerChange(section.id, e.target.value)}
          rows="6"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
          placeholder="ここに回答を入力してください..."
        />
      </div>
    );
  };

  const handleInitialSubmit = (e) => {
    e.preventDefault();
    setShowOutputOptions(true);
  };

  const handleSaveData = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/save_application_data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          subsidy_id: subsidyId, 
          subsidy_name: subsidyName,
          answers, 
          progress: getProgressPercentage()
        })
      });
      if (!response.ok) {
        throw new Error('データの保存に失敗しました。');
      }
      
      // ファイルをダウンロード
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `申請準備書_${subsidyName}_${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      alert('Word文書として保存しました。印刷や編集が可能です。');
    } catch (err) {
      alert('保存に失敗しました: ' + err.message);
    }
  };

  const handleGenerateOutput = async (target) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`${config.API_BASE_URL}/generate_application_advice`, {
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
      
      // 結果エリアに自動スクロール
      setTimeout(() => {
        const outputElement = document.getElementById('output-section');
        if (outputElement) {
          outputElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 100);
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

  const getProgressPercentage = () => {
    if (subsidyId !== 'atotsugi') return 0;
    
    let totalTasks = 0;
    let completedTasks = 0;
    
    sections.forEach(section => {
      if (section.input_modes?.micro_tasks) {
        section.input_modes.micro_tasks.forEach(task => {
          // 条件付きタスクの表示状態をチェック
          let shouldCount = true;
          if (task.conditional_on && task.conditional_value) {
            const conditionValue = answers[section.id]?.[task.conditional_on];
            if (Array.isArray(conditionValue)) {
              shouldCount = conditionValue.includes(task.conditional_value);
            } else {
              shouldCount = conditionValue === task.conditional_value;
            }
          }
          
          if (shouldCount) {
            totalTasks++;
            const value = answers[section.id]?.[task.task_id];
            if (value !== undefined && value !== '' && value !== null) {
              if (Array.isArray(value)) {
                if (value.length > 0 && value.some(v => {
                  if (typeof v === 'object' && v !== null) {
                    return Object.values(v).some(subV => subV && subV.toString().trim() !== '');
                  }
                  return v && v.toString().trim() !== '';
                })) {
                  completedTasks++;
                }
              } else {
                completedTasks++;
              }
            }
          }
        });
      }
    });
    
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            <span className="ml-3 text-lg text-gray-600">補助金情報を読み込み中...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <div className="rounded-lg bg-red-50 border border-red-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">エラーが発生しました</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isAtotsugi = subsidyId === 'atotsugi';
  const headerColor = isAtotsugi ? 'yellow' : 'purple';

  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー部分 */}
      <div className={`bg-gradient-to-r from-${headerColor}-50 to-${headerColor}-100 border-b border-${headerColor}-200`}>
        <div className="mx-auto max-w-4xl px-4 py-12">
          <div className="text-center">
            {isAtotsugi && (
              <div className="mb-4">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  🏆 アトツギ甲子園申請支援システム
                </span>
              </div>
            )}
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              シンセイ準備: {subsidyName}
            </h1>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              {isAtotsugi ? (
                <>
                  42のミニタスクで簡単申請書作成！<br />
                  1タスク=1設問で迷わず入力できます。
                </>
              ) : (
                <>
                  補助金申請に必要な情報を入力してください。<br />
                  入力内容をもとに、最適なアウトプットを生成します。
                </>
              )}
            </p>
            
            {isAtotsugi && (
              <div className="mt-6">
                <div className="flex items-center justify-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">進捗:</span>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage()}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{getProgressPercentage()}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {!showOutputOptions ? (
          <div>
            {/* アトツギ甲子園の場合の入力モード切り替え */}
            {isAtotsugi && (
              <div className="mb-8">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">入力方式を選択</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setInputMode('micro_tasks')}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        inputMode === 'micro_tasks' 
                          ? 'border-yellow-500 bg-yellow-50' 
                          : 'border-gray-200 hover:border-yellow-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">🎯</span>
                        <h4 className="font-medium text-gray-900">ミニタスクモード</h4>
                      </div>
                      <p className="text-sm text-gray-600">
                        1タスク=1設問で簡単入力（推奨）
                      </p>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setInputMode('integrated')}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        inputMode === 'integrated' 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">⚡</span>
                        <h4 className="font-medium text-gray-900">統合モード</h4>
                      </div>
                      <p className="text-sm text-gray-600">
                        まとめて入力で時短
                      </p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleInitialSubmit} className="space-y-8">
              <div className="space-y-6">
                {sections.map((section, index) => renderSection(section, index))}
              </div>
              
              <div className="flex justify-center gap-4 pt-8">
                <button 
                  type="button"
                  onClick={handleSaveData}
                  className="inline-flex items-center rounded-xl bg-gray-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                >
                  <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
Word文書で保存
                </button>
                
                <button 
                  type="submit"
                  className={`inline-flex items-center rounded-xl bg-${headerColor}-600 px-8 py-4 text-lg font-semibold text-white shadow-sm hover:bg-${headerColor}-700 focus:outline-none focus:ring-2 focus:ring-${headerColor}-500 focus:ring-offset-2 transition-all duration-200`}
                >
                  <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  {isAtotsugi ? 'アドバイス・ヒントを生成' : '分析・生成する'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                アウトプットを選択してください
              </h2>
              <p className="text-gray-600 mb-8">
                入力いただいた内容をもとに、目的に応じたアウトプットを生成します。
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-3">
              <button 
                onClick={() => handleGenerateOutput('ai')} 
                disabled={isSubmitting}
                className="group relative rounded-xl border-2 border-gray-200 bg-white p-6 text-left hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <div className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white group-hover:bg-blue-700">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900 group-hover:text-blue-700">
                    AIに相談
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 group-hover:text-blue-600">
                    ChatGPTなどのAIツールで相談するためのプロンプトを生成します
                  </p>
                </div>
              </button>

              <button 
                onClick={() => handleGenerateOutput('human')} 
                disabled={isSubmitting}
                className="group relative rounded-xl border-2 border-gray-200 bg-white p-6 text-left hover:border-green-300 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <div className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-600 text-white group-hover:bg-green-700">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900 group-hover:text-green-700">
                    専門家に相談
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 group-hover:text-green-600">
                    補助金の専門家に相談するためのサマリーを生成します
                  </p>
                </div>
              </button>

              <button 
                onClick={() => handleGenerateOutput('self')} 
                disabled={isSubmitting}
                className="group relative rounded-xl border-2 border-gray-200 bg-white p-6 text-left hover:border-orange-300 hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <div className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-600 text-white group-hover:bg-orange-700">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900 group-hover:text-orange-700">
                    自分で考える
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 group-hover:text-orange-600">
                    自己評価するための問いかけリストを生成します
                  </p>
                </div>
              </button>
            </div>

            {isSubmitting && (
              <div className="text-center py-8">
                <div className="inline-flex items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
                  <span className="ml-3 text-lg text-gray-600">生成中...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">エラーが発生しました</h3>
                    <p className="mt-1 text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {output && (
              <div id="output-section" className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {outputTitle}
                  </h3>
                  <button 
                    onClick={copyToClipboard}
                    className="inline-flex items-center rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    コピー
                  </button>
                </div>
                <textarea 
                  readOnly 
                  value={output} 
                  rows="20" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SubsidyApplicationSupport;