# シンセイダーMCP セットアップ指示書（AIアシスタント向け）

この文書は、AIアシスタントがシンセイダーMCPサーバーの導入を代行または案内するための指示書です。人間が読んでも全体がわかるように書いてあります。作業を始める前に、下の「これから行うこと」を利用者へ短く説明してください。

## あなた（AI）へ — まずモードを自己判定する

- **実行モード**: あなたがシェルコマンドを実行できる環境（Claude Code・Codex CLI などのエージェント型）なら、各ステップを自分で実行し、確認結果を利用者に報告する。
- **案内モード**: コマンドを実行できない環境（チャットアプリ等）なら、利用者に**1つずつ**コマンドを提示し、出力を貼ってもらって確認してから次へ進む。複数のコマンドをまとめて渡さない（途中の失敗を見逃す原因になる）。

共通の規律:

- 1ステップずつ進め、結果を確認してから次へ。エラーが出たら原文を読み、原因を特定してから対処する。推測で先へ進まない。
- 既存のファイル・設定を上書きしない。マージするか、先に利用者へ確認する。
- 終了時に「何をどこに作ったか」と「撤去方法」を必ず報告する。

## これから行うこと（利用者向け概要）

1. シンセイダーのリポジトリを手元に取得（git clone）
2. その中の `mcp/` にPython仮想環境を作り、依存パッケージを入れる
3. お使いのAIアプリにMCPサーバーとして登録する
4. 接続を確認する

導入時間は環境によって異なります。撤去方法は最後に案内します。シンセイダーは非公式・無償のツールで、記録ファイルは利用者のパソコンに保存されます。AIに渡す入力やツール結果はAI事業者が処理します。シンセイダー運営者には送信されません。

## 手順

### 1. 前提確認

```bash
git --version
python3 --version
```

- git がない場合: macOSは `xcode-select --install`、それ以外は各配布元から導入してから続行。
- Python は **3.10以上** が必要。

### 2. 取得と環境構築

設置場所を利用者に確認する（既定の提案: ホーム直下 `~/shinseider`）。

```bash
git clone https://github.com/R9a00/shinseider.git ~/shinseider
cd ~/shinseider/mcp
python3 -m venv .venv
.venv/bin/pip install "mcp[cli]==2.3.0" "pyyaml==6.0.2" "pypdf==6.21.4"
```

- すでに `~/shinseider` がある場合: 中身を確認し、以前のcloneなら `git pull` に切り替える。無関係のディレクトリなら別の場所を利用者と決める。
- Windowsの場合: venvの実体は `.venv\Scripts\python.exe`。以降の `<python>` を読み替える。

### 3. クライアントへの登録

どのアプリで使いたいかを利用者に確認する（複数でもよい）。以下、`<python>` は `~/shinseider/mcp/.venv/bin/python` の絶対パス、`<server>` は `~/shinseider/mcp/server.py` の絶対パス。

**Claude Code**:

```bash
claude mcp add -s user shinseider -- <python> <server>
```

**ChatGPTデスクトップアプリ / Codex CLI**（設定は `~/.codex/config.toml` で共有）:

```bash
codex mcp add shinseider -- <python> <server>
```

CLIが入っていなければ、ChatGPTアプリの 設定 → MCPサーバー → 追加 で、タイプ「STDIO」・起動用コマンド=`<python>`・引数=`<server>` を入力。

**Claudeデスクトップアプリ**: `claude_desktop_config.json`（macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`）の `mcpServers` に次をマージする。**既存のキーを消さないこと**:

```json
{"mcpServers": {"shinseider": {"command": "<python>", "args": ["<server>"]}}}
```

### 4. 確認（ここまでできて完了）

- Claude Code: `claude mcp list` に `shinseider … ✔ Connected` が出る。
- Codex / ChatGPT: `codex mcp list` で登録状態を確認する。アプリ側も再起動後に一覧を確認する。一覧表示やenabledだけでは通信成功を示さないため、下のツール呼出しも確認する。
- Claudeデスクトップも完全終了→再起動が必要。
- 最終確認: 新しい会話で「アトツギ甲子園の締切は？」と聞き、`get_deadlines` ツールが呼ばれて具体的な日付が返ることを確認する。保存・再開は試験用の作業フォルダで `workspace_record` → 再接続 → `workspace_read` を呼び、本文が一致することを確認する。

### 5. 報告と撤去方法

利用者に以下を報告する:

- 作った場所（clone先と仮想環境）
- 登録したクライアントと、書き換えた設定ファイル
- 撤去方法: `claude mcp remove shinseider` ／ `codex mcp remove shinseider` ／ `claude_desktop_config.json` の該当エントリ削除。ファイル一式は `~/shinseider` を削除すれば消える。

## うまくいかないとき

- `cd: no such file or directory`: cloneの前に `cd` している。手順2の最初から。
- pipのインストール失敗: `.venv/bin/pip --version` でvenvが正しく作られているか確認する。
- 接続エラー・一覧に出ない: `<python> <server>` を直接実行し、起動時エラーの原文（依存不足・パス誤り）を確認する。
- 解決しないときは無理に進めず、エラー原文を控えて [シンセイダーの連絡先](https://shinseider.onrender.com/about.html) へ。

OpenAIのローカルMCP設定の出典: https://learn.chatgpt.com/docs/extend/mcp （2026-10-29照合）。Web版の接続とは区別してください。

このサーバーはローカルSTDIO方式です。公開サイトURLはリモートMCPの接続先ではありません。クライアントの対応方式と設定方法は、利用中の版の公式案内を確認してください。


## 調査・材料・フォーマット・完成稿の点検

`shinseider://application/support` に公式要項と経験者記事の出典、6項目の追加質問、4段階の指示があります。検索は接続したAIの検索機能で行います。公式と経験談、確認済みと未確認を分けます。

1. `workspace_init` の後、`application_context_read` で文脈と `binding` を読みます。骨子・深掘りは `workspace_read` で取得して `reference` へ追加します。
2. `application_workflow(stage="research")` / `prepare` の指示で調査と材料を整理し、`application_context_save(context, expected_binding)` で保存します。既存の記録がある場合、直前の読込みで得た binding が必要です。
3. 原本を作業フォルダの `materials/` に置き、`application_document_read("materials/format.pptx")` の結果を `context.files.template` に記録します。完成稿も同様に `draft` へ入れます。対応形式はPDF/PPTX/DOCX/TXT/MD、15MB・100ページまで。DOCX/TXT/MDの改ページ、図・画像・配置は未確認です。
4. `application_workflow(stage="compose")` で原本に合わせて作成、`review` で完成稿を点検します。原本の描画確認はクライアント側で行い、できなければ未実施と明示します。
5. 引用・理由・重大度・直し方・未確認範囲を `application_review_save(binding, result)` で保存します。材料・ファイル・支援資料が変わると `review_current` は false になります。true も審査合格や内容の妥当性を意味しません。

`materials/application-context.json` はサイトの「応募書類を作る・点検する」で読み込めます。原本はJSONに含まれないので別途保管・添付します。旧版から更新した場合は新しい依存パッケージも上記の導入コマンドで入れてください。
