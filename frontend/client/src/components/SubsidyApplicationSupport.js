import React, { useState, useEffect, useCallback } from 'react';
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
  const [validation, setValidation] = useState({});
  const [checklist, setChecklist] = useState([]);
  const [tasks, setTasks] = useState({});
  const [diagnosisData, setDiagnosisData] = useState(null);
  const [attachments, setAttachments] = useState([]);

  // Pre-fill form fields based on diagnosis data
  const prefillFromDiagnosis = useCallback((diagnosis) => {
    const prefilledAnswers = {};
    
    // Map diagnosis data to relevant form fields
    if (diagnosis.industry) {
      prefilledAnswers['industry'] = diagnosis.industry;
    }
    if (diagnosis.employees) {
      prefilledAnswers['employee_count'] = diagnosis.employees;
    }
    if (diagnosis.initiatives && Array.isArray(diagnosis.initiatives)) {
      prefilledAnswers['business_goals'] = diagnosis.initiatives.join('、');
    }
    if (diagnosis.investment_scale) {
      prefilledAnswers['investment_amount'] = diagnosis.investment_scale;
    }
    if (diagnosis.timeline) {
      prefilledAnswers['implementation_timeline'] = diagnosis.timeline;
    }
    
    // For Atotsugi specific data
    if (subsidyId === 'atotsugi' && diagnosis.is_successor) {
      if (diagnosis.is_successor === 'はい、事業承継予定者です') {
        prefilledAnswers['MINI_002_SUCCESSION_PLAN'] = 'あり';
      } else if (diagnosis.is_successor === 'はい、検討中です') {
        prefilledAnswers['MINI_002_SUCCESSION_PLAN'] = '検討中';
      } else if (diagnosis.is_successor === 'はい、情報収集段階です') {
        prefilledAnswers['MINI_002_SUCCESSION_PLAN'] = '検討中';
      } else {
        prefilledAnswers['MINI_002_SUCCESSION_PLAN'] = 'なし';
      }
    }
    
    setAnswers(prev => ({ ...prev, ...prefilledAnswers }));
  }, [subsidyId]);

  // Load diagnosis data from 30-second diagnosis
  const loadDiagnosisData = useCallback(() => {
    try {
      const diagnosisResults = localStorage.getItem('diagnosis_results');
      if (diagnosisResults) {
        const parsedResults = JSON.parse(diagnosisResults);
        const diagnosisObj = {};
        parsedResults.forEach(item => {
          diagnosisObj[item.key] = item.answer;
        });
        setDiagnosisData(diagnosisObj);
        
        // Pre-fill relevant fields based on diagnosis data
        prefillFromDiagnosis(diagnosisObj);
      }
    } catch (error) {
      console.error('診断データの読み込みに失敗:', error);
    }
  }, [prefillFromDiagnosis]);

  // Classify checklist items by type
  const classifyChecklistItems = () => {
    const needSupport = [
      '賃金引上げ計画の表明書',
      '賃金引上げ計画',
      '誓約書',
      '年率平均1.5%以上増加',
      '最低賃金+30円以上',
      '次世代法に基づく行動計画'
    ];
    
    const needDiscussion = [
      '生産性向上が期待',
      '革新的な製品・サービス開発',
      '生産プロセス改善'
    ];
    
    const autoCheck = [
      '中小企業基本法',
      '中小企業の定義',
      '日本国内',
      '補助事業実施場所'
    ];

    return checklist.map(item => {
      if (needSupport.some(keyword => item.includes(keyword))) {
        return { item, category: 'support', icon: '🆘' };
      } else if (needDiscussion.some(keyword => item.includes(keyword))) {
        return { item, category: 'discussion', icon: '💬' };
      } else if (autoCheck.some(keyword => item.includes(keyword))) {
        return { item, category: 'auto', icon: '✅' };
      } else {
        return { item, category: 'manual', icon: '□' };
      }
    });
  };

  // Download checklist as text file
  const downloadChecklist = () => {
    const today = new Date().toLocaleDateString('ja-JP');
    let content = `${subsidyName} - 申請準備完全ガイド\n`;
    content += `作成日: ${today}\n`;
    content += `============================================\n\n`;
    
    const classifiedItems = classifyChecklistItems();
    
    content += `【サポートが必要な項目】\n`;
    content += `※専門知識が必要な項目です\n`;
    content += `-------------------------------------------\n`;
    classifiedItems.filter(c => c.category === 'support').forEach(c => {
      content += `🆘 ${c.item}\n   → 社労士や専門家にご相談ください\n\n`;
    });
    
    content += `\n【相談・検討が必要な項目】\n`;
    content += `※事業内容の精査が必要です\n`;
    content += `-------------------------------------------\n`;
    classifiedItems.filter(c => c.category === 'discussion').forEach(c => {
      content += `💬 ${c.item}\n   → 事業計画を詳しく検討してください\n\n`;
    });
    
    content += `\n【手動確認項目】\n`;
    content += `※ご自身で確認してください\n`;
    content += `-------------------------------------------\n`;
    classifiedItems.filter(c => c.category === 'manual').forEach(c => {
      content += `□ ${c.item}\n\n`;
    });
    
    content += `\n【自動確認済み項目】\n`;
    content += `※システムで確認済みです\n`;
    content += `-------------------------------------------\n`;
    classifiedItems.filter(c => c.category === 'auto').forEach(c => {
      content += `✅ ${c.item}\n\n`;
    });
    
    if (attachments.length > 0) {
      content += `\n【必要書類一覧】\n`;
      content += `============================================\n`;
      attachments.forEach((doc, index) => {
        content += `${doc.severity === 'block' ? '●' : '○'} ${doc.desc}\n`;
        if (doc.severity === 'block') {
          content += `   ※必須書類\n`;
        }
        content += `\n`;
      });
    }
    
    if (tasks.milestones) {
      content += `\n【申請準備スケジュール】\n`;
      content += `============================================\n`;
      tasks.milestones.forEach(milestone => {
        const deadline = `申請${milestone.lead.replace('P-', '').replace('d', '')}日前`;
        content += `• ${milestone.name}\n`;
        content += `  期限: ${deadline}\n\n`;
      });
    }
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${subsidyName}_申請準備完全ガイド_${today.replace(/\//g, '')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download task schedule as CSV
  const downloadTaskSchedule = () => {
    const today = new Date().toLocaleDateString('ja-JP');
    let csvContent = `タスク名,期限,説明\n`;
    
    if (tasks.milestones) {
      tasks.milestones.forEach(milestone => {
        const deadline = `申請${milestone.lead.replace('P-', '').replace('d', '')}日前`;
        csvContent += `"${milestone.name}","${deadline}","${milestone.id}"\n`;
      });
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${subsidyName}_タスクスケジュール_${today.replace(/\//g, '')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
        setValidation(sectionsData.validation || {});
        setChecklist(sectionsData.checklist || []);
        setTasks(sectionsData.tasks || {});
        setAttachments(sectionsData.validation?.attachments || []);
        
        // Initialize checklist state

        // Load diagnosis data from localStorage if available
        loadDiagnosisData();

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
  }, [subsidyId, loadDiagnosisData]);


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
    
    // 条件付きレンダリングのチェック（開発モードでは全て表示）
    if (task.conditional_on && task.conditional_value) {
      const conditionValue = answers[section.id]?.[task.conditional_on];
      
      // 開発・デバッグ用：条件を満たさない場合でも薄く表示
      const shouldShow = (() => {
        if (Array.isArray(conditionValue)) {
          // multi_selectの場合
          return conditionValue && conditionValue.includes(task.conditional_value);
        } else {
          // selectの場合
          return conditionValue === task.conditional_value;
        }
      })();
      
      // 条件を満たさない場合は薄く表示（完全非表示にしない）
      if (!shouldShow) {
        return (
          <div key={task.task_id} className="border-b border-gray-100 last:border-b-0 p-4 opacity-50">
            <div className="flex items-start space-x-3">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-400">
                {taskIndex + 1}
              </span>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  {task.label} <span className="text-xs">(条件待ち: {task.conditional_on} = {task.conditional_value})</span>
                </label>
                <p className="text-xs text-gray-400">この項目は「{task.conditional_on}」で「{task.conditional_value}」を選択すると入力可能になります。</p>
              </div>
            </div>
          </div>
        );
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
                <option value="完全にわからない">完全にわからない</option>
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
                <label className="flex items-center border-t border-gray-200 pt-2 mt-2">
                  <input
                    type="checkbox"
                    checked={(Array.isArray(currentValue) ? currentValue : []).includes("わからない・要相談")}
                    onChange={(e) => {
                      const selectedValues = Array.isArray(currentValue) ? currentValue : [];
                      const questionOption = "わからない・要相談";
                      const newValues = e.target.checked 
                        ? [...selectedValues.filter(v => v !== "わからない・要相談"), questionOption]
                        : selectedValues.filter(v => v !== questionOption);
                      handleAnswerChange(section.id, newValues, task.task_id);
                    }}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-orange-700 font-medium">完全にわからない</span>
                </label>
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
                <button
                  type="button"
                  onClick={() => {
                    handleAnswerChange(section.id, ["わからない・要相談"], task.task_id);
                  }}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium border border-orange-200 hover:border-orange-300 px-3 py-1 rounded-md bg-orange-50 hover:bg-orange-100 transition-colors"
                >
                  💬 わからない・要相談
                </button>
              </div>
            )}
            
            {task.type === 'textarea' && (
              <div className="space-y-3">
                <textarea
                  value={currentValue}
                  onChange={(e) => handleAnswerChange(section.id, e.target.value, task.task_id)}
                  placeholder={task.placeholder || ''}
                  rows="4"
                  maxLength={task.max_length}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                />
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <h4 className="text-xs font-medium text-orange-800 mb-2">
                    📝 書ける範囲で入力したあと、お好みで下の選択肢を選択してください
                  </h4>
                  <div className="space-y-1">
                    {[
                      'この内容に自信がない・要補強',
                      '情報不足・調査が必要',
                      '書き方がわからない',
                      '完全にわからない'
                    ].map((option, idx) => {
                      const tagPattern = `[※${option}]`;
                      const isSelected = currentValue && currentValue.includes(tagPattern);
                      
                      return (
                        <label key={idx} className="flex items-start space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const currentText = currentValue || '';
                              let newText;
                              
                              if (e.target.checked) {
                                // タグを追加
                                newText = currentText.trim() + (currentText.trim() ? '\n' : '') + tagPattern;
                              } else {
                                // タグを削除
                                newText = currentText.replace(new RegExp(`\\n?\\[※${option.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]`, 'g'), '').trim();
                              }
                              
                              handleAnswerChange(section.id, newText, task.task_id);
                            }}
                            className="h-3 w-3 text-orange-600 focus:ring-orange-500 border-gray-300 rounded mt-0.5"
                          />
                          <span className="text-xs text-gray-700">{option}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
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
                    <div className="mt-3 pt-3 border-t border-yellow-200">
                      <button
                        type="button"
                        onClick={() => {
                          handleAnswerChange(section.id, [{ ym: '', note: 'わからない・要相談', owner: '' }], task.task_id);
                        }}
                        className="text-sm text-orange-600 hover:text-orange-700 font-medium border border-orange-200 hover:border-orange-300 px-3 py-1 rounded-md bg-orange-50 hover:bg-orange-100 transition-colors"
                      >
                        💬 わからない・要相談
                      </button>
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
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => {
                          const blankItem = {};
                          if (task.fields) {
                            task.fields.forEach(field => {
                              blankItem[field] = field === task.fields[0] ? 'わからない・要相談' : '';
                            });
                          }
                          handleAnswerChange(section.id, [blankItem], task.task_id);
                        }}
                        className="text-sm text-orange-600 hover:text-orange-700 font-medium border border-orange-200 hover:border-orange-300 px-3 py-1 rounded-md bg-orange-50 hover:bg-orange-100 transition-colors"
                      >
                        💬 わからない・要相談
                      </button>
                    </div>
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
        <div className="space-y-4">
          <textarea
            value={answers[section.id] || ''}
            onChange={(e) => handleAnswerChange(section.id, e.target.value)}
            rows="6"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
            placeholder="ここに回答を入力してください..."
          />
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-orange-800 mb-3">
              📝 書ける範囲で入力したあと、お好みで下の選択肢を選択してください
            </h4>
            <div className="space-y-2">
              {[
                'この内容に自信がない・要補強',
                '情報不足・調査が必要',
                '書き方がわからない',
                'もっと詳しく書きたいが方法がわからない',
                '競合との比較ができていない',
                '完全にわからない'
              ].map((option, idx) => {
                const currentValue = answers[section.id] || '';
                const tagPattern = `[※${option}]`;
                const isSelected = currentValue.includes(tagPattern);
                
                return (
                  <label key={idx} className="flex items-start space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        const currentText = answers[section.id] || '';
                        let newText;
                        
                        if (e.target.checked) {
                          // タグを追加
                          newText = currentText.trim() + (currentText.trim() ? '\n' : '') + tagPattern;
                        } else {
                          // タグを削除
                          newText = currentText.replace(new RegExp(`\\n?\\[※${option.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]`, 'g'), '').trim();
                        }
                        
                        handleAnswerChange(section.id, newText);
                      }}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded mt-0.5"
                    />
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleInitialSubmit = (e) => {
    e.preventDefault();
    
    // Run validation
    const validationErrors = validateAnswers();
    if (validationErrors.length > 0) {
      alert('入力内容に不備があります:\n\n' + validationErrors.join('\n'));
      return;
    }
    
    setShowOutputOptions(true);
  };

  const validateAnswers = () => {
    const errors = [];
    
    // Required section validation
    if (validation.required) {
      validation.required.forEach(sectionId => {
        const section = sections.find(s => s.id === sectionId);
        if (!section) return;
        
        if (inputMode === 'micro_tasks' && section.input_modes?.micro_tasks) {
          let hasAnswer = false;
          section.input_modes.micro_tasks.forEach(task => {
            if (task.required && answers[sectionId]?.[task.task_id]) {
              hasAnswer = true;
            }
          });
          if (!hasAnswer) {
            errors.push(`${section.title}セクションに必須項目が入力されていません`);
          }
        } else if (inputMode === 'integrated' && !answers[sectionId]) {
          errors.push(`${section.title}セクションが入力されていません`);
        }
      });
    }
    
    // Micro tasks required validation
    if (validation.micro_tasks_required && inputMode === 'micro_tasks') {
      validation.micro_tasks_required.forEach(taskId => {
        let found = false;
        sections.forEach(section => {
          if (section.input_modes?.micro_tasks) {
            section.input_modes.micro_tasks.forEach(task => {
              if (task.task_id === taskId && answers[section.id]?.[taskId]) {
                found = true;
              }
            });
          }
        });
        if (!found) {
          errors.push(`必須項目 "${taskId}" が入力されていません`);
        }
      });
    }
    
    // Age limit validation
    if (validation.age_limit && inputMode === 'micro_tasks') {
      const ageField = validation.age_limit.field;
      let age = null;
      sections.forEach(section => {
        if (answers[section.id]?.[ageField]) {
          age = parseInt(answers[section.id][ageField]);
        }
      });
      if (age && age > validation.age_limit.max) {
        errors.push(`年齢は${validation.age_limit.max}歳以下である必要があります`);
      }
    }
    
    return errors;
  };


  const handleSaveData = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/save_application_data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          subsidy_id: subsidyId, 
          subsidy_name: subsidyName,
          answers: answers, 
          progress: getProgressPercentage(),
          checklist: checklist,
          tasks: tasks,
          attachments: attachments,
          diagnosis_data: diagnosisData
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
        body: JSON.stringify({ subsidy_id: subsidyId, answers: answers, input_mode: inputMode, target: target })
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
      if (inputMode === 'micro_tasks' && section.input_modes?.micro_tasks) {
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
      } else if (inputMode === 'integrated' && section.input_modes?.integrated) {
        totalTasks++;
        if (answers[section.id] && answers[section.id].trim()) {
          completedTasks++;
        }
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
      <div className={`bg-gradient-to-br from-${headerColor}-50 via-white to-${headerColor}-100 border-b border-${headerColor}-200 relative overflow-hidden`}>
        {/* 背景装飾 */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-100/20 to-orange-100/20"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-yellow-200/10 to-transparent rounded-full transform translate-x-48 -translate-y-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-orange-200/10 to-transparent rounded-full transform -translate-x-32 translate-y-32"></div>
        
        <div className="mx-auto max-w-4xl px-4 py-8 relative z-10">
          <div className="text-center">
            {isAtotsugi && (
              <div className="mb-6">
                <span className="inline-flex items-center px-6 py-3 rounded-full text-sm font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg transform hover:scale-105 transition-all duration-300">
                  <span className="mr-2 text-lg">🏆</span>
                  アトツギ甲子園申請支援システム
                  <span className="ml-2 bg-white/20 px-2 py-1 rounded-full text-xs">β</span>
                </span>
              </div>
            )}
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl mb-2">
              <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                {subsidyName}
              </span>
            </h1>
            <div className="mt-4 p-3 bg-white/60 backdrop-blur-sm rounded-xl shadow-md border border-white/20 inline-block">
              <p className="text-base leading-relaxed text-gray-700 font-medium">
                {isAtotsugi ? (
                  <>
                    <span className="flex items-center justify-center mb-2">
                      <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold mr-2">42</span>
                      のミニタスクで簡単申請書作成！
                    </span>
                    <span className="text-sm text-gray-600">
                      1タスク=1設問で迷わず入力できます。
                    </span>
                  </>
                ) : (
                  <>
                    補助金申請に必要な情報を入力してください。<br />
                    入力内容をもとに、最適なアウトプットを生成します。
                  </>
                )}
              </p>
            </div>
            
          </div>
        </div>
      </div>

      {/* 固定進捗バー */}
      {isAtotsugi && (
        <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
          <div className="mx-auto max-w-4xl px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-semibold text-gray-800">進捗</span>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${getProgressPercentage()}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-gray-800 min-w-10">
                  {getProgressPercentage()}%
                </span>
              </div>
              <div className="text-xs text-gray-500">
                {getProgressPercentage() === 100 ? (
                  <span className="text-green-600 font-medium">🎉 完了</span>
                ) : (
                  <span>残り{42 - Math.round((getProgressPercentage() / 100) * 42)}タスク</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* 診断データからの事前入力通知 */}
        {diagnosisData && (
          <div className="mb-6 rounded-lg bg-blue-50 border border-blue-200 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-blue-800">
                  30秒診断の結果を反映
                </h3>
                <p className="mt-1 text-sm text-blue-700">
                  30秒診断で入力されたデータ（業界：{diagnosisData.industry}、従業員数：{diagnosisData.employees}など）を自動的に反映しました。必要に応じて修正してください。
                </p>
              </div>
            </div>
          </div>
        )}
        {!showOutputOptions ? (
          <div>
            {/* アトツギ甲子園の場合の入力モード切り替え */}
            {isAtotsugi && (
              <div className="mb-8">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">入力方式を選択</h3>
                  <div className="grid gap-4 md:grid-cols-3">
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

              {/* Checklist Section - Downloadable */}
              {(checklist.length > 0 || attachments.length > 0) && (
                <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <svg className="mr-2 h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      提出前チェックリスト
                    </h3>
                    <button
                      onClick={downloadChecklist}
                      className="inline-flex items-center px-3 py-2 border border-yellow-300 rounded-md shadow-sm text-sm font-medium text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                      <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      ダウンロード
                    </button>
                  </div>
                  
                  {checklist.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 mb-3">提出前確認事項（分類別）</h4>
                      <div className="space-y-2">
                        {classifyChecklistItems().slice(0, 4).map(({ item, category, icon }, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <span className={`mt-1 ${
                              category === 'support' ? 'text-red-600' : 
                              category === 'discussion' ? 'text-blue-600' : 
                              category === 'auto' ? 'text-green-600' : 'text-yellow-600'
                            }`}>
                              {icon}
                            </span>
                            <div className="flex-1">
                              <span className="text-sm text-gray-700">{item}</span>
                              <span className={`ml-2 text-xs ${
                                category === 'support' ? 'text-red-500' : 
                                category === 'discussion' ? 'text-blue-500' : 
                                category === 'auto' ? 'text-green-500' : 'text-gray-500'
                              }`}>
                                {category === 'support' ? '(要サポート)' : 
                                 category === 'discussion' ? '(要検討)' : 
                                 category === 'auto' ? '(確認済み)' : '(要確認)'}
                              </span>
                            </div>
                          </div>
                        ))}
                        {checklist.length > 4 && (
                          <p className="text-xs text-gray-500 ml-6">他 {checklist.length - 4} 項目</p>
                        )}
                      </div>
                    </div>
                  )}

                  {attachments.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">必要書類一覧</h4>
                      <div className="space-y-2">
                        {attachments.map((doc, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <span className={`mt-1 ${doc.severity === 'block' ? 'text-red-600' : 'text-yellow-600'}`}>
                              {doc.severity === 'block' ? '●' : '○'}
                            </span>
                            <div className="flex-1">
                              <span className="text-sm text-gray-700">{doc.desc}</span>
                              {doc.severity === 'block' && (
                                <span className="ml-2 text-xs text-red-600 font-medium">必須</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 p-3 bg-yellow-100 rounded-md">
                    <p className="text-sm text-yellow-800">
                      📋 完全版ガイドをダウンロードすると、分類済みチェックリスト・必要書類一覧・スケジュールがまとめて入手できます
                    </p>
                  </div>
                </div>
              )}

              {/* Tasks/Timeline Section - Downloadable */}
              {tasks.milestones && tasks.milestones.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <svg className="mr-2 h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      申請準備タスク・スケジュール
                    </h3>
                    <button
                      onClick={downloadTaskSchedule}
                      className="inline-flex items-center px-3 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-800 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      CSV出力
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {tasks.milestones.slice(0, 4).map((milestone, index) => (
                      <div key={milestone.id} className="flex items-start space-x-3 p-3 bg-white rounded-md border border-blue-100">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-800">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{milestone.name}</h4>
                          <p className="text-xs text-gray-600 mt-1">
                            目標: 申請{milestone.lead.replace('P-', '').replace('d', '')}日前までに完了
                          </p>
                        </div>
                      </div>
                    ))}
                    {tasks.milestones.length > 4 && (
                      <p className="text-xs text-gray-500 text-center">他 {tasks.milestones.length - 4} タスク</p>
                    )}
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-100 rounded-md">
                    <p className="text-sm text-blue-800">
                      📅 スケジュールをCSVでダウンロードして、カレンダーアプリやプロジェクト管理ツールでご活用ください
                    </p>
                  </div>
                </div>
              )}
              
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