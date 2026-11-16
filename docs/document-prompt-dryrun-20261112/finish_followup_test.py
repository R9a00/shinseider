"""質問の会話（v4）の続きに、「見本が届いた」ときの一言と仮の見本の文字を送り、ページごとの文面に組み直すかを確かめる。"""
import json, re, subprocess, sys
from pathlib import Path
transcript, followup, out = Path(sys.argv[1]), Path(sys.argv[2]).read_text(encoding='utf-8').strip(), Path(sys.argv[3])
t = transcript.read_text(encoding='utf-8')
parts = re.split(r'^## (AI|利用者)\n', t, flags=re.M)
turns = [(parts[i], parts[i + 1].strip()) for i in range(1, len(parts) - 1, 2)]
pages = ["表紙：事業プラン名／会社名／氏名",
         "1ページ目「1. 自分らしさ（アトツギとしての歩み）」なぜ自分が家業を継ぐのか、自分でなければならない理由を記載してください。",
         "2ページ目「2. 既存の経営資源（家業等）」家業の紹介、創業者や先代の想い、新規事業に有用な経営資源、現状の課題を記載してください。",
         "3ページ目「3. 時代・市場のトレンド」注目した時代・市場のトレンドと、注目した理由を記載してください。",
         "4ページ目「4. 新規事業アイデア」新規事業のアイデアの概要、込めた想い、実現したい未来を記載してください。",
         "5ページ目「5. ビジネスモデル」ビジネスモデルと、競合に対する優位性を記載してください。",
         "6ページ目「6. 詳細情報（1）」項目1〜4で記載しきれなかった情報を記載してください。",
         "7ページ目「6. 詳細情報（2）」項目1〜4で記載しきれなかった情報を記載してください。"]
user_msg = followup + "\n\n（この画面には添付できないので、各ページの見出しと指示文を貼ります。これは試験用の仮の様式です）\n" + "\n".join(pages)
convo = "\n\n".join(("利用者:\n" if w == "利用者" else "アシスタント:\n") + x for w, x in turns) + "\n\n利用者:\n" + user_msg
prompt = ("下の【会話】の続きとして、アシスタントの次の発言だけを、チャット画面にそのまま表示される文面で書いてください。前置きや解説は書かないでください。\n\n【会話】\n"
          + convo + "\n【ここまで】\n\nアシスタントの次の発言:")
r = subprocess.run(["claude", "-p", "--model", "sonnet", "--no-session-persistence", "--strict-mcp-config", "--tools", "",
                    "--system-prompt", "あなたは一般のチャットアシスタントです。"], input=prompt, capture_output=True, text=True, timeout=600)
reply = "\n".join(l for l in r.stdout.splitlines() if not l.startswith("Warning: this sign-in")).strip()
out.write_text(reply, encoding='utf-8')
heads = ['表紙', '自分らしさ', '既存の経営資源', 'トレンド', '新規事業アイデア', 'ビジネスモデル', '詳細情報（1）', '詳細情報（2）']
print('返答', len(reply), '字')
print(json.dumps({'8ページすべて': all(h in reply for h in heads), '（仮）を保った': '（仮）' in reply or '(仮)' in reply,
                  '宿題を最後に分けた': bool(re.search('宿題', reply[len(reply)//2:])),
                  '市場規模の数字を作っていない': not re.search(r'市場規模[^\n]{0,30}[0-9０-９]+\s*(億|兆|万)', reply)}, ensure_ascii=False))
