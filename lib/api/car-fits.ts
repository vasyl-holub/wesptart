import { gql } from "@/lib/api/graphql";

/**
 * Застосовність товару: на які авто він стає.
 *
 * У коментарі на сторінці товару довго стояло, що API такого не віддає.
 * Це стосувалось `simpleCars` — там справді для будь-якого артикула
 * повертались одні й ті самі 99 535 записів. А ось `product.cars`
 * фільтрується правильно: у FEBI 02244 рівно 122 модифікації AUDI і VW,
 * у FEBI 02248 — 56 мерседесів, у TEKNOROT A103K — жодної.
 *
 * Пастка: `product.cars` не приймає ні `perPage`, ні `limit`, ні
 * `orderBy` — резолвер падає на будь-якому аргументі. Тому список
 * приходить цілком, а в найширших деталей він великий: у колодок TRW
 * GDB1330 це 1884 модифікації. Через це застосовність не вантажиться
 * разом зі сторінкою, а довантажується, коли її справді відкривають.
 */

/** Одна модифікація: «1.8 GTE», 1984–1986, 112 к.с. */
export type CarFitRow = {
  name: string;
  years: string | null;
  power: string | null;
};

export type CarFitModel = { model: string; rows: CarFitRow[] };
export type CarFitBrand = { brand: string; models: CarFitModel[] };

export type CarFits = {
  total: number;
  /** Короткий рядок для підказки: «AUDI 80, 90 · VW PASSAT» */
  summary: string;
  brands: CarFitBrand[];
};

const CARS = /* GraphQL */ `
  query ProductCars($id: ID) {
    product(id: $id) {
      haveCars
      cars {
        totalCount
        edges {
          name
          yearStart
          yearEnd
          hpFrom
          hpTo
          model {
            name
            brand {
              name
            }
          }
        }
      }
    }
  }
`;

type Response = {
  product: {
    haveCars: boolean | null;
    cars: {
      totalCount: number | null;
      /* Бекенд оголосив CarNode.model обовʼязковим, але у частини авто
         моделі немає: GraphQL тоді гасить увесь елемент у null. У колодок
         TRW GDB1330 таких 77 із 1884 */
      edges: ({
        name: string | null;
        yearStart: number | null;
        yearEnd: number | null;
        hpFrom: number | null;
        hpTo: number | null;
        model: {
          name: string | null;
          brand: { name: string | null } | null;
        } | null;
      } | null)[];
    } | null;
  } | null;
};

function yearsOf(from: number | null, to: number | null) {
  if (!from && !to) return null;
  if (from && to) return from === to ? `${from}` : `${from}–${to}`;
  return from ? `з ${from}` : `до ${to}`;
}

function powerOf(from: number | null, to: number | null) {
  if (!from && !to) return null;
  /* У базі часто заповнена лише нижня межа — тоді діапазон не малюємо */
  const text = from && to && from !== to ? `${from}–${to}` : `${from || to}`;
  return `${text} к.с.`;
}

/** «AUDI 80, 90, COUPE · VW PASSAT» — не більше трьох марок */
function summarize(brands: CarFitBrand[]) {
  const head = brands.slice(0, 3).map((b) => {
    /* У підсумку кузов зайвий: «80 (80, 82, B1)» і «80 (81, 85, B2)» це
       та сама вісімдесятка, і три рядки поспіль про неї нічого не
       додають. Повні назви лишаються у вікні з переліком. */
    const names = [...new Set(b.models.map((m) => m.model.split(" (")[0]))];
    const shown = names.slice(0, 3);
    const tail = names.length > shown.length ? " та інші" : "";
    return `${b.brand} ${shown.join(", ")}${tail}`;
  });

  return head.join(" · ") + (brands.length > 3 ? " · та інші марки" : "");
}

export async function getCarFits(productId: string): Promise<CarFits | null> {
  let data: Response;
  try {
    data = await gql<Response>(CARS, {
      variables: { id: productId },
      /* Застосовність не залежить від користувача й майже не змінюється,
         тому тримаємо її в кеші добу: інакше кожне відкриття вікна било
         б у бекенд запитом на півтори тисячі рядків */
      revalidate: 86_400,
      tags: ["car-fits"],
    });
  } catch {
    return null;
  }

  const cars = data.product?.cars?.edges ?? [];
  if (!cars.length) return { total: 0, summary: "", brands: [] };

  /* Групуємо марка → модель → модифікації. Однакові рядки трапляються:
     та сама модифікація приходить окремо під різні кузови */
  const byBrand = new Map<string, Map<string, Map<string, CarFitRow>>>();

  for (const car of cars) {
    if (!car) continue;

    const brand = car.model?.brand?.name?.trim();
    const model = car.model?.name?.trim();
    if (!brand || !model) continue;

    const row: CarFitRow = {
      name: car.name?.trim() || "—",
      years: yearsOf(car.yearStart, car.yearEnd),
      power: powerOf(car.hpFrom, car.hpTo),
    };

    const models = byBrand.get(brand) ?? new Map();
    byBrand.set(brand, models);
    const rows = models.get(model) ?? new Map<string, CarFitRow>();
    models.set(model, rows);
    rows.set(`${row.name}|${row.years}|${row.power}`, row);
  }

  const collator = new Intl.Collator("uk");
  const brands: CarFitBrand[] = [...byBrand.entries()]
    .map(([brand, models]) => ({
      brand,
      models: [...models.entries()]
        .map(([model, rows]) => ({
          model,
          rows: [...rows.values()].sort((a, b) =>
            collator.compare(a.name, b.name),
          ),
        }))
        .sort((a, b) => collator.compare(a.model, b.model)),
    }))
    .sort((a, b) => collator.compare(a.brand, b.brand));

  /* Рахуємо те, що справді показуємо: `totalCount` включає і записи без
     моделі, і дублі однієї модифікації під різними кузовами */
  const total = brands.reduce(
    (sum, b) => sum + b.models.reduce((n, m) => n + m.rows.length, 0),
    0,
  );

  return { total, summary: summarize(brands), brands };
}
