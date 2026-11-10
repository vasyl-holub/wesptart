import { gql } from "@/lib/api/graphql";
import { getApiAuth } from "@/lib/api/session";
import { dateRange, text } from "@/lib/api/filters";

/* «Замовлені позиції»: той самий зріз, що й у старому кабінеті — усі
   позиції клієнта наскрізь по замовленнях, а не в межах одного. */

export type OrderedItem = {
  id: string;
  status: number | null;
  count: number;
  /** Ціна закупівлі у WestPart */
  price: number | null;
  total: number | null;
  /** Ціна, за якою позицію продає сам клієнт */
  priceOut: string | null;
  totalOut: string | null;
  deliveryDays: number;
  arrival: string | null;
  comment: string;
  order: { id: string; number: number | null; created: string } | null;
  product: {
    id: string;
    slug: string;
    name: string;
    num: string;
    brand: string | null;
  } | null;
};

export type OrderedItemsPage = {
  items: OrderedItem[];
  totalCount: number;
  pagesCount: number;
};

const EMPTY: OrderedItemsPage = { items: [], totalCount: 0, pagesCount: 0 };

export type OrderedItemFilters = {
  /** Артикул запчастини */
  article?: string;
  /** Назва товару, пошук за частиною */
  name?: string;
  /** Номер замовлення, у якому стоїть позиція */
  orderNumber?: number;
  statuses?: string[];
  /** Період, коли позицію замовили */
  from?: string;
  to?: string;
};

const ITEM_FIELDS = /* GraphQL */ `
  id
  status
  count
  price
  total
  priceOut
  totalOut
  deliveryDays
  arrival
  comment
  order {
    id
    number
    created
  }
  product {
    id
    slug
    name
    num
    manufacturer {
      name
    }
  }
`;

const ORDER_ITEMS = /* GraphQL */ `
  query OrderedItems(
    $page: Int!
    $perPage: Int!
    $statuses: [String]
    $productNum: String
    $productName: String
    $orderNumber: Decimal
    $madeBetween: DateRangeFieldInput
  ) {
    orderItemAll(
      page: $page
      perPage: $perPage
      statuses: $statuses
      product_Num: $productNum
      product_Name: $productName
      order_Number: $orderNumber
      madeBetween: $madeBetween
      sort: "-id"
    ) {
      totalCount
      pagesCount
      edges {
        ${ITEM_FIELDS}
      }
    }
  }
`;

type RawItem = {
  id: string;
  status: number | null;
  count: number | null;
  price: number | null;
  total: number | null;
  priceOut: string | null;
  totalOut: string | null;
  deliveryDays: number | null;
  arrival: string | null;
  comment: string | null;
  order: { id: string; number: number | null; created: string } | null;
  product: {
    id: string;
    slug: string;
    name: string | null;
    num: string | null;
    manufacturer: { name: string | null } | null;
  } | null;
};

type ItemsResponse = {
  orderItemAll: {
    totalCount: number | null;
    pagesCount: number | null;
    edges: RawItem[];
  } | null;
};

function mapItem(i: RawItem): OrderedItem {
  return {
    id: i.id,
    status: i.status,
    count: i.count ?? 0,
    price: i.price,
    total: i.total,
    priceOut: i.priceOut,
    totalOut: i.totalOut,
    deliveryDays: i.deliveryDays ?? 0,
    arrival: i.arrival,
    comment: i.comment ?? "",
    order: i.order,
    product: i.product
      ? {
          id: i.product.id,
          slug: i.product.slug,
          name: i.product.name ?? "",
          num: i.product.num ?? "",
          brand: i.product.manufacturer?.name ?? null,
        }
      : null,
  };
}

function itemVariables(filters: OrderedItemFilters) {
  return {
    statuses: filters.statuses?.length ? filters.statuses : undefined,
    productNum: text(filters.article),
    productName: text(filters.name),
    orderNumber: filters.orderNumber,
    madeBetween: dateRange(filters.from, filters.to),
  };
}

export async function getOrderedItems(
  page = 1,
  perPage = 20,
  filters: OrderedItemFilters = {},
): Promise<OrderedItemsPage> {
  const auth = await getApiAuth();
  if (!auth) return EMPTY;

  try {
    const data = await gql<ItemsResponse>(ORDER_ITEMS, {
      auth,
      variables: { page, perPage, ...itemVariables(filters) },
    });

    const conn = data.orderItemAll;
    if (!conn) return EMPTY;

    return {
      items: conn.edges.map(mapItem),
      totalCount: conn.totalCount ?? 0,
      pagesCount: conn.pagesCount ?? 0,
    };
  } catch {
    return EMPTY;
  }
}

/* --------------------------------------------------- Звіт за період */

export type PeriodStats = {
  /** Скільки позицій увійшло в підрахунок */
  itemsCount: number;
  /** Скільки різних замовлень їх містить */
  ordersCount: number;
  units: number;
  /** Закупівля у WestPart */
  purchases: number;
  /** Продаж цих самих позицій клієнтом */
  sales: number;
  /** Різниця; від'ємна, якщо клієнт не вів відпускні ціни */
  margin: number;
  /**
   * `true`, якщо позицій за період більше, ніж ми готові вивантажити одним
   * звітом: суми тоді пораховані по перших сторінках, а не по всьому періоду.
   */
  truncated: boolean;
};

/* Агрегатів у API немає, тому суми рахуємо самі. Сторінка по 200 позицій,
   не більше 25 сторінок — це 5000 позицій за період, чого з запасом
   досить для звіту, і при цьому запит не висне на великій історії. */
const STATS_PER_PAGE = 200;
const STATS_MAX_PAGES = 25;

function num(value: string | number | null): number {
  if (value === null) return 0;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export async function getPeriodStats(
  from: string,
  to: string,
): Promise<PeriodStats> {
  const empty: PeriodStats = {
    itemsCount: 0,
    ordersCount: 0,
    units: 0,
    purchases: 0,
    sales: 0,
    margin: 0,
    truncated: false,
  };

  const auth = await getApiAuth();
  if (!auth) return empty;

  const variables = { ...itemVariables({ from, to }), perPage: STATS_PER_PAGE };

  try {
    const first = await gql<ItemsResponse>(ORDER_ITEMS, {
      auth,
      variables: { ...variables, page: 1 },
    });

    const conn = first.orderItemAll;
    if (!conn) return empty;

    const pages = Math.min(conn.pagesCount ?? 1, STATS_MAX_PAGES);

    /* Решту сторінок тягнемо разом: послідовно звіт за рік чекав би
       надто довго, а сторінок тут щонайбільше 24 */
    const rest = await Promise.all(
      Array.from({ length: Math.max(pages - 1, 0) }, (_, i) =>
        gql<ItemsResponse>(ORDER_ITEMS, {
          auth,
          variables: { ...variables, page: i + 2 },
        }),
      ),
    );

    const raw = [conn.edges, ...rest.map((r) => r.orderItemAll?.edges ?? [])];
    const items = raw.flat();

    const orders = new Set<string>();
    let units = 0;
    let purchases = 0;
    let sales = 0;

    for (const i of items) {
      if (i.order) orders.add(i.order.id);
      units += i.count ?? 0;
      purchases += num(i.total);
      sales += num(i.totalOut);
    }

    return {
      itemsCount: conn.totalCount ?? items.length,
      ordersCount: orders.size,
      units,
      purchases,
      sales,
      margin: sales - purchases,
      truncated: (conn.pagesCount ?? 1) > STATS_MAX_PAGES,
    };
  } catch {
    return empty;
  }
}
