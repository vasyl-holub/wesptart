#!/usr/bin/env node
/**
 * Перевірка збереження адрес перед запуском редизайну (пункти 7 і 8 ТЗ).
 *
 * Бере вибірку адрес із карт сайту старого westpart.ua і проганяє їх по
 * вказаному хосту: кожна має або віддати 200, або привести на 200 одним
 * редиректом. Друкує розподіл по типах сторінок і перелік усього, що не
 * дійшло до 200.
 *
 *   node scripts/check-urls.mjs http://127.0.0.1:3144
 *   node scripts/check-urls.mjs https://westpart.ua
 *
 * Прапорці:
 *   --full        брати всі адреси з малих карт, а не вибірку
 *   --per=<n>     скільки адрес брати з кожної великої карти (типово 10)
 */

const OLD_SITE = "https://westpart.ua";
const INDEX = `${OLD_SITE}/sitemaps/sitemap.xml`;

/* Скільки адрес брати з кожної карти. Малі беремо цілком, великі —
   вибірку: прогнати 2,8 млн адрес неможливо, а шаблон у них один. */
const SMALL = new Set([
  "main1",
  "pages1",
  "content-article1",
  "catalog1",
  "brands1",
]);

const host = process.argv[2];
const full = process.argv.includes("--full");
const perArg = process.argv.find((a) => a.startsWith("--per="));
const PER = perArg ? Number(perArg.slice(6)) : 10;

if (!host) {
  console.error(
    "Вкажіть хост: node scripts/check-urls.mjs http://127.0.0.1:3000",
  );
  process.exit(1);
}

async function text(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.text();
}

function locs(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

/** Детермінована вибірка: рівномірно по всій карті, без випадковості */
function sample(list, n) {
  if (list.length <= n) return list;
  const step = list.length / n;
  return Array.from({ length: n }, (_, i) => list[Math.floor(i * step)]);
}

/**
 * Один прохід по ланцюжку редиректів. `redirect: "manual"` замість
 * `follow`, щоб порахувати кроки: ТЗ окремо згадує redirect chains.
 */
async function trace(path) {
  let url = host + path;
  for (let hops = 0; hops <= 5; hops++) {
    const res = await fetch(url, { redirect: "manual" });
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc) return { code: res.status, hops, final: url };
      url = new URL(loc, url).toString();
      continue;
    }
    return { code: res.status, hops, final: url };
  }
  return { code: 508, hops: 6, final: url };
}

const index = locs(await text(INDEX));
console.log(`Карт у індексі: ${index.length}`);

const targets = [];

for (const map of index) {
  const name = map.split("/").pop().replace(".xml", "");
  /* Карта зображень — не сторінки */
  if (name.startsWith("product_img")) continue;
  /* З однотипних серій досить першої: шаблон адреси в них однаковий */
  if (/^(parts|cars)([2-9]|\d\d)$/.test(name)) continue;

  let urls;
  try {
    urls = locs(await text(map));
  } catch (err) {
    console.log(`  ! не зміг прочитати ${name}: ${err.message}`);
    continue;
  }

  const take = full || SMALL.has(name) ? urls : sample(urls, PER);
  for (const u of take) {
    targets.push({ group: name, path: u.replace(OLD_SITE, "") });
  }
}

console.log(`Адрес до перевірки: ${targets.length}\n`);

const byGroup = new Map();
const failed = [];
const chains = [];

const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

async function traceSafe(path) {
  try {
    return await trace(path);
  } catch (err) {
    return { code: 0, hops: 0, final: err.message };
  }
}

for (const { group, path } of targets) {
  let r = await traceSafe(path);

  /* Сторінки категорій і товарів рендеряться на запит і під час рендеру
     звертаються до API. Серія швидких запитів поспіль іноді впирається в
     ліміт бекенду — тоді перша спроба дає 500. Повторюємо раз із паузою,
     щоб не звітувати про помилку, якої на живому сайті немає. */
  if (r.code !== 200) {
    await sleep(500);
    r = await traceSafe(path);
  }

  const key = `${r.code}/${r.hops}hop`;
  if (!byGroup.has(group)) byGroup.set(group, new Map());
  const g = byGroup.get(group);
  g.set(key, (g.get(key) ?? 0) + 1);

  if (r.code !== 200) failed.push({ group, path, code: r.code });
  if (r.hops > 1) chains.push({ path, hops: r.hops, final: r.final });
}

console.log("=== Розподіл по картах ===");
for (const [group, counts] of byGroup) {
  const parts = [...counts].map(([k, v]) => `${k} x${v}`).join(", ");
  console.log(`${group.padEnd(22)} ${parts}`);
}

console.log(
  `\nВсього ${targets.length} | 200: ${targets.length - failed.length} | не 200: ${failed.length} | ланцюжків >1 кроку: ${chains.length}`,
);

if (chains.length) {
  console.log("\n=== Ланцюжки довше одного кроку ===");
  for (const c of chains)
    console.log(`${c.hops} кроки  ${c.path} -> ${c.final}`);
}

if (failed.length) {
  console.log("\n=== Не дійшли до 200 ===");
  for (const f of failed) console.log(`${f.code}  ${f.path}  [${f.group}]`);
}

/* Ненульовий код виходу, щоб це можна було поставити в CI перед деплоєм */
process.exit(failed.length || chains.length ? 1 : 0);
