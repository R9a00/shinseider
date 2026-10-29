"""UI と MCP が同じ正本から指示文を作る。保存データには触れない。"""


def interview_prompt(data):
    lines = [f"{i}. {s['title']} — " + "／".join(s['elements']) for i, s in enumerate(data['entry_sections'], 1)]
    return data['prompt_template'].replace('{theme_elements}', "\n".join(lines))

def review_prompt(data):
    lines = [f"- {a['title']} — {a['question']}" for a in data['official_preparation']['review_axes']]
    return data['review_prompt_template'].replace('{official_review_axes}', "\n".join(lines))

def preparation_guide(data):
    g = data['official_preparation']
    return (g['distinction'] + "\n" + g['format'] + "\n" + "\n".join(g['workflow']) + "\n" +
            "\n".join(f"- {i['title']}: {i['material']}" for i in g['items']) + "\n出典: " + g['source_url'])


def chapter_prompt(data, chapter_no):
    number = int(chapter_no)
    if not 1 <= number <= len(data['groups']):
        raise ValueError('章番号は1〜4で指定してください。')
    group = data['groups'][number - 1]
    structure = '\n'.join(
        f"- {block['key']}「{block['title']}」:" + '/'.join(
            f"{field['key']}={field['label']}" + ('' if field.get('required') else '*')
            for field in block['fields'])
        for block in group['blocks'])
    return (data['chapter_prompt'].replace('{chapter_no}', str(number))
            .replace('{chapter_title}', group['title']).replace('{structure}', structure))
