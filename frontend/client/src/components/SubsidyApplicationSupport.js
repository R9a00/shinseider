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
  const [diagnosisApplied, setDiagnosisApplied] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [subsidyInfo, setSubsidyInfo] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState(''); // 'saving', 'saved', 'error'
  const [phaseNameInputs, setPhaseNameInputs] = useState({}); // 一時的なフェーズ名入力状態


  // 申請書作成データに基づくサポートガイダンス機能
  const getSupportGuidance = (item) => {
    // 申請書作成で入力されたデータを活用
    const getContextualGuidance = (baseGuidance) => {
      let guidance = baseGuidance;
      
      // 業界情報があれば具体的な例を追加
      if (diagnosisData?.industry) {
        const industryExamples = {
          '製造業': '製造ライン効率化、品質管理システム導入',
          'IT・情報通信業': 'システム開発効率化、セキュリティ強化',
          '建設業': '施工管理システム、安全管理設備',
          '小売業': 'POS システム、在庫管理システム',
          'サービス業': '顧客管理システム、業務効率化ツール'
        };
        
        if (industryExamples[diagnosisData.industry]) {
          guidance += `\n   🏭 ${diagnosisData.industry}での例: ${industryExamples[diagnosisData.industry]}`;
        }
      }
      
      // 投資規模に応じたアドバイス
      if (diagnosisData?.investment_scale) {
        const scaleAdvice = {
          '100万円未満': '小規模投資での効果的な活用方法を検討',
          '100万円～500万円': '中規模投資での段階的導入を計画',
          '500万円～1000万円': '本格的なシステム導入の準備が重要',
          '1000万円以上': '大規模投資のリスク管理と効果測定を重視'
        };
        
        if (scaleAdvice[diagnosisData.investment_scale]) {
          guidance += `\n   💰 投資規模(${diagnosisData.investment_scale}): ${scaleAdvice[diagnosisData.investment_scale]}`;
        }
      }
      
      return guidance;
    };
    
    const baseGuidance = {
      '賃金引上げ計画の誓約書を提出できる': `💡 今すぐできること：\n▸ 現在の平均給与を給与台帳から調査\n▸ 3年間の給与増加計画(年率1.5%以上)を策定\n▸ 最低賃金+30円以上の設定`,
      
      '従業員21名以上の場合、次世代法に基づく行動計画を公表済み': `💡 今すぐできること：\n▸ 男女別雇用状況の整理\n▸ 女性活躍・育児支援目標の設定\n▸ 厚労省サイトでの公表手続き`,
      
      '事業完了後3年で給与支給総額を年率平均1.5%以上増加させる計画がある': `💡 今すぐできること：\n▸ 現在の総人件費の正確な算出\n▸ 生産性向上計画との連動\n▸ 年次実施スケジュールの作成`,
      
      '事業完了後3年で事業場内最低賃金を地域別最低賃金+30円以上とする計画がある': `💡 今すぐできること：\n▸ 地域別最低賃金の確認(厚労省サイト)\n▸ 時給ベース改善計画の策定\n▸ 全従業員の賃金体系見直し`
    };
    
    const guidance = baseGuidance[item];
    
    if (guidance) {
      return getContextualGuidance(guidance);
    }
    
    return `💡 申請要件を確認中...`;
  };

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
    
    // Update answers with prefilled data and mark as applied if any data was set
    if (Object.keys(prefilledAnswers).length > 0) {
      setAnswers(prev => ({ ...prev, ...prefilledAnswers }));
      setDiagnosisApplied(true);
    }
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
      // 具体的なサポート内容を提供
      const supportGuidance = getSupportGuidance(c.item);
      content += `🆘 ${c.item}\n${supportGuidance}\n\n`;
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
        const description = milestone.description || milestone.name;
        csvContent += `"${milestone.name}","${deadline}","${description}"\n`;
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

  // バリデーション関数
  const getValidationErrors = () => {
    const errors = [];
    const requiredTasks = validation.micro_tasks_required || [];
    
    sections.forEach(section => {
      if (inputMode === 'micro_tasks' && section.input_modes?.micro_tasks) {
        section.input_modes.micro_tasks.forEach(task => {
          if (requiredTasks.includes(task.task_id)) {
            const value = answers[section.id]?.[task.task_id];
            
            // 条件付きタスクの表示状態をチェック
            let shouldValidate = true;
            if (task.conditional_on && task.conditional_value) {
              const conditionValue = answers[section.id]?.[task.conditional_on];
              if (Array.isArray(conditionValue)) {
                shouldValidate = conditionValue.includes(task.conditional_value);
              } else {
                shouldValidate = conditionValue === task.conditional_value;
              }
            }
            
            if (shouldValidate && (!value || value === '' || value === null || 
                (Array.isArray(value) && value.length === 0))) {
              errors.push({
                sectionId: section.id,
                taskId: task.task_id,
                label: task.label || task.task_id,
                sectionTitle: section.title
              });
            }
          }
        });
      }
    });
    
    return errors;
  };

  // エラー項目にスクロール
  const scrollToError = (sectionId, taskId) => {
    const element = document.getElementById(`${sectionId}-${taskId}`);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'nearest'
      });
      // フォーカスを当てる
      const input = element.querySelector('input, textarea, select');
      if (input) {
        setTimeout(() => input.focus(), 500);
      }
    }
  };

  // 自動保存機能
  const saveDataToLocalStorage = useCallback(() => {
    try {
      setAutoSaveStatus('saving');
      const saveData = {
        answers,
        inputMode,
        timestamp: new Date().toISOString(),
        subsidyId
      };
      localStorage.setItem(`shinseider_draft_${subsidyId}`, JSON.stringify(saveData));
      setLastSaved(new Date());
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus(''), 2000);
    } catch (error) {
      console.error('自動保存エラー:', error);
      setAutoSaveStatus('error');
      setTimeout(() => setAutoSaveStatus(''), 3000);
    }
  }, [answers, inputMode, subsidyId]);

  // データの復元
  const loadDataFromLocalStorage = useCallback(() => {
    try {
      const savedData = localStorage.getItem(`shinseider_draft_${subsidyId}`);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setAnswers(parsed.answers || {});
        setInputMode(parsed.inputMode || 'micro_tasks');
        setLastSaved(new Date(parsed.timestamp));
        return true;
      }
    } catch (error) {
      console.error('データ復元エラー:', error);
    }
    return false;
  }, [subsidyId]);

  // 保存データの削除
  const clearSavedData = () => {
    if (window.confirm('保存されたデータを削除しますか？この操作は取り消せません。')) {
      localStorage.removeItem(`shinseider_draft_${subsidyId}`);
      setLastSaved(null);
      setAnswers({});
      alert('保存されたデータを削除しました');
    }
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
        
        // Load saved draft data
        loadDataFromLocalStorage();

        const metadataResponse = await fetch(`${config.API_BASE_URL}/subsidies/${subsidyId}/metadata`);
        if (metadataResponse.ok) {
          const metadataData = await metadataResponse.json();
          setSubsidyName(metadataData.name);
          setSubsidyInfo(metadataData); // 募集期間情報を含む全体のメタデータを保存
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

  // 自動保存のuseEffect
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      const timeoutId = setTimeout(() => {
        saveDataToLocalStorage();
      }, 3000); // 3秒後に自動保存
      return () => clearTimeout(timeoutId);
    }
  }, [answers, saveDataToLocalStorage]);

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
    let currentValue = answers[section.id]?.[task.task_id];
    if (!currentValue) {
      if (task.type === 'milestone_input') {
        currentValue = [];
      } else if (task.type === 'hierarchical_milestone') {
        // デフォルトで1つのフェーズを表示
        currentValue = {
          '企画・設計': [{ date: '', content: '', notes: '' }]
        };
      } else {
        currentValue = '';
      }
    } else if (task.type === 'hierarchical_milestone' && typeof currentValue === 'object') {
      // 既存のhierarchical_milestoneデータの正規化（旧フィールド名を新フィールド名に統一）
      const normalizedValue = {};
      Object.entries(currentValue).forEach(([phaseKey, phaseItems]) => {
        if (Array.isArray(phaseItems)) {
          normalizedValue[phaseKey] = phaseItems.map(item => ({
            date: item.date || '',
            content: item.content || item.item || '',
            notes: item.notes || item.note || ''
          }));
        }
      });
      currentValue = normalizedValue;
    }
    
    // 条件付きレンダリングのチェック
    if (task.conditional_on && task.conditional_value) {
      const conditionValue = answers[section.id]?.[task.conditional_on];
      
      const shouldShow = (() => {
        if (Array.isArray(conditionValue)) {
          // multi_selectの場合
          return conditionValue && conditionValue.includes(task.conditional_value);
        } else {
          // selectの場合
          return conditionValue === task.conditional_value;
        }
      })();
      
      // 条件を満たさない場合は非表示
      if (!shouldShow) {
        return null;
      }
    }
    
    const isConditional = task.conditional_on && task.conditional_value;
    
    const isFirstConditionalItem = task.task_id === "ONE_PRICE";
    
    // 最初の条件付き項目に上マージンを追加
    const marginClass = isFirstConditionalItem ? "mt-6 pt-4" : "";
    const numberBgClass = isConditional ? "bg-orange-100 text-orange-800" : "bg-blue-100 text-blue-800";
    
    
    // REV_CHANNELの後にスペーサーを追加
    if (task.task_id === "REV_CHANNEL") {
      // 条件付き項目が表示されているかチェック
      const hasVisibleConditionalItems = section.input_modes.micro_tasks?.some(t => {
        if (t.conditional_on && t.conditional_value) {
          const conditionValue = answers[section.id]?.[t.conditional_on];
          if (Array.isArray(conditionValue)) {
            return conditionValue && conditionValue.includes(t.conditional_value);
          } else {
            return conditionValue === t.conditional_value;
          }
        }
        return false;
      });

      return (
        <React.Fragment key={task.task_id}>
          <div id={`${section.id}-${task.task_id}`} className={`border-b border-gray-100 last:border-b-0 p-4 ${marginClass}`}>
        <div className="flex items-start space-x-3">
          <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${numberBgClass}`}>
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

            {task.type === 'select_with_custom' && (
              <div className="space-y-3">
                <select
                  value={currentValue && task.options?.includes(currentValue) ? currentValue : 'その他'}
                  onChange={(e) => {
                    if (e.target.value !== 'その他') {
                      handleAnswerChange(section.id, e.target.value, task.task_id);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">選択してください</option>
                  {task.options?.filter(option => option !== 'その他').map((option, idx) => (
                    <option key={idx} value={option}>{option}</option>
                  ))}
                  <option value="その他">その他（自由入力）</option>
                </select>
                
                {(!currentValue || !task.options?.includes(currentValue) || currentValue === 'その他') && (
                  <input
                    type="text"
                    value={currentValue && !task.options?.includes(currentValue) ? currentValue : ''}
                    onChange={(e) => handleAnswerChange(section.id, e.target.value, task.task_id)}
                    placeholder="具体的にお書きください"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                )}
              </div>
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
                  <span className="ml-2 text-sm text-orange-700 font-medium">わからない・要相談</span>
                </label>
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
                      '調査が必要'
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
            
            {task.type === 'milestone_input' && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2 mb-3">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-medium text-blue-900 mb-1">マイルストーン入力</h4>
                      <p className="text-xs text-blue-700">
                        {task.help_text || "事業を進める上での重要な節目を時系列で入力してください"}
                      </p>
                    </div>
                  </div>
                  
                  {task.example && (
                    <div className="mt-3 p-3 bg-white border border-blue-200 rounded">
                      <p className="text-xs font-medium text-blue-800 mb-2">入力例：</p>
                      {task.example.map((ex, idx) => (
                        <div key={idx} className="text-xs text-blue-600 mb-1">
                          {ex.date} → {ex.content} （担当：{ex.owner}）
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {(() => {
                  const arrayValues = Array.isArray(currentValue) ? currentValue : [];
                  const displayCount = Math.max(2, arrayValues.length);
                  
                  return Array.from({ length: displayCount }, (_, idx) => {
                    const milestone = arrayValues[idx] || {};
                    
                    return (
                      <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="text-sm font-medium text-gray-700">マイルストーン {idx + 1}</h5>
                          {idx >= 2 && (arrayValues[idx] && (arrayValues[idx].date || arrayValues[idx].content || arrayValues[idx].owner)) && (
                            <button
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
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">時期</label>
                            <input
                              type="month"
                              value={milestone.date || ''}
                              onChange={(e) => {
                                const newArray = [...arrayValues];
                                newArray[idx] = { ...milestone, date: e.target.value };
                                handleAnswerChange(section.id, newArray.filter(item => item.date || item.content || item.owner), task.task_id);
                              }}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="2025-11"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">内容</label>
                            <input
                              type="text"
                              value={milestone.content || ''}
                              onChange={(e) => {
                                const newArray = [...arrayValues];
                                newArray[idx] = { ...milestone, content: e.target.value };
                                handleAnswerChange(section.id, newArray.filter(item => item.date || item.content || item.owner), task.task_id);
                              }}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="試作完了"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">責任者</label>
                            <input
                              type="text"
                              value={milestone.owner || ''}
                              onChange={(e) => {
                                const newArray = [...arrayValues];
                                newArray[idx] = { ...milestone, owner: e.target.value };
                                handleAnswerChange(section.id, newArray.filter(item => item.date || item.content || item.owner), task.task_id);
                              }}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="田中"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
                
                {(() => {
                  const arrayValues = Array.isArray(currentValue) ? currentValue : [];
                  return arrayValues.length < (task.max_items || 5) && (
                    <button
                      onClick={() => {
                        const newArray = [...arrayValues, { date: '', content: '', owner: '' }];
                        handleAnswerChange(section.id, newArray, task.task_id);
                      }}
                      className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors duration-200"
                    >
                      + マイルストーンを追加
                    </button>
                  );
                })()}
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
          {/* 条件付き項目が表示されていない場合のみスペーサーを表示 */}
          {!hasVisibleConditionalItems && (
            <div key={`${task.task_id}-spacer`} className="border-b-2 border-dashed border-orange-200 mx-4 my-3">
              <div className="text-center py-2">
                <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                  選択内容に応じて詳細項目が表示されます
                </span>
              </div>
            </div>
          )}
        </React.Fragment>
      );
    }

    return (
      <div key={task.task_id} id={`${section.id}-${task.task_id}`} className={`border-b border-gray-100 last:border-b-0 p-4 ${marginClass}`}>
        <div className="flex items-start space-x-3">
          <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${numberBgClass}`}>
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

            {task.type === 'select_with_custom' && (
              <div className="space-y-3">
                <select
                  value={currentValue && task.options?.includes(currentValue) ? currentValue : 'その他'}
                  onChange={(e) => {
                    if (e.target.value !== 'その他') {
                      handleAnswerChange(section.id, e.target.value, task.task_id);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">選択してください</option>
                  {task.options?.filter(option => option !== 'その他').map((option, idx) => (
                    <option key={idx} value={option}>{option}</option>
                  ))}
                  <option value="その他">その他（自由入力）</option>
                </select>
                
                {(!currentValue || !task.options?.includes(currentValue) || currentValue === 'その他') && (
                  <input
                    type="text"
                    value={currentValue && !task.options?.includes(currentValue) ? currentValue : ''}
                    onChange={(e) => handleAnswerChange(section.id, e.target.value, task.task_id)}
                    placeholder="具体的にお書きください"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                )}
              </div>
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
                  <span className="ml-2 text-sm text-orange-700 font-medium">わからない・要相談</span>
                </label>
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
                    🟠 お好みで選択（該当するものがあればチェック）
                  </h4>
                  <div className="space-y-1">
                    {[
                      "まだ考えがまとまっていない",
                      "詳細は後で決める予定",
                      "専門家と相談して決めたい",
                      "情報収集が必要",
                      "時間をかけて検討したい"
                    ].map((option, idx) => (
                      <label key={idx} className="flex items-center text-xs">
                        <input
                          type="checkbox"
                          checked={currentValue.includes(`[※${option}]`)}
                          onChange={(e) => {
                            const tag = `[※${option}]`;
                            let newValue = currentValue;
                            if (e.target.checked) {
                              // タグを追加（既存テキストがある場合は改行して追加）
                              newValue = currentValue ? `${currentValue}\n${tag}` : tag;
                            } else {
                              // タグを削除
                              newValue = currentValue.replace(new RegExp(`\\n?\\[※${option.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]`, 'g'), '');
                            }
                            handleAnswerChange(section.id, newValue, task.task_id);
                          }}
                          className="h-3 w-3 text-orange-600 focus:ring-orange-500 border-gray-300 rounded mr-2"
                        />
                        <span className="text-orange-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* その他のタスク専用タイプ */}
            {task.type === 'milestones' && (
              <div className="space-y-3">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <h4 className="text-xs font-medium text-yellow-800 mb-2">
                    📅 事業マイルストーン設定
                  </h4>
                  <p className="text-xs text-yellow-700">
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
              </div>
            )}
            
            {task.type === 'structured_array' && (
              <div className="space-y-2">
                {Array.from({ length: task.max_items || 3 }, (_, idx) => {
                  const arrayValues = Array.isArray(currentValue) ? currentValue : [];
                  const itemValue = arrayValues[idx] || {};
                  
                  return (
                    <div key={idx} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                      <div className="grid grid-cols-2 gap-3">
                        {task.fields?.map((field) => (
                          <input
                            key={field}
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
                            placeholder={`${field}を入力`}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
                
                <button
                  type="button"
                  onClick={() => {
                    const blankItem = {};
                    if (task.fields) {
                      task.fields.forEach(field => {
                        blankItem[field] = "わからない・要相談";
                      });
                    }
                    handleAnswerChange(section.id, [blankItem], task.task_id);
                  }}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium border border-orange-200 hover:border-orange-300 px-3 py-1 rounded-md bg-orange-50 hover:bg-orange-100 transition-colors"
                >
                  💬 わからない・要相談
                </button>
              </div>
            )}

            {task.type === 'hierarchical_milestone' && (
              <div className="space-y-4">
                {/* 目標表示 */}
                {(() => {
                  const catchPhrase = answers['new_business_idea']?.['MINI_023_CATCH'];
                  const futureVision = answers['personal_story']?.['STORY_FUTURE_VISION'];
                  
                  if (catchPhrase || futureVision) {
                    return (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-lg">🎯</span>
                          <h4 className="font-semibold text-yellow-800">事業目標</h4>
                        </div>
                        {catchPhrase && (
                          <p className="text-sm text-yellow-700 font-medium">
                            {catchPhrase}
                          </p>
                        )}
                        {futureVision && (
                          <p className="text-xs text-yellow-600 mt-1">
                            → {futureVision}
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* よく使う大項目追加ボタン */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-2">よく使う大項目を追加：</p>
                  <div className="flex flex-wrap gap-2">
                    {['資金調達', '人材確保', '販路開拓', '品質管理', '技術開発', 'システム構築'].map(phaseName => (
                      <button
                        key={phaseName}
                        type="button"
                        onClick={() => {
                          const newValue = { ...currentValue };
                          
                          if (!newValue[phaseName]) {
                            // 新しいフェーズの場合、追加
                            newValue[phaseName] = [{ date: '', content: '', notes: '' }];
                            handleAnswerChange(section.id, newValue, task.task_id);
                          } else {
                            // 既存フェーズの場合、先頭に新しい項目を追加
                            newValue[phaseName] = [{ date: '', content: '', notes: '' }, ...newValue[phaseName]];
                            handleAnswerChange(section.id, newValue, task.task_id);
                          }
                        }}
                        className="px-3 py-1 text-xs rounded-full border bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all"
                      >
                        + {phaseName}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 簡潔な説明 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    💡 <strong>例:</strong> 企画フェーズ → 2025-11 市場調査完了 (競合3社分析) | 開発フェーズ → 2026-01 試作完了 (3パターン)
                  </p>
                </div>

                {/* 実際の入力フォーム */}
                <div className="space-y-4">
                  
                  {/* 大項目のリスト */}
                  {Object.entries(currentValue).length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(currentValue).map(([phaseKey, phaseItems], phaseIndex) => (
                        <div key={phaseKey} className="border border-gray-200 rounded-lg bg-white shadow-sm">
                          {/* 大項目ヘッダー */}
                          <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center space-x-3">
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-800">
                                {phaseIndex + 1}
                              </span>
                              <input
                                type="text"
                                value={phaseNameInputs[phaseKey] !== undefined ? phaseNameInputs[phaseKey] : (phaseKey.startsWith('phase_') ? '' : phaseKey)}
                                onChange={(e) => {
                                  // 一時的な入力状態を更新
                                  setPhaseNameInputs(prev => ({
                                    ...prev,
                                    [phaseKey]: e.target.value
                                  }));
                                }}
                                onBlur={(e) => {
                                  // フォーカスを失った時のみ実際のデータを更新
                                  let newName = e.target.value;
                                  
                                  if (newName !== phaseKey) {
                                    // フェーズ名を変更する場合
                                    if (currentValue[newName]) {
                                      // 重複する名前の場合（空文字含む）
                                      if (newName === '') {
                                        // 空文字が重複する場合、ユニークなキーを生成
                                        let counter = 1;
                                        let uniqueKey = `phase_${counter}`;
                                        while (currentValue[uniqueKey]) {
                                          counter++;
                                          uniqueKey = `phase_${counter}`;
                                        }
                                        newName = uniqueKey;
                                      } else {
                                        // 通常の重複の場合は変更しない
                                        console.warn(`フェーズ名「${newName}」は既に存在します`);
                                        // 早期リターン
                                        setPhaseNameInputs(prev => {
                                          const newInputs = { ...prev };
                                          delete newInputs[phaseKey];
                                          return newInputs;
                                        });
                                        return;
                                      }
                                    }
                                    
                                    // 順序を保持して名前を変更
                                    const newValue = {};
                                    Object.keys(currentValue).forEach(key => {
                                      if (key === phaseKey) {
                                        newValue[newName] = currentValue[key];
                                      } else {
                                        newValue[key] = currentValue[key];
                                      }
                                    });
                                    handleAnswerChange(section.id, newValue, task.task_id);
                                  }
                                  
                                  // 常に一時的な入力状態をクリア
                                  setPhaseNameInputs(prev => {
                                    const newInputs = { ...prev };
                                    delete newInputs[phaseKey];
                                    return newInputs;
                                  });
                                }}
                                placeholder="フェーズ名（例：企画・設計）"
                                className="text-base font-medium bg-white border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <button
                              onClick={() => {
                                const newValue = { ...currentValue };
                                delete newValue[phaseKey];
                                handleAnswerChange(section.id, newValue, task.task_id);
                              }}
                              className="text-red-500 hover:text-red-700 p-2"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>

                          {/* サブ項目のリスト */}
                          <div className="p-3">
                            <div className="space-y-2">
                              {Array.isArray(phaseItems) ? phaseItems.map((item, itemIndex) => (
                                <div key={itemIndex} className="grid grid-cols-12 gap-2 items-center p-2 bg-gray-50 rounded">
                                  <div className="col-span-2">
                                    <input
                                      type="month"
                                      value={item.date || ''}
                                      onChange={(e) => {
                                        const newValue = { ...currentValue };
                                        const currentItems = Array.isArray(newValue[phaseKey]) ? newValue[phaseKey] : [];
                                        const newItems = [...currentItems];
                                        newItems[itemIndex] = { ...item, date: e.target.value };
                                        newValue[phaseKey] = newItems;
                                        handleAnswerChange(section.id, newValue, task.task_id);
                                      }}
                                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                  </div>
                                  <div className="col-span-5">
                                    <input
                                      type="text"
                                      value={item.content || ''}
                                      onChange={(e) => {
                                        const newValue = { ...currentValue };
                                        const currentItems = Array.isArray(newValue[phaseKey]) ? newValue[phaseKey] : [];
                                        const newItems = [...currentItems];
                                        newItems[itemIndex] = { ...item, content: e.target.value };
                                        newValue[phaseKey] = newItems;
                                        handleAnswerChange(section.id, newValue, task.task_id);
                                      }}
                                      placeholder="達成内容"
                                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                  </div>
                                  <div className="col-span-4">
                                    <input
                                      type="text"
                                      value={item.notes || ''}
                                      onChange={(e) => {
                                        const newValue = { ...currentValue };
                                        const currentItems = Array.isArray(newValue[phaseKey]) ? newValue[phaseKey] : [];
                                        const newItems = [...currentItems];
                                        newItems[itemIndex] = { ...item, notes: e.target.value };
                                        newValue[phaseKey] = newItems;
                                        handleAnswerChange(section.id, newValue, task.task_id);
                                      }}
                                      placeholder="備考"
                                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                  </div>
                                  <div className="col-span-1">
                                    <button
                                      onClick={() => {
                                        const newValue = { ...currentValue };
                                        const currentItems = Array.isArray(newValue[phaseKey]) ? newValue[phaseKey] : [];
                                        const newItems = [...currentItems];
                                        newItems.splice(itemIndex, 1);
                                        newValue[phaseKey] = newItems;
                                        handleAnswerChange(section.id, newValue, task.task_id);
                                      }}
                                      className="text-red-500 hover:text-red-700 p-1"
                                    >
                                      ×
                                    </button>
                                  </div>
                                </div>
                              )) : null}
                              
                              {/* サブ項目追加ボタン */}
                              <button
                                type="button"
                                onClick={() => {
                                  const newValue = { ...currentValue };
                                  if (!Array.isArray(newValue[phaseKey])) {
                                    newValue[phaseKey] = [];
                                  }
                                  newValue[phaseKey].push({ date: '', item: '', note: '' });
                                  handleAnswerChange(section.id, newValue, task.task_id);
                                }}
                                className="w-full py-2 border border-dashed border-gray-300 rounded text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
                              >
                                + 項目を追加
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                      <p className="text-sm">まずは大項目（フェーズ）を追加してください</p>
                    </div>
                  )}

                  {/* 大項目追加ボタン */}
                  <button
                    type="button"
                    onClick={() => {
                      const timestamp = Date.now();
                      const newPhase = `phase_${timestamp}`;
                      const newValue = { ...currentValue };
                      newValue[newPhase] = [{ date: '', item: '', note: '' }];
                      handleAnswerChange(section.id, newValue, task.task_id);
                    }}
                    className="w-full py-3 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-colors font-medium"
                  >
                    📋 大項目を追加
                  </button>
                </div>
              </div>
            )}
            
            {/* 文字数表示 */}
            {task.max_length && task.type !== 'milestones' && (
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
                '調査が必要'
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
    
    // Run validation - 警告表示のみ、生成は継続
    const validationErrors = validateAnswers();
    const validationWarnings = getValidationErrors();
    
    if (validationErrors.length > 0 || validationWarnings.length > 0) {
      const proceed = window.confirm(
        `未入力の項目がありますが、入力済みの内容でアウトプットを生成しますか？\n\n` +
        `未入力項目: ${validationWarnings.length}件\n` +
        `生成後に追加入力して再生成することも可能です。\n\n` +
        `「OK」で生成を続行、「キャンセル」で入力を続ける`
      );
      if (!proceed) {
        return;
      }
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
    
    // Micro tasks required validation - 警告のみ、生成は継続
    const missingRequired = [];
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
          missingRequired.push(taskId);
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
        // 年齢制限は警告のみ（生成は継続）
        console.warn(`年齢制限: ${validation.age_limit.max}歳以下が推奨されています`);
      }
    }
    
    return errors;
  };


  // 統合版TXTファイルダウンロード機能
  const downloadCompletePackage = async () => {
    const today = new Date().toLocaleDateString('ja-JP');
    let content = `${subsidyName} - 申請準備完全パッケージ\n`;
    content += `作成日: ${today}\n`;
    content += `=${'='.repeat(50)}\n\n`;
    
    // 1. 申請書データ
    content += `【1. 申請書入力データ】\n`;
    content += `${'='.repeat(30)}\n`;
    sections.forEach(section => {
      content += `\n■ ${section.title}\n`;
      if (inputMode === 'micro_tasks' && section.input_modes?.micro_tasks) {
        section.input_modes.micro_tasks.forEach(task => {
          const value = answers[section.id]?.[task.task_id];
          if (value !== undefined && value !== '' && value !== null) {
            // hierarchical_milestone タイプの場合の特別処理
            if (task.type === 'hierarchical_milestone' && typeof value === 'object') {
              content += `▸ ${task.task}:\n`;
              Object.entries(value).forEach(([phaseKey, phaseItems]) => {
                if (phaseKey.startsWith('phase_')) return; // 空のフェーズはスキップ
                content += `  【${phaseKey}】\n`;
                if (Array.isArray(phaseItems)) {
                  phaseItems.forEach((item, idx) => {
                    // 新旧フィールド名対応
                    const itemContent = item.content || item.item || '';
                    const itemNotes = item.notes || item.note || '';
                    if (item.date || itemContent || itemNotes) {
                      content += `    ${idx + 1}. ${item.date || '未定'} - ${itemContent || '未記入'}`;
                      if (itemNotes) content += ` (${itemNotes})`;
                      content += `\n`;
                    }
                  });
                }
              });
            } else {
              // 通常のタスクの処理
              const displayValue = Array.isArray(value) ? value.join('、') : value;
              content += `▸ ${task.task}: ${displayValue}\n`;
            }
          }
        });
      } else {
        const value = answers[section.id];
        if (value !== undefined && value !== '' && value !== null) {
          // 統合モードでのhierarchical_milestoneの処理
          if (typeof value === 'object' && !Array.isArray(value)) {
            Object.entries(value).forEach(([phaseKey, phaseItems]) => {
              if (phaseKey.startsWith('phase_')) return;
              content += `【${phaseKey}】\n`;
              if (Array.isArray(phaseItems)) {
                phaseItems.forEach((item, idx) => {
                  // 新旧フィールド名対応
                  const itemContent = item.content || item.item || '';
                  const itemNotes = item.notes || item.note || '';
                  if (item.date || itemContent || itemNotes) {
                    content += `  ${idx + 1}. ${item.date || '未定'} - ${itemContent || '未記入'}`;
                    if (itemNotes) content += ` (${itemNotes})`;
                    content += `\n`;
                  }
                });
              }
            });
          } else {
            content += `${value}\n`;
          }
        }
      }
    });
    
    // 2. 提出前チェックリスト
    if (checklist.length > 0) {
      content += `\n\n【2. 提出前チェックリスト】\n`;
      content += `${'='.repeat(30)}\n`;
      const classifiedItems = classifyChecklistItems();
      
      content += `\n【今すぐできること】\n`;
      content += `${'~'.repeat(20)}\n`;
      classifiedItems.filter(c => c.category === 'support').forEach(c => {
        const supportGuidance = getSupportGuidance(c.item);
        content += `📝 ${c.item}\n${supportGuidance}\n\n`;
      });
      
      content += `\n【事業内容で決まること】\n`;
      content += `${'~'.repeat(20)}\n`;
      classifiedItems.filter(c => c.category === 'discussion').forEach(c => {
        content += `💼 ${c.item}\n  → あなたの事業内容に合わせて具体的に記載\n\n`;
      });
      
      content += `\n【確認済み】\n`;
      content += `${'~'.repeat(20)}\n`;
      classifiedItems.filter(c => c.category === 'auto').forEach(c => {
        content += `✅ ${c.item}\n`;
      });
      
      content += `\n【要確認】\n`;
      content += `${'~'.repeat(20)}\n`;
      classifiedItems.filter(c => c.category === 'manual').forEach(c => {
        content += `🔍 ${c.item}\n  → 詳細を確認してください\n\n`;
      });
    }
    
    // 3. タスクスケジュール
    if (tasks.milestones) {
      content += `\n\n【3. 申請準備タスク・スケジュール】\n`;
      content += `${'='.repeat(30)}\n`;
      tasks.milestones.forEach(milestone => {
        const deadline = `申請${milestone.lead.replace('P-', '').replace('d', '')}日前`;
        const description = milestone.description || milestone.name;
        content += `📅 ${milestone.name} (${deadline})\n    ${description}\n\n`;
      });
    }
    
    // 4. AI相談用プロンプト
    content += `\n\n【4. AI相談用プロンプト】\n`;
    content += `${'='.repeat(30)}\n`;
    content += `以下のプロンプトをChatGPTなどのAIツールにコピー＆ペーストして相談してください：\n\n`;
    
    // バックエンドからプロンプトを取得
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/applications/generate-advice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          subsidy_id: subsidyId, 
          answers: answers, 
          input_mode: inputMode, 
          target: 'ai' 
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        content += data.output;
      } else {
        // エラー時はフォールバック用の簡単なプロンプトを使用
        content += `AI相談プロンプトの取得に失敗しました。\n`;
        content += `手動でAIに相談する場合は、「AIに相談」ボタンを使用してください。`;
      }
    } catch (error) {
      // ネットワークエラー時のフォールバック
      content += `AI相談プロンプトの取得に失敗しました。\n`;
      content += `手動でAIに相談する場合は、「AIに相談」ボタンを使用してください。`;
    }
    
    // ファイルダウンロード
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${subsidyName.replace(/\s+/g, '_')}_申請準備完全パッケージ_${today.replace(/\//g, '')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateOutput = async (target) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/applications/generate-advice`, {
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
            // より柔軟な値チェック：「わからない・要相談」なども有効な入力として扱う
            const isValidValue = (val) => {
              if (val === undefined || val === null) return false;
              if (typeof val === 'string') return val.trim() !== '';
              if (Array.isArray(val)) {
                return val.length > 0 && val.some(v => {
                  if (typeof v === 'object' && v !== null) {
                    return Object.values(v).some(subV => subV && subV.toString().trim() !== '');
                  }
                  return v && v.toString().trim() !== '';
                });
              }
              return true; // その他の値タイプは有効とみなす
            };
            
            if (isValidValue(value)) {
              completedTasks++;
            }
          }
        });
      } else if (inputMode === 'integrated' && section.input_modes?.integrated) {
        totalTasks++;
        const sectionAnswer = answers[section.id];
        if (sectionAnswer) {
          // 文字列の場合は trim() を使用、オブジェクトの場合は存在チェック
          const hasValidAnswer = typeof sectionAnswer === 'string' 
            ? sectionAnswer.trim() 
            : (typeof sectionAnswer === 'object' && Object.keys(sectionAnswer).length > 0);
          if (hasValidAnswer) {
            completedTasks++;
          }
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
            
            {/* 募集期間情報 */}
            {subsidyInfo?.application_period && (
              <div className={`mb-6 p-4 backdrop-blur-sm border rounded-lg shadow-sm ${
                new Date() > new Date(subsidyInfo.application_period.end_date) 
                  ? 'bg-red-50/80 border-red-200' 
                  : 'bg-white/80 border-gray-200'
              }`}>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <svg className="h-4 w-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium">募集期間:</span>
                    <span className={`ml-1 ${
                      new Date() > new Date(subsidyInfo.application_period.end_date) 
                        ? 'text-red-600 font-medium' 
                        : 'text-gray-700'
                    }`}>
                      {subsidyInfo.application_period.start_date} 〜 {subsidyInfo.application_period.end_date}
                      {new Date() > new Date(subsidyInfo.application_period.end_date) && (
                        <span className="ml-2 bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs font-bold">
                          募集終了
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <svg className="h-4 w-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">情報基準日:</span>
                    <span className="ml-1 text-gray-700">{subsidyInfo.application_period.information_date}</span>
                  </div>
                  {subsidyInfo.application_period.current_round && (
                    <div className="flex items-center">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                        {subsidyInfo.application_period.current_round}
                      </span>
                    </div>
                  )}
                </div>
                {subsidyInfo.application_period.notes && (
                  <div className="mt-2 text-xs text-gray-600">
                    ※ {subsidyInfo.application_period.notes}
                  </div>
                )}
                {new Date() > new Date(subsidyInfo.application_period.end_date) && (
                  <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded">
                    <div className="flex items-start">
                      <svg className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <div className="text-sm text-red-700">
                        <div className="font-medium">この募集回は終了しています</div>
                        <div className="mt-1">次回募集の情報は公式サイトでご確認ください。情報基準日が古い可能性があります。</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {isAtotsugi ? (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 入力 */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-2">1</div>
                    <h3 className="text-lg font-bold text-gray-800">入力</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    設問に回答して事業の要素を書き出す
                  </p>
                </div>

                {/* 生成 */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-2">2</div>
                    <h3 className="text-lg font-bold text-gray-800">生成</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    入力内容のまとめを生成
                  </p>
                </div>

                {/* ブラッシュアップ */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-2">3</div>
                    <h3 className="text-lg font-bold text-gray-800">ブラッシュアップ</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    生成された回答（プロンプト）を使ってAIに質問したり、自分で考える材料として利用し申請内容に磨きをかける。
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-4 p-3 bg-white/60 backdrop-blur-sm rounded-xl shadow-md border border-white/20 inline-block">
                <p className="text-base leading-relaxed text-gray-700 font-medium">
                  補助金申請に必要な情報を入力してください。<br />
                  入力済みの内容をもとに、アウトプットを生成します。全項目入力しなくても生成可能です。
                </p>
              </div>
            )}
            
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
              <div className="flex items-center space-x-4">
                {/* 進捗表示 */}
                <div className="text-xs text-gray-500">
                  {getProgressPercentage() === 100 ? (
                    <span className="text-green-600 font-medium">🎉 全項目完了</span>
                  ) : (
                    <span>残り{42 - Math.round((getProgressPercentage() / 100) * 42)}タスク（部分入力でも生成OK）</span>
                  )}
                </div>
                
                {/* 自動保存ステータス */}
                <div className="flex items-center space-x-2 text-xs">
                  {autoSaveStatus === 'saving' && (
                    <span className="text-blue-600 flex items-center">
                      <svg className="animate-spin h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      保存中
                    </span>
                  )}
                  {autoSaveStatus === 'saved' && (
                    <span className="text-green-600 flex items-center">
                      <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      保存済み
                    </span>
                  )}
                  {autoSaveStatus === 'error' && (
                    <span className="text-red-600 flex items-center">
                      <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      保存失敗
                    </span>
                  )}
                  {lastSaved && autoSaveStatus === '' && (
                    <span className="text-gray-500">
                      最終保存: {lastSaved.toLocaleTimeString()}
                    </span>
                  )}
                  
                  {/* 保存データ管理ボタン */}
                  {lastSaved && (
                    <button
                      onClick={clearSavedData}
                      className="text-red-500 hover:text-red-700 font-medium"
                      title="保存データを削除"
                    >
                      削除
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* 診断データからの事前入力通知 */}
        {/* 30秒診断反映メッセージを非表示
        {diagnosisData && diagnosisApplied && (
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
        */}
        {!showOutputOptions ? (
          <div>
            {/* アトツギ甲子園の場合の入力モード切り替え */}
            {isAtotsugi && (
              <div className="mb-8">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">入力方式を選択（まずはわかるところだけ入力）</h3>
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
                      type="button"
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
                      type="button"
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
              
              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
                <button 
                  type="button"
                  onClick={downloadCompletePackage}
                  className="inline-flex items-center justify-center rounded-xl bg-gray-600 px-6 py-4 text-base font-semibold text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 min-h-[56px] touch-manipulation"
                >
                  <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>申請準備完全パッケージ(TXT)で保存</span>
                </button>
                
                <button 
                  type="submit"
                  className={`inline-flex items-center justify-center rounded-xl bg-${headerColor}-600 px-8 py-4 text-lg font-semibold text-white shadow-sm hover:bg-${headerColor}-700 focus:outline-none focus:ring-2 focus:ring-${headerColor}-500 focus:ring-offset-2 transition-all duration-200 min-h-[56px] touch-manipulation`}
                >
                  <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span>{isAtotsugi ? 'アドバイス・ヒントを生成（部分入力OK）' : '分析・生成する（部分入力OK）'}</span>
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
                入力済みの内容をもとに、目的に応じたアウトプットを生成します。後から追加入力して再生成も可能です。
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
                    専門家などに相談
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 group-hover:text-green-600">
                    補助金の専門家などに相談するためのサマリーを生成します
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

      {/* エラー項目一覧 - ページ下部に表示 */}
      {isAtotsugi && getValidationErrors().length > 0 && (
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-red-800 mb-2">
                  未入力の必須項目があります ({getValidationErrors().length}件)
                </h3>
                <div className="space-y-1">
                  {getValidationErrors().slice(0, 5).map((error, index) => (
                    <button
                      key={`${error.sectionId}-${error.taskId}`}
                      onClick={() => scrollToError(error.sectionId, error.taskId)}
                      className="block text-left text-sm text-red-700 hover:text-red-900 hover:underline"
                    >
                      → {error.sectionTitle}: {error.label}
                    </button>
                  ))}
                  {getValidationErrors().length > 5 && (
                    <p className="text-xs text-red-600 mt-2">
                      他 {getValidationErrors().length - 5} 件
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubsidyApplicationSupport;