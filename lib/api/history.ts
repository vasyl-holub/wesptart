import { gql, gqlRaw } from "@/lib/api/graphql";
import { getApiAuth } from "@/lib/api/session";

/**
 * Ціни тут свідомо немає: у `SimpleProductNode` поле `price` падає
 * серверною помилкою `'Product' object has no attribute
 * 'get_best_price_for'`, а `priceMin`/`priceMax` віддають «0.00».
 * Актуальну ціну користувач побачить у картці товару.
 *
 * Історія переглядів прив'язана до сесії Django, тому пишеться і для
 * незалогінених. Показуємо її лише в кабінеті: анонімну сесію користувач
 * усе одно не побачить, а після входу вона стає його історією.
 */
export async function recordProductView(productId: string) {
  const auth = await getApiAuth();
  return gqlRaw<{ addHistoryProduct: { __typename: string } }>(
    /* GraphQL */ `
      mutation AddHistoryProduct($product: String!) {
        addHistoryProduct(product: $product) {
          __typename
        }
      }
    `,
    { auth, variables: { product: productId } },
  );
}

export type ViewedProduct = {
  id: string;
  viewedAt: string;
  productId: string;
  slug: string;
  num: string;
  name: string;
  brand: string | null;
};

export type ViewedPage = {
  items: ViewedProduct[];
  totalCount: number;
  pagesCount: number;
};

const EMPTY: ViewedPage = { items: [], totalCount: 0, pagesCount: 0 };

const VIEWED = /* GraphQL */ `
  query ViewedProducts($page: Int!, $perPage: Int!) {
    historyProductAll(page: $page, perPage: $perPage, sort: "-created") {
      totalCount
      pagesCount
      edges {
        id
        created
        product {
          id
          slug
          num
          name
          manufacturer {
            name
          }
        }
      }
    }
  }
`;

export async function getViewedProducts(
  page = 1,
  perPage = 20,
): Promise<ViewedPage> {
  const auth = await getApiAuth();
  if (!auth) return EMPTY;

  try {
    const data = await gql<{
      historyProductAll: {
        totalCount: number | null;
        pagesCount: number | null;
        edges: {
          id: string;
          created: string;
          product: {
            id: string;
            slug: string;
            num: string;
            name: string;
            manufacturer: { name: string } | null;
          } | null;
        }[];
      } | null;
    }>(VIEWED, { auth, variables: { page, perPage } });

    const conn = data.historyProductAll;
    if (!conn) return EMPTY;

    return {
      /* Товар могли прибрати з каталогу — такі записи пропускаємо */
      items: conn.edges.flatMap((e) =>
        e.product
          ? [
              {
                id: e.id,
                viewedAt: e.created,
                productId: e.product.id,
                slug: e.product.slug,
                num: e.product.num,
                name: e.product.name,
                brand: e.product.manufacturer?.name ?? null,
              },
            ]
          : [],
      ),
      totalCount: conn.totalCount ?? 0,
      pagesCount: conn.pagesCount ?? 0,
    };
  } catch {
    return EMPTY;
  }
}

/* ------------------------------------------------ Переглянуті авто */

export type ViewedCar = {
  id: string;
  viewedAt: string;
  /** Готовий підпис від бекенду; у ньому вже і бренд, і модифікація */
  title: string;
  /** Сторінки окремої модифікації в каталозі немає, тому ведемо на модель */
  href: string | null;
};

export type ViewedCarsPage = {
  items: ViewedCar[];
  totalCount: number;
  pagesCount: number;
};

const EMPTY_CARS: ViewedCarsPage = { items: [], totalCount: 0, pagesCount: 0 };

const VIEWED_CARS = /* GraphQL */ `
  query ViewedCars($page: Int!, $perPage: Int!) {
    historyCarAll(page: $page, perPage: $perPage, sort: "-created") {
      totalCount
      pagesCount
      edges {
        id
        created
        car {
          id
          name
          toStr
          yearStart
          yearEnd
          model {
            name
            slug
            brand {
              name
              slug
            }
          }
        }
      }
    }
  }
`;

type RawViewedCar = {
  id: string;
  created: string;
  car: {
    id: string;
    name: string | null;
    toStr: string | null;
    yearStart: number | null;
    yearEnd: number | null;
    model: {
      name: string | null;
      slug: string | null;
      brand: { name: string | null; slug: string | null } | null;
    } | null;
  } | null;
};

export async function getViewedCars(
  page = 1,
  perPage = 20,
): Promise<ViewedCarsPage> {
  const auth = await getApiAuth();
  if (!auth) return EMPTY_CARS;

  try {
    const data = await gql<{
      historyCarAll: {
        totalCount: number | null;
        pagesCount: number | null;
        edges: RawViewedCar[];
      } | null;
    }>(VIEWED_CARS, { auth, variables: { page, perPage } });

    const conn = data.historyCarAll;
    if (!conn) return EMPTY_CARS;

    return {
      /* Авто могли прибрати з довідника — такі записи пропускаємо */
      items: conn.edges.flatMap((e) => {
        const car = e.car;
        if (!car) return [];

        const brand = car.model?.brand;
        const model = car.model;

        /* toStr бекенд складає сам і зазвичай він найповніший; якщо його
           немає — збираємо підпис із бренду, моделі та модифікації */
        const title =
          car.toStr ||
          [brand?.name, model?.name, car.name].filter(Boolean).join(" ") ||
          "Авто";

        const years = [car.yearStart, car.yearEnd].filter(Boolean).join("–");

        return [
          {
            id: e.id,
            viewedAt: e.created,
            title: years ? `${title}, ${years}` : title,
            href:
              brand?.slug && model?.slug
                ? `/catalog/car/${brand.slug}/${model.slug}`
                : null,
          },
        ];
      }),
      totalCount: conn.totalCount ?? 0,
      pagesCount: conn.pagesCount ?? 0,
    };
  } catch {
    return EMPTY_CARS;
  }
}
