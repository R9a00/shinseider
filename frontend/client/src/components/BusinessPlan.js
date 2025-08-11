import React, { useState } from 'react';
import config from '../config';

function BusinessPlan() {
  const [formData, setFormData] = useState({
    business_summary: '',
    market_analysis: '',
    competitive_advantage: '',
    products_services: '',
    marketing_strategy: '',
    revenue_plan: '',
    funding_plan: '',
    implementation_structure: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/generate_business_plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "事業計画書.docx";
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

  return (
    <div>
      <h2>ドラフトをつくる</h2>
      <form onSubmit={handleSave}>
        <div>
          <label>事業概要:</label>
          <textarea name="business_summary" value={formData.business_summary} onChange={handleChange} rows="5" cols="50" />
          <p className="question-hint">事業の全体像を簡潔に記述してください。何をする事業で、誰に、どのような価値を提供しますか？</p>
        </div>
        <div>
          <label>市場分析:</label>
          <textarea name="market_analysis" value={formData.market_analysis} onChange={handleChange} rows="5" cols="50" />
          <p className="question-hint">ターゲット市場の規模、成長性、顧客ニーズについて、データや根拠（例：市場調査レポート、顧客アンケート結果など）を交えて説明してください。</p>
        </div>
        <div>
          <label>競合優位性:</label>
          <textarea name="competitive_advantage" value={formData.competitive_advantage} onChange={handleChange} rows="5" cols="50" />
          <p className="question-hint">競合他社（例：A社、B社）と比較した際の、あなたの事業の優位性や独自性は何ですか？どのように差別化を図りますか？</p>
        </div>
        <div>
          <label>製品・サービス:</label>
          <textarea name="products_services" value={formData.products_services} onChange={handleChange} rows="5" cols="50" />
          <p className="question-hint">提供する製品やサービスの詳細、特徴、顧客にとってのメリットを具体的に記述してください。</p>
        </div>
        <div>
          <label>マーケティング戦略:</label>
          <textarea name="marketing_strategy" value={formData.marketing_strategy} onChange={handleChange} rows="5" cols="50" />
          <p className="question-hint">どのように顧客を獲得し、製品・サービスを販売しますか？具体的なプロモーション方法や販売チャネルを記述してください。</p>
        </div>
        <div>
          <label>収益計画:</label>
          <textarea name="revenue_plan" value={formData.revenue_plan} onChange={handleChange} rows="5" cols="50" />
          <p className="question-hint">売上高、費用、利益の計画を具体的に記述してください。売上予測の根拠や、費用内訳を明確に示しましょう。</p>
        </div>
        <div>
          <label>資金計画:</label>
          <textarea name="funding_plan" value={formData.funding_plan} onChange={handleChange} rows="5" cols="50" />
          <p className="question-hint">事業に必要な資金総額と、その調達方法（自己資金、融資、補助金など）を具体的に記述してください。資金使途も明確にしましょう。</p>
        </div>
        <div>
          <label>実施体制:</label>
          <textarea name="implementation_structure" value={formData.implementation_structure} onChange={handleChange} rows="5" cols="50" />
          <p className="question-hint">事業を推進するチームのメンバー、役割分担、外部協力者（専門家、提携先など）について記述してください。</p>
        </div>
        <button type="submit">Word形式で保存</button>
      </form>
    </div>
  );
}

export default BusinessPlan;