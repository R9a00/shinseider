#!/usr/bin/env python3
"""
補助金申請サポート項目の詳細情報を収集するためのプロンプト生成機能

使用方法:
python research_prompts.py --item "賃金引上げ計画" --subsidy "ものづくり補助金"
"""

import argparse
import json
from datetime import datetime

class SubsidyResearchPromptGenerator:
    """補助金申請項目の詳細調査用プロンプト生成クラス"""
    
    def __init__(self):
        self.prompt_templates = {
            "wage_increase_plan": {
                "title": "賃金引上げ計画の詳細要件調査",
                "search_queries": [
                    "ものづくり補助金 賃金引上げ計画 誓約書 テンプレート",
                    "給与支給総額 年率1.5%増加 計算方法 根拠",
                    "事業場内最低賃金 地域別最低賃金+30円 設定方法",
                    "労務管理 賃金台帳 給与計算 法的要件"
                ],
                "research_questions": [
                    "1. 「給与支給総額を年率平均1.5%以上増加」の具体的な計算方法は？",
                    "2. 賃金引上げ計画の誓約書に必要な記載事項は？",
                    "3. 事業場内最低賃金の設定における法的注意点は？",
                    "4. 計画未達成時のペナルティや対応方法は？",
                    "5. 他社の成功事例やベストプラクティスは？"
                ],
                "output_format": "テンプレート、計算ツール、チェックリスト"
            },
            
            "next_generation_law": {
                "title": "次世代育成支援対策推進法 行動計画要件",
                "search_queries": [
                    "次世代育成支援対策推進法 行動計画 策定指針",
                    "従業員21名以上 一般事業主行動計画 義務",
                    "女性活躍推進法 行動計画 策定 公表",
                    "厚生労働省 行動計画策定・届出システム"
                ],
                "research_questions": [
                    "1. 行動計画に必須の記載事項と任意事項は？",
                    "2. 計画期間や目標設定の具体的な要件は？",
                    "3. 公表方法と公表先の詳細な手順は？",
                    "4. 計画策定時に避けるべき法的リスクは？",
                    "5. 業種別の計画策定事例とポイントは？"
                ],
                "output_format": "計画書テンプレート、策定手順書、公表方法ガイド"
            },
            
            "productivity_measurement": {
                "title": "生産性向上の測定・評価方法",
                "search_queries": [
                    "生産性向上 測定方法 KPI指標 製造業",
                    "労働生産性 計算式 付加価値額 総労働時間",
                    "設備稼働率 品質指標 改善率 ベンチマーク",
                    "経済産業省 生産性向上 ガイドライン 中小企業"
                ],
                "research_questions": [
                    "1. 補助金申請で求められる生産性指標の種類は？",
                    "2. 業種別の生産性ベンチマークや平均値は？",
                    "3. 改善効果の測定に適したツールや手法は？",
                    "4. 定量的な効果測定の具体的な計算方法は？",
                    "5. 測定データの信頼性を担保する方法は？"
                ],
                "output_format": "測定フレームワーク、計算ツール、データ収集方法"
            },
            
            "regulatory_compliance": {
                "title": "法規制・認証要件の確認",
                "search_queries": [
                    "補助金申請 法的要件 コンプライアンス チェック",
                    "労働基準法 安全衛生法 環境法 業界規制",
                    "製品認証 品質認証 環境認証 取得手順",
                    "許認可 届出 申請 業種別 要件"
                ],
                "research_questions": [
                    "1. 業種・事業内容に応じた必要な許認可は？",
                    "2. 製品・サービスに関連する認証要件は？",
                    "3. 労働関連法規の遵守確認ポイントは？",
                    "4. 環境・安全規制への対応要件は？",
                    "5. 法規制変更への対応体制は？"
                ],
                "output_format": "法規制チェックリスト、認証取得ガイド、コンプライアンス体制"
            }
        }
    
    def generate_research_prompt(self, item_key, subsidy_name="", company_info=""):
        """指定項目の詳細調査用プロンプトを生成"""
        
        if item_key not in self.prompt_templates:
            return self._generate_generic_prompt(item_key, subsidy_name)
        
        template = self.prompt_templates[item_key]
        
        prompt = f"""
# {template['title']}

## 📋 調査依頼内容
{subsidy_name}の申請において、「{item_key}」に関する詳細な要件と実務的なサポート方法を調査してください。

## 🔍 推奨検索クエリ
"""
        
        for i, query in enumerate(template['search_queries'], 1):
            prompt += f"{i}. {query}\n"
        
        prompt += f"""
## ❓ 重点調査項目
"""
        
        for question in template['research_questions']:
            prompt += f"{question}\n"
        
        prompt += f"""
## 📊 期待する成果物
{template['output_format']}

## 🎯 調査の目的
現在「社労士や専門家にご相談ください」という投げやりな案内を、具体的で実用的なサポートに改善するため。

## 📝 出力形式
1. **要件の詳細解説**: 法的根拠、具体的基準、注意点
2. **実務的な手順**: ステップバイステップの実施方法
3. **テンプレート・ツール**: 実際に使用できる書式やツール
4. **チェックポイント**: 確認すべき重要事項
5. **専門家相談の判断基準**: どの段階で専門家が必要か

## 📅 調査実施日
{datetime.now().strftime('%Y年%m月%d日')}

---
この調査により、ユーザーが自力でできる部分と専門家サポートが必要な部分を明確に分離し、
具体的で実用的なガイダンスを提供できるようになります。
"""
        
        return prompt
    
    def _generate_generic_prompt(self, item, subsidy_name):
        """汎用的な調査プロンプトを生成"""
        return f"""
# 補助金申請要件の詳細調査

## 📋 調査対象
項目: {item}
補助金: {subsidy_name}

## 🔍 調査内容
1. この要件の法的根拠と詳細な基準
2. 実務的な対応方法とステップ
3. 必要な書類・資料とテンプレート
4. よくある間違いや注意点
5. 専門家相談が必要な境界線

## 🎯 調査目的
「専門家にご相談ください」という案内を、具体的で実用的なサポートに改善する

## 📝 期待する成果
- 自力でできる準備作業の明確化
- 実用的なテンプレートやツール
- 専門家相談の適切なタイミング

調査実施日: {datetime.now().strftime('%Y年%m月%d日')}
"""
    
    def generate_batch_prompts(self, items_list, subsidy_name=""):
        """複数項目の一括調査プロンプトを生成"""
        prompts = {}
        for item in items_list:
            # アイテム名からキーを推定
            item_key = self._infer_item_key(item)
            prompts[item] = self.generate_research_prompt(item_key, subsidy_name)
        return prompts
    
    def _infer_item_key(self, item_text):
        """項目テキストからテンプレートキーを推定"""
        if "賃金引上げ" in item_text:
            return "wage_increase_plan"
        elif "次世代法" in item_text or "行動計画" in item_text:
            return "next_generation_law"
        elif "生産性" in item_text:
            return "productivity_measurement"
        elif "法" in item_text or "認証" in item_text or "許可" in item_text:
            return "regulatory_compliance"
        else:
            return "generic"

def main():
    parser = argparse.ArgumentParser(description='補助金申請サポート項目の調査プロンプト生成')
    parser.add_argument('--item', required=True, help='調査対象項目')
    parser.add_argument('--subsidy', default='', help='補助金名')
    parser.add_argument('--output', help='出力ファイル名')
    
    args = parser.parse_args()
    
    generator = SubsidyResearchPromptGenerator()
    item_key = generator._infer_item_key(args.item)
    prompt = generator.generate_research_prompt(item_key, args.subsidy)
    
    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            f.write(prompt)
        print(f"プロンプトを {args.output} に保存しました")
    else:
        print(prompt)

if __name__ == "__main__":
    main()