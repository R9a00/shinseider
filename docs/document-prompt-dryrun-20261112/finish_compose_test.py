"""サイトに元からある「見本に合わせて作る」指示が、材料と見本の文字を受け取って、ページごとの原稿を出すかの試験。
見本は本物が手に入らないため、試験用の仮の様式（ページ割りは仮定）を使う。"""
import hashlib, json, re, subprocess, sys
from pathlib import Path
root, out, transcript = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
sys.path.insert(0, str(root))
import application_context as application

t = transcript.read_text(encoding='utf-8')
material = re.split(r'^## (?:AI|利用者)\n', t, flags=re.M)[-1].strip()   # 質問の試験でAIが最後に出した素材

pages = ["表紙\n事業プラン名：\n会社名：\n氏名：",
         "1. 自分らしさ（アトツギとしての歩み）\nなぜ自分が家業を継ぐのか、自分でなければならない理由を記載してください。",
         "2. 既存の経営資源（家業等）\n家業の紹介、創業者や先代の想い、新規事業に有用な経営資源、現状の課題を記載してください。",
         "3. 時代・市場のトレンド\n注目した時代・市場のトレンドと、注目した理由を記載してください。",
         "4. 新規事業アイデア\n新規事業のアイデアの概要、込めた想い、実現したい未来を記載してください。",
         "5. ビジネスモデル\nビジネスモデルと、競合に対する優位性を記載してください。",
         "6. 詳細情報（1）\n項目1〜4で記載しきれなかった情報を記載してください。",
         "6. 詳細情報（2）\n項目1〜4で記載しきれなかった情報を記載してください。"]
context = application.blank()
context['reference'] = "【AIとの対話で作った素材（本人の発言にもとづく。未確認の数字は（仮））】\n" + material
context['files']['template'] = {
    'name': '試験用の仮の様式.pptx', 'sha256': hashlib.sha256('\n'.join(pages).encode()).hexdigest(),
    'pages': [{'number': i + 1, 'text': p} for i, p in enumerate(pages)],
    'warnings': ['図・写真・配置は原本での視覚確認が必要です']}
guide = application.rules(root)
prompt = application.prompt('compose', context, guide)
(out / 'compose_prompt.txt').write_text(prompt, encoding='utf-8')
print('指示文の長さ', len(prompt), '字')

def call(text):
    r = subprocess.run(["claude", "-p", "--model", "sonnet", "--no-session-persistence", "--strict-mcp-config",
                        "--tools", "", "--system-prompt", "あなたは一般のチャットアシスタントです。"],
                       input=text, capture_output=True, text=True, timeout=600)
    return "\n".join(l for l in r.stdout.splitlines() if not l.startswith("Warning: this sign-in")).strip()

first = call(prompt)
(out / 'compose_reply1.md').write_text(first, encoding='utf-8')
print('1回目の返答', len(first), '字 | 添付を求めた:', bool(re.search('添付', first[:600])))
second = ''
if len(first) < 1500 or re.search('添付(して|を)', first[:400]):
    follow = ("下の【会話】の続きとして、アシスタントの次の発言だけを書いてください。\n\n【会話】\n利用者:\n" + prompt +
              "\n\nアシスタント:\n" + first +
              "\n\n利用者:\nこの画面にはファイルを添付できません。文脈データに入っている様式の文字（8ページ分）だけを使って、ページごとの原稿を作ってください。\n【ここまで】\n\nアシスタントの次の発言:")
    second = call(follow)
    (out / 'compose_reply2.md').write_text(second, encoding='utf-8')
    print('2回目の返答', len(second), '字')
final = second or first
checks = {'8ページ分の見出し': all(k in final for k in ['自分らしさ', '既存の経営資源', 'トレンド', '新規事業アイデア', 'ビジネスモデル', '詳細情報']),
          '表紙': '表紙' in final, '宿題・未確認を分けた': bool(re.search('宿題|未確認', final)),
          '（仮）を保った': '（仮）' in final or '(仮)' in final,
          '素材に無い数字を足していない（市場規模）': not re.search(r'市場規模[^\n]{0,30}[0-9０-９]+\s*(億|兆|万)', final)}
print(json.dumps(checks, ensure_ascii=False))
