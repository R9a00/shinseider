# シンセイダーMCPサーバー（PoC）

サイト(`data/*.yaml`)を単一の正本として、シンセイダーの情報と体験をLLMクライアント
（Claude Desktop / Claude Code 等）へ提供するローカルMCPサーバー。

## セットアップ

**AIに任せる場合**: [mcp-setup.md](mcp-setup.md)（サイトでは
`https://shinseider.onrender.com/mcp-setup.md`）をAIアシスタントに渡すと、
実行できる環境なら代行、チャットのみの環境なら1コマンドずつ案内してくれます。

手動でやる場合、必要なもの: git と Python 3.10 以上。

まずこのリポジトリを手元に取得してから、`mcp/` の中に環境を作ります:

```bash
git clone https://github.com/R9a00/shinseider.git
cd shinseider/mcp
python3 -m venv .venv
.venv/bin/pip install "mcp[cli]==2.3.0" "pyyaml==6.0.2" "pypdf==6.21.4"
```

Claude Code への登録（上と同じ `mcp/` ディレクトリの中で実行すれば、そのままコピペで通ります）:

```bash
claude mcp add -s user shinseider -- "$(pwd)/.venv/bin/python" "$(pwd)/server.py"
```

Claude Desktop の場合は `claude_desktop_config.json` に（`<絶対パス>` は `mcp/` で `pwd` を実行した結果に読み替え）:

```json
{"mcpServers": {"shinseider": {"command": "<絶対パス>/.venv/bin/python",
                               "args": ["<絶対パス>/server.py"]}}}
```

ChatGPT（デスクトップアプリ）/ Codex への登録（設定は `~/.codex/config.toml` で共有。
`mcp/` の中で実行すればそのままコピペで通ります）:

```bash
codex mcp add shinseider -- "$(pwd)/.venv/bin/python" "$(pwd)/server.py"
```

ChatGPTアプリの設定画面（設定 → MCPサーバー → 追加）から登録する場合は、
タイプ「STDIO」、起動用コマンドに `<絶対パス>/.venv/bin/python`、引数に
`<絶対パス>/server.py` を指定してください。

MCPは共通規格なので、他のローカルMCP対応クライアント（Cursor / VS Code /
Gemini CLI 等）でも、stdio型サーバーとして同じ `command` と `args` を各アプリの
MCP設定に登録すれば使えます（動作確認済みは Claude Code のみ）。

## 提供するもの

- **Tools**: `get_deadlines`（二段階締切と現在段階）/ `check_eligibility`（30秒チェック同一ロジック）/
  `get_pace_plan`（逆算プラン）/ `workspace_init·record·state·read`（作業フォルダと記録）/
  `list_question_blocks·get_question_block·fukabori_coverage`（質問バンクと機械チェック）
- **Prompts**: `entry_interview`（骨子づくり）/ `mock_review`（予行審査）/
  `dr_review`（引用必須の逆写像DR）/ `fukabori_chapter`（章別深掘り）
- **Resources**: `shinseider://koshien/basics` `subsidy/shokei-ma` `consult` `question-bank` `about`

## 設計原則

- 進行は**概要ファースト**。質問バンク（24ブロック78項目）の深掘りは利用者が要望したときだけ。
- 数値・期日はLLMの自前知識でなく必ずツール/リソースから。出典のない数字は（仮）と明示。
- 入力・成果物はワークスペース（利用者の手元フォルダ）へ記録。このMCPサーバーに運営者へ記録を送信する機能はない。ただし、AIへ渡す入力・ツール応答・会話は利用するAIサービスで処理される。
- 判定ロジック・文言はサイトのJS実装と同一仕様（乖離させない）。
- 非公式・無償。適用可否は各制度の公募要領原文が常に優先。

OpenAI側のローカルMCP設定は[公式資料](https://learn.chatgpt.com/docs/extend/mcp)と2026-10-29に照合。デスクトップとWebでは接続方式が異なるため、利用する画面の手順を確認すること。

このサーバーはローカルSTDIO方式です。公開サイトURLはリモートMCPの接続先ではありません。クライアントの対応方式と設定方法は、利用中の版の公式案内を確認してください。


## 保存した作業の再開

別の会話では `workspace_state` で一覧を確認し、`workspace_read(section)` で `profile`・`outline`・`entry_draft` などの本文を読み戻します。長文は返された `next_offset` を次の `offset` に指定します。記録の存在や機械チェックの通過は、内容の正しさ・完成を意味しません。書込み・読込みとも、指定した作業フォルダの外にはアクセスできません。


## 調査・材料・フォーマット・完成稿の点検

`shinseider://application/support` に公式要項と経験者記事の出典、6項目の追加質問、4段階の指示があります。検索は接続したAIの検索機能で行います。公式と経験談、確認済みと未確認を分けます。

1. `workspace_init` の後、`application_context_read` で文脈と `binding`・`revision` を読みます。骨子・深掘りは `workspace_read` で取得して `reference` へ追加します。
2. `application_workflow(stage="research")` / `prepare` の指示で調査と材料を整理し、`application_context_save(context, expected_revision=revision)` で保存します。既存の記録がある場合、直前の読込みで得た revision が必要です。
3. 原本を作業フォルダの `materials/` に置き、`application_document_read("materials/format.pptx")` の結果を `context.files.template` に記録します。完成稿も同様に `draft` へ入れます。対応形式はPDF/PPTX/DOCX/TXT/MD、15MB・100ページまで。DOCX/TXT/MDの改ページ、図・画像・配置は未確認です。
4. `application_workflow(stage="compose")` で原本に合わせて作成、`review` で完成稿を点検します。原本の描画確認はクライアント側で行い、できなければ未実施と明示します。
5. 引用・理由・重大度・直し方・未確認範囲を `application_review_save(binding, result)` で保存します。材料・ファイル・支援資料が変わると `review_current` は false になります。true も審査合格や内容の妥当性を意味しません。

`materials/application-context.json` はサイトの「応募書類を作る・点検する」で読み込めます。原本はJSONに含まれないので別途保管・添付します。旧版から更新した場合は新しい依存パッケージも上記の導入コマンドで入れてください。

文脈保存は操作を直列化し、一時ファイルから置き換えます。`revision` は点検本文も含む保存版、`binding` は点検対象だけを表します。旧 `expected_binding` だけでの保存は点検本文を変更しない場合に限ります。`workspace_record` で `materials/application-context.json` を直接書き換えることはできません。空白・半角/全角括弧を含む原本名にも対応します。
