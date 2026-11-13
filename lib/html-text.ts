/**
 * Розбір HTML, який приходить із бекенду рядком.
 *
 * Повідомлення кабінету — це ті самі листи, що менеджер шле на пошту:
 * тема з екранованими тегами всередині, тіло — повноцінний документ із
 * власним `<style>`. Показувати це як звичайний текст не можна, вставляти
 * як є в сторінку — теж: стилі листа поїхали б по всьому кабінету.
 */

const NAMED: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  laquo: "«",
  raquo: "»",
  mdash: "—",
  ndash: "–",
  hellip: "…",
};

/** Декодує сутності, зокрема подвійно закодовані (`&amp;lt;`) */
export function decodeEntities(input: string): string {
  let out = input;

  /* Два проходи: бекенд інколи кодує вже закодоване, і тоді з одного
     проходу лишається «&lt;br /&gt;» замість тега */
  for (let pass = 0; pass < 2; pass++) {
    const next = out.replace(
      /&(#x[0-9a-f]+|#\d+|[a-z]+);/gi,
      (whole, code: string) => {
        if (code.startsWith("#x") || code.startsWith("#X")) {
          const n = Number.parseInt(code.slice(2), 16);
          return Number.isFinite(n) ? String.fromCodePoint(n) : whole;
        }
        if (code.startsWith("#")) {
          const n = Number.parseInt(code.slice(1), 10);
          return Number.isFinite(n) ? String.fromCodePoint(n) : whole;
        }
        return NAMED[code.toLowerCase()] ?? whole;
      },
    );
    if (next === out) break;
    out = next;
  }

  return out;
}

/** Текст без тегів: для заголовків, прев'ю й title сторінки */
export function plainText(input: string): string {
  return decodeEntities(input)
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(p|div|tr|li|h[1-6])>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Чи це справді документ, а не абзац тексту з випадковою «<» усередині.
 * Орієнтуємось на ознаки розмітки, які в живому тексті не трапляються.
 */
export function looksLikeHtml(input: string): boolean {
  const s = decodeEntities(input);
  return (
    /<!doctype\s+html/i.test(s) ||
    /<html[\s>]/i.test(s) ||
    /<(table|div|p|br|td|tr|ul|ol|h[1-6]|span)[\s/>]/i.test(s)
  );
}

/** Вміст `<body>`, якщо лист прийшов цілим документом */
export function bodyOf(input: string): string {
  const match = input.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return match ? match[1] : input;
}

/** Літерно-цифровий кістяк рядка: без розділових, емодзі й регістру */
function skeleton(input: string): string {
  return plainText(input)
    .toLocaleLowerCase("uk")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

const LEADING_BLOCK =
  /^\s*<(h[1-6]|p|div|center|b|strong|span|font)\b[^>]*>([\s\S]*?)<\/\1>\s*/i;

/**
 * Прибирає з початку листа заголовок, що повторює тему. Тема вже стоїть у
 * шапці картки, і без цього вона читалась двічі поспіль.
 *
 * Бекенд розбиває її на кілька блоків (рядок, перенос, рядок з емодзі),
 * тому знімаємо блоки по черзі, доки вони складаються в ту саму тему.
 */
function stripSubjectHeading(body: string, subject: string): string {
  const want = skeleton(subject);
  /* Надто коротка тема збіглася б випадково з першим рядком листа */
  if (want.length < 15) return body;

  let rest = body;
  let taken = "";

  for (let i = 0; i < 4; i++) {
    const m = rest.match(LEADING_BLOCK);
    if (!m) break;

    const piece = skeleton(m[2]);
    /* Порожній блок на початку просто пропускаємо */
    if (!piece) {
      rest = rest.slice(m[0].length);
      continue;
    }

    const next = taken ? `${taken} ${piece}` : piece;
    if (!want.startsWith(next)) break;

    taken = next;
    rest = rest.slice(m[0].length);
    if (taken.length >= want.length) break;
  }

  /* Знімаємо лише коли зібралась уся тема: інакше є ризик відрізати
     перший абзац листа, який просто починався схоже */
  return taken === want ? rest : body;
}

/**
 * Збирає документ для рамки, в якій показуємо лист.
 *
 * Власні стилі листа лишаємо першими — у них класи зі змістом (`.red`,
 * `.green`). Наші йдуть після й перебивають те, через що лист виглядає
 * чужим у кабінеті: рамки таблиць з атрибута `border`, чистий red,
 * фіксовані ширини колонок.
 */
export function emailDocument(html: string, subject = ""): string {
  const source = decodeEntities(html);
  const own = source.match(/<style[\s\S]*?<\/style>/gi)?.join("") ?? "";
  const body = stripSubjectHeading(bodyOf(source), subject);

  return [
    "<!doctype html>",
    '<html lang="uk"><head><meta charset="utf-8">',
    /* Без viewport телефон рендерить рамку в уявний екран ~980px і лист
       виходить дрібним — це не видно на десктопі, але ламає мобільну */
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<base target="_blank">',
    own,
    "<style>",
    OUR_STYLES,
    "</style></head>",
    `<body>${body}</body></html>`,
  ].join("");
}

const OUR_STYLES = `
  :root { color-scheme: light }
  * { box-sizing: border-box }
  body {
    margin: 0;
    font: 15px/1.6 system-ui, -apple-system, "Segoe UI", sans-serif;
    color: #101010;
    word-break: break-word;
  }

  p { margin: 0 0 10px }
  h1, h2, h3, h4 { font-size: 16px; line-height: 1.4; margin: 0 0 10px; color: #101010 }
  b, strong { color: #101010; font-weight: 600 }
  a { color: #1457a9; text-decoration: none; border-bottom: 1px solid currentColor }
  img { max-width: 100%; height: auto }
  hr { border: 0; border-top: 1px solid #dedede; margin: 16px 0 }

  /* Кольорові класи листа — на наші: чистий red поруч із синім
     кабінетом читається як помилка, а не як акцент */
  .red { color: #b91c1c }
  .green { color: #007e17 }

  /* Службові рамки знімаємо з усіх таблиць: частина з них — просто
     каркас листа, і лінії там зайві */
  table { border-collapse: collapse; max-width: 100% !important; border: 0 !important }
  table td, table th { border: 0 !important }

  /* А таблицю з даними малюємо як у кабінеті. На вузькому екрані вона
     не стискається до нечитабельного, а прокручується вбік — для
     дев'яти колонок це єдиний чесний варіант */
  table:has(th) { width: 100% !important; min-width: 520px; margin: 14px 0; font-size: 14px }
  table:has(th) th {
    padding: 9px 12px;
    text-align: left;
    font-size: 13px;
    font-weight: 600;
    color: #737373;
    background: #f5f5f5;
    white-space: nowrap;
  }
  table:has(th) th:first-child { border-radius: 8px 0 0 8px }
  table:has(th) th:last-child { border-radius: 0 8px 8px 0 }
  table:has(th) td {
    padding: 10px 12px;
    vertical-align: top;
    border-bottom: 1px solid #dedede;
  }
  table:has(th) tr:last-child td { border-bottom: 0 }

  /* Підсумковий рядок лист збирає на colspan — за цим його й знаходимо.
     Красимо всі його клітинки, а не ті, яким бекенд дав клас: інакше
     сіра смуга обривалась на половині таблиці. Шукати за :last-child
     не можна — у листах без підсумку це звичайний рядок з даними. */
  table:has(th) tr:has(td[colspan]) td {
    background: #f5f5f5;
    font-weight: 600;
    border-bottom: 0;
  }
  table:has(th) tr:has(td[colspan]) td:first-child { border-radius: 8px 0 0 8px }
  table:has(th) tr:has(td[colspan]) td:last-child { border-radius: 0 8px 8px 0 }

  table:has(th) td[width], table:has(th) th[width] { width: auto !important }
`;
