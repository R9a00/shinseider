"""公開する指示文を、道具なしの素のチャットAIに渡して最後まで会話させる試験。
聞き手AIと、架空の後継者役（知っている事実だけを短く答える）を交互に呼ぶ。"""
import json
import re
import subprocess
import sys
import time
from pathlib import Path

out = Path(sys.argv[1])
prompt = Path(sys.argv[2]).read_text(encoding='utf-8')
tag = sys.argv[3]

PERSONA = """あなたは、ある中小企業の後継予定者（33歳）です。AIのインタビューに答えています。忙しく、文章は得意ではありません。

答え方:
- 聞かれたことにだけ、1〜3文で短く答える。先回りして情報を足さない。
- 一度に複数の質問をされたら、最初の1つにだけ答える。
- 下の「知っていること」に無いことは「わからないです」と答える。数字や実績を作らない。
- 丁寧語。箇条書きは使わない。
- AIが最後のまとめ（表紙案や宿題の一覧）を出したら「ありがとうございます。」とだけ答える。
- あなたは答える側の本人です。聞き手の言い回し（「受け取りました」「宿題に残します」「次の質問です」など）を使わない。質問文を書かない。相手の発言をなぞらない。

知っていること:
- サンプルフォーマットはまだ手元にない（エントリーはこれから）。
- 家業は金属加工。産業機械向けの単品加工が中心。祖父が1974年に創業し、港湾設備の補修部品から始めた。従業員18名、年商2.4億円。
- 自分は入社8年目で製造を見ている。2011年に父（現社長）が入れたCAD/CAMの運用を任されてきた。承継は3年後の予定。
- 大学を出て機械商社で3年働いた。祖父が倒れたのをきっかけに戻った。
- 悩み: 父と新しいことの話がしにくい。若手の採用ができていない（この2年、応募はゼロ）。
- 現場の課題: 昨年、長年の取引先だった試作専門の同業が廃業した。地域で単品・小ロットを頼める先が減り、見積もりを取ると納期は7〜10日かかる。試作で待たされて開発案件が流れるのを何度も見た。
- やりたい新規事業: 単品部品のオンライン受注。設計データを送ると自動で見積もりが返り、最短3日で部品が届く。相手は、メーカーの開発部門やスタートアップの試作担当者。
- 家業の資源: 過去10年の加工実績から見積もりを計算式にしてあり、誤差は±20%から実用できる水準まで詰めた。5軸加工機が1台ある。段取りのノウハウがあり、受注から出荷まで平均3.2日。
- お金: 1件あたり平均8万円くらいを見込んでいる（まだ仮）。初年度は月30件が目標。粗利は、いまの単品加工で3割くらい。受注画面の開発に300万円くらいかかる見込み（仮）。自己資金でやるつもり。
- 検証: 知り合いの設計会社2社に試してもらい、これまでに計5件を受注して納めた。代金はもらっている。受注サイトは試作版。正式公開は2027年春の予定。
- 競合: 大手のオンライン部品加工サービスがある。違いは、難しい形状でも人が段取りを見ること、地域なら引き取りと相談ができること。
- 体制: 自分と若手社員1人。
- 心配: 受注が増えると、既存の仕事と機械の取り合いになる。
- 実現したい未来: 試作で待たされない地域にしたい。若手が入りたくなる会社にしたい。
- 市場規模、原価の細かい内訳、補助金の予定は、わからない。"""

HEAD_A = ("下の【会話】の続きとして、アシスタントの次の発言だけを、チャット画面にそのまま表示される文面で書いてください。"
          "前置きや解説は書かないでください。\n\n【会話】\n")
HEAD_U = "下の【会話】は、AI（アシスタント）とあなた（利用者）の会話です。あなたの次の発言だけを書いてください。\n\n【会話】\n"


def call(system, text):
    t0 = time.time()
    r = subprocess.run(["claude", "-p", "--model", "sonnet", "--no-session-persistence", "--strict-mcp-config",
                        "--tools", "", "--system-prompt", system],
                       input=text, capture_output=True, text=True, timeout=300)
    lines = [l for l in r.stdout.splitlines() if not l.startswith("Warning: this sign-in")]
    return "\n".join(lines).strip(), round(time.time() - t0, 1)


def render(turns):
    return "\n\n".join(("利用者:\n" if who == "user" else "アシスタント:\n") + text for who, text in turns)


turns = [("user", prompt)]
log = []
final = False
for i in range(30):
    a, sec = call("あなたは一般のチャットアシスタントです。", HEAD_A + render(turns) + "\n【ここまで】\n\nアシスタントの次の発言:")
    turns.append(("assistant", a))
    log.append({"turn": i + 1, "who": "assistant", "sec": sec, "chars": len(a)})
    print(f"A{i + 1}: {len(a)}字 {sec}s", flush=True)
    final = len(a) > 1200 and "宿題" in a and "表紙" in a
    if final or not a:
        break
    u, sec = call(PERSONA, HEAD_U + render(turns[1:]) + "\n【ここまで】\n\nあなた（利用者）の次の発言:")
    turns.append(("user", u))
    log.append({"turn": i + 1, "who": "user", "sec": sec, "chars": len(u)})

out.mkdir(parents=True, exist_ok=True)
(out / f"transcript_{tag}.md").write_text(
    "\n\n".join(("## 利用者\n" if w == "user" else "## AI\n") + t for w, t in turns), encoding="utf-8")
(out / f"log_{tag}.json").write_text(json.dumps(log, ensure_ascii=False, indent=1), encoding="utf-8")

a_turns = [l for l in log if l["who"] == "assistant"]
questions = [text for who, text in turns[1:] if who == "assistant"]
if final:
    questions = questions[:-1]
asked = "\n".join(questions)
MUST = {"家業の何を使うか": r"家業の(何|どんな|どの)|(資源|強み|技術|設備|ノウハウ|実績).{0,30}(使|活か|生か)",
        "単価×件数": r"単価|いくら",
        "対価をもらったか": r"対価|有償|無償|お金をもら|代金",
        "誰がやるか": r"誰が(やる|担当|進め)|体制|何人",
        "資金": r"資金|投資",
        "リスク": r"リスク|心配|懸念"}
user_text = "\n".join(text for who, text in turns[1:] if who == "user")
FACTS = {"見積もりの計算式": "計算式", "単価8万円": "8万", "月30件": "30件", "粗利3割": "3割",
         "開発300万円": "300万", "自己資金": "自己資金", "体制2人": "若手", "代金をもらった": "代金",
         "同業の廃業": "廃業", "納期7〜10日": "7〜10", "5軸加工機": "5軸", "平均3.2日": "3.2", "競合との違い": "引き取り"}
answers = [text for who, text in turns[1:] if who == "user"]
print("DONE questions:", len(questions), "| finished with summary:", final, "| final chars:", a_turns[-1]["chars"])
print("MUST-ASK:", json.dumps({k: bool(re.search(v, asked)) for k, v in MUST.items()}, ensure_ascii=False))
print("FACTS ELICITED:", json.dumps({k: (v in user_text) for k, v in FACTS.items()}, ensure_ascii=False))
print("WAKARANAI answers:", sum(1 for t in answers if "わからない" in t), "/", len(answers))
print("AVG question message chars:", round(sum(len(q) for q in questions) / max(1, len(questions))))
print("TOTAL seconds of AI replies:", round(sum(l["sec"] for l in a_turns)))
