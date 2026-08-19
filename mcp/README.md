# シンセイダーMCPサーバー（PoC）

サイト(`data/*.yaml`)を単一の正本として、シンセイダーの情報と体験をLLMクライアント
（Claude Desktop / Claude Code 等）へ提供するローカルMCPサーバー。

## セットアップ

```bash
cd mcp
python3 -m venv .venv
.venv/bin/pip install "mcp[cli]" pyyaml
```

Claude Code への登録:

```bash
claude mcp add shinseider -- <絶対パス>/mcp/.venv/bin/python <絶対パス>/mcp/server.py
```

Claude Desktop の場合は `claude_desktop_config.json` に:

```json
{"mcpServers": {"shinseider": {"command": "<絶対パス>/mcp/.venv/bin/python",
                               "args": ["<絶対パス>/mcp/server.py"]}}}
```

MCPは共通規格なので、他のローカルMCP対応クライアント（Cursor / VS Code /
Gemini CLI 等）でも、stdio型サーバーとして同じ `command` と `args` を各アプリの
MCP設定に登録すれば使えます（動作確認済みは Claude Code のみ）。

## 提供するもの

- **Tools**: `get_deadlines`（二段階締切と現在段階）/ `check_eligibility`（30秒チェック同一ロジック）/
  `get_pace_plan`（逆算プラン）/ `workspace_init·record·state`（作業フォルダと記録）/
  `list_question_blocks·get_question_block·fukabori_coverage`（質問バンクと機械チェック）
- **Prompts**: `entry_interview`（骨子づくり）/ `mock_review`（予行審査）/
  `dr_review`（引用必須の逆写像DR）/ `fukabori_chapter`（章別深掘り）
- **Resources**: `shinseider://koshien/basics` `subsidy/shokei-ma` `consult` `question-bank` `about`

## 設計原則

- 進行は**概要ファースト**。質問バンク（24ブロック78項目）の深掘りは利用者が要望したときだけ。
- 数値・期日はLLMの自前知識でなく必ずツール/リソースから。出典のない数字は（仮）と明示。
- 入力・成果物はワークスペース（利用者の手元フォルダ）へ記録。シンセイダー側には何も送信されない。
- 判定ロジック・文言はサイトのJS実装と同一仕様（乖離させない）。
- 非公式・無償。適用可否は各制度の公募要領原文が常に優先。
