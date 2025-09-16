#!/usr/bin/env python3
"""
補助金情報更新プロンプト自動生成スクリプト
version_history.yamlから最新の参照元情報を読み取り、
llm_update_prompt.mdを自動更新します。
"""

import yaml
import re
from datetime import datetime

def load_version_history():
    """version_history.yamlを読み込む"""
    with open('/Users/r9a/exp/attg/backend/version_history.yaml', 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)

def generate_prompt_content(version_data):
    """version_history.yamlの情報から更新プロンプトを生成"""
    
    # 現在の日付
    current_date = datetime.now().strftime('%Y-%m-%d')
    
    # 補助金IDと名称のマッピング
    subsidy_mapping = {
        'monodukuri_r7_21th': {
            'name': 'ものづくり・商業・サービス生産性向上促進補助金',
            'org': '全国中小企業団体中央会'
        },
        'it_dounyuu': {
            'name': 'IT導入補助金', 
            'org': '一般社団法人サービスデザイン推進協議会'
        },
        'chusho_jigyou': {
            'name': '小規模事業者持続化補助金',
            'org': '全国商工会連合会・日本商工会議所'
        },
        'shinjigyo_shinshutsu': {
            'name': '中小企業新事業進出補助金',
            'org': '中小企業庁・中小企業基盤整備機構'
        },
        'atotsugi': {
            'name': 'アトツギ甲子園',
            'org': '経済産業省・中小企業庁'
        },
        'jigyou_shoukei_ma': {
            'name': '事業承継・M&A補助金（専門家活用枠）',
            'org': '中小企業庁'
        }
    }
    
    # プロンプト内容を構築
    prompt_content = f"""# 補助金情報 自動更新調査プロンプト

あなたは補助金情報の定期更新を担当するリサーチアシスタントです。以下の6つの補助金について、最新の募集期間と制度情報を調査し、YAML形式で結果を出力してください。

## 調査対象補助金

"""

    # 各補助金の情報を追加
    subsidy_counter = 1
    for subsidy_id, subsidy_info in subsidy_mapping.items():
        prompt_content += f"### {subsidy_counter}. {subsidy_info['name']}\n"
        
        # version_history.yamlから参照元URLを取得
        if subsidy_id in version_data['subsidies']:
            subsidy_data = version_data['subsidies'][subsidy_id]
            if 'source_references' in subsidy_data and subsidy_data['source_references']:
                main_url = subsidy_data['source_references'][0]['url']
                last_accessed = subsidy_data['source_references'][0]['accessed_date']
                version_info = subsidy_data['source_references'][0].get('version', '最新版')
                prompt_content += f"- **公式サイト**: {main_url}\n"
                prompt_content += f"- **運営機関**: {subsidy_info['org']}\n"
                prompt_content += f"- **前回確認日**: {last_accessed}\n"
                prompt_content += f"- **前回確認時情報**: {version_info}\n\n"
            else:
                prompt_content += f"- **運営機関**: {subsidy_info['org']}\n"
                prompt_content += f"- **参照元**: version_history.yamlに未登録\n\n"
        else:
            prompt_content += f"- **運営機関**: {subsidy_info['org']}\n"
            prompt_content += f"- **参照元**: version_history.yamlに未登録\n\n"
        
        subsidy_counter += 1

    # 固定の調査指示とYAML出力形式を追加
    prompt_content += """## 調査指示

1. **各公式サイトにアクセス**して最新情報を確認
2. **募集期間**（開始日・終了日）
3. **現在の募集回次**（第○回、令和○年度第○期等）
4. **重要な制度変更**があれば特記
5. **募集終了済み**の場合は次回予定を確認

## 出力形式

以下のYAML形式で各補助金の情報を出力してください：

```yaml
# 調査実施日: """ + current_date + """
# 調査者: Claude AI Assistant

subsidies_update:
  monodukuri:
    id: "monodukuri"
    name: "ものづくり・商業・サービス生産性向上促進補助金"
    application_period:
      current_round: "第○次締切分"
      start_date: "YYYY-MM-DD"
      end_date: "YYYY-MM-DD"
      information_date: \"""" + current_date + """\"
      notes: "令和○年度補正予算・当初予算"
    status: "募集中/募集終了/次回未定"
    changes: "制度変更があれば記載"
    
  it_dounyuu:
    id: "it_dounyuu"
    name: "IT導入補助金"
    application_period:
      current_round: "令和○年度○期"
      start_date: "YYYY-MM-DD"
      end_date: "YYYY-MM-DD"
      information_date: \"""" + current_date + """\"
      notes: "通常枠・インボイス枠・セキュリティ対策推進枠"
    status: "募集中/募集終了/次回未定"
    changes: "制度変更があれば記載"
    
  chusho_jigyou:
    id: "chusho_jigyou"
    name: "小規模事業者持続化補助金"
    application_period:
      current_round: "第○回締切分"
      start_date: "YYYY-MM-DD"
      end_date: "YYYY-MM-DD"
      information_date: \"""" + current_date + """\"
      notes: "一般型・特別枠（賃金引上げ枠・卒業枠・後継者支援枠・創業枠）"
    status: "募集中/募集終了/次回未定"
    changes: "制度変更があれば記載"
    
  shinjigyo_shinshutsu:
    id: "shinjigyo_shinshutsu"
    name: "中小企業新事業進出補助金"
    application_period:
      current_round: "令和○年度第○期"
      start_date: "YYYY-MM-DD"
      end_date: "YYYY-MM-DD"
      information_date: \"""" + current_date + """\"
      notes: "新規事業進出支援枠"
    status: "募集中/募集終了/次回未定"
    changes: "制度変更があれば記載"
    
  atotsugi:
    id: "atotsugi"
    name: "アトツギ甲子園"
    application_period:
      current_round: "第○回大会"
      start_date: "YYYY-MM-DD"
      end_date: "YYYY-MM-DD"
      information_date: \"""" + current_date + """\"
      notes: "エントリー・地方予選・全国大会"
    status: "エントリー受付中/地方予選中/全国大会開催済み"
    changes: "制度変更があれば記載"
    
  jigyou_shoukei:
    id: "jigyou_shoukei"
    name: "事業承継・M&A補助金（専門家活用枠）"
    application_period:
      current_round: "令和○年度"
      start_date: "YYYY-MM-DD"
      end_date: "YYYY-MM-DD"
      information_date: \"""" + current_date + """\"
      notes: "専門家活用枠"
    status: "募集中/募集終了/次回未定"
    changes: "制度変更があれば記載"

# 全体的な変更・注意事項
general_updates:
  - "重要な制度変更や新設制度があれば記載"
  - "調査時に発見した問題点や注意事項"
  - "公式サイトにアクセスできなかった場合の報告"
```

## 重要な確認ポイント

1. **URL有効性**: 実際にサイトにアクセスできるか（アクセスできない場合はWebSearchで代替情報を検索）
2. **最新性**: 2025年度の情報が掲載されているか
3. **募集状況**: 現在募集中か、終了しているか
4. **次回予定**: 募集終了の場合、次回のスケジュール
5. **制度変更**: 補助率、上限額、要件等の重要な変更

## 調査時の注意事項

- 政府機関（.go.jp）の情報を優先
- 古い情報（2024年度以前）は参考程度に
- 類似名称の別制度と混同しないよう注意
- アクセスできないサイトがあればWebSearchで代替情報を検索
- アトツギ甲子園は第6回が最新（第7回は存在しない）

**調査開始してください。各サイトの最新情報を確認し、上記YAML形式で結果を出力してください。**
"""

    return prompt_content

def update_prompt_file(content):
    """llm_update_prompt.mdを更新"""
    with open('/Users/r9a/exp/attg/backend/llm_update_prompt.md', 'w', encoding='utf-8') as f:
        f.write(content)

def main():
    """メイン関数"""
    print("補助金情報更新プロンプト自動生成を開始します...")
    
    # version_history.yamlを読み込み
    version_data = load_version_history()
    
    # プロンプト内容を生成
    prompt_content = generate_prompt_content(version_data)
    
    # ファイルを更新
    update_prompt_file(prompt_content)
    
    print("✅ llm_update_prompt.mdを更新しました")
    print("📋 version_history.yamlの参照元情報が自動反映されています")

if __name__ == "__main__":
    main()