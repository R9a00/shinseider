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

所要は数分。撤去はいつでもできます（最後に方法を案内します）。シンセイダーは非公式・無償のツールで、入力・記録は利用者のパソコンにだけ保存され、外部に送信されません。

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
.venv/bin/pip install "mcp[cli]" pyyaml
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
- Codex / ChatGPT: `codex mcp list` に `shinseider … enabled` が出る。アプリ側は完全終了→再起動後、MCPサーバー一覧に現れる。
- Claudeデスクトップも完全終了→再起動が必要。
- 最終確認: 新しい会話で「アトツギ甲子園の締切は？」と聞き、`get_deadlines` ツールが呼ばれて具体的な日付が返れば完了。

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
