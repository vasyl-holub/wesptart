import { gql } from "@/lib/api/graphql";
import { getApiAuth } from "@/lib/api/session";

/** Пропозиція складу. `id` — саме те, що приймає addCartItem */
export type ProductOffer = {
  id: string;
  price: number | null;
  /** Залишок на складі */
  count: number | null;
  deliveryDays: string | null;
  canBuy: boolean;
};

export type Analogue = {
  id: string;
  slug: string;
  num: string;
  name: string;
  brand: string | null;
  image: string | null;
  /** Код якості виробника: O, Q, PC, PJB, PJ, P, ZJ, Z */
  quality: string | null;
  offer: ProductOffer;
};

export type Product = {
  id: string;
  code: string | null;
  num: string;
  name: string;
  slug: string;
  images: string[];
  brand: string | null;
  brandSlug: string | null;
  weight: number | null;
  rating: number;
  voteCount: number;
  commentQty: number;
  /** Найдешевша доступна пропозиція — її показуємо як основну ціну */
  bestOffer: ProductOffer | null;
  offers: ProductOffer[];
  specs: { label: string; value: string }[];
  crosses: { num: string; brand: string | null }[];
  /** Взаємозамінні товари, які реально можна купити */
  analogues: Analogue[];
  /** Код якості з характеристик — виносимо окремо для таблиці пропозицій */
  quality: string | null;
  /** Чи товар уже в обраному. Для аноніма бекенд віддає false */
  isFavorite: boolean;
};

type RawOffer = {
  id: string;
  priceOut: number | null;
  /** Ціна саме для цього користувача: з урахуванням його знижки */
  priceUser: number | null;
  count: number | null;
  deliveryDaysHumanize: string | null;
  canBuy: boolean | null;
};

type Response = {
  product: {
    id: string;
    code: string | null;
    num: string | null;
    name: string | null;
    slug: string | null;
    isInProductLike?: boolean | null;
    images: string[] | null;
    weight: string | null;
    rating: string | null;
    voteCount: number | null;
    commentQty: number | null;
    manufacturer: { name: string | null; slug: string | null } | null;
    price: RawOffer | null;
    prices: { edges: RawOffer[] } | null;
    specs: {
      edges: { value: string | null; spec: { name: string | null } | null }[];
    } | null;
    cross: {
      edges: {
        num: string | null;
        manufacturer: { name: string | null } | null;
        crossProduct: {
          id: string;
          num: string | null;
          name: string | null;
          slug: string | null;
          images: string[] | null;
          manufacturer: { name: string | null } | null;
          specs: {
            edges: {
              value: string | null;
              spec: { name: string | null } | null;
            }[];
          } | null;
          price: RawOffer | null;
        } | null;
      }[];
    } | null;
  } | null;
};

const PRODUCT = /* GraphQL */ `
  query Product($id: ID) {
    product(id: $id) {
      id
      code
      num
      name
      slug
      images
      weight
      rating
      voteCount
      commentQty
      isInProductLike
      manufacturer {
        name
        slug
      }
      price {
        id
        priceOut
        priceUser
        count
        deliveryDaysHumanize
        canBuy
      }
      prices {
        edges {
          id
          priceOut
          priceUser
          priceUser
          count
          deliveryDaysHumanize
          canBuy
        }
      }
      specs {
        edges {
          value
          spec {
            name
          }
        }
      }
      cross {
        edges {
          num
          manufacturer {
            name
          }
          crossProduct {
            id
            num
            name
            slug
            images
            manufacturer {
              name
            }
            specs {
              edges {
                value
                spec {
                  name
                }
              }
            }
            price {
              priceOut
              priceUser
              count
              canBuy
              deliveryDaysHumanize
            }
          }
        }
      }
    }
  }
`;

/** Назви характеристик приходять із хвостовим \r і двокрапкою */
function cleanLabel(name: string) {
  return name.replace(/\s+$/g, "").replace(/:$/, "").trim();
}

/** Код якості лежить серед звичайних характеристик, під назвою «Якість» */
function qualityOf(
  specs:
    | { value: string | null; spec: { name: string | null } | null }[]
    | undefined,
) {
  const hit = (specs ?? []).find((s) =>
    cleanLabel(s.spec?.name ?? "")
      .toLowerCase()
      .startsWith("якість"),
  );
  return hit?.value?.trim() || null;
}

function toOffer(raw: RawOffer): ProductOffer {
  return {
    id: raw.id,
    price: raw.priceUser ?? raw.priceOut,
    count: raw.count,
    deliveryDays: raw.deliveryDaysHumanize?.trim() || null,
    canBuy: raw.canBuy ?? false,
  };
}

export async function getProduct(id: string): Promise<Product | null> {
  const auth = await getApiAuth();

  let data: Response;
  try {
    /* Ціни персональні — залежать від типу клієнта, тому не кешуємо */
    data = await gql<Response>(PRODUCT, { variables: { id }, auth });
  } catch {
    return null;
  }

  const p = data.product;
  if (!p) return null;

  const offers = (p.prices?.edges ?? []).map(toOffer);
  /* Основна ціна — найдешевша з тих, що можна купити */
  const buyable = offers.filter((o) => o.canBuy && (o.count ?? 0) > 0);
  const bestOffer =
    buyable.sort((a, b) => (a.price ?? 0) - (b.price ?? 0))[0] ??
    (p.price ? toOffer(p.price) : null);

  const specs = (p.specs?.edges ?? [])
    .filter((s) => s.spec?.name && s.value)
    .map((s) => ({ label: cleanLabel(s.spec!.name!), value: s.value!.trim() }));

  /* Крос-номери можуть повторюватись у різних виробників */
  const seen = new Set<string>();
  const crosses = (p.cross?.edges ?? [])
    .filter((c) => c.num)
    .filter((c) => {
      const key = `${c.manufacturer?.name ?? ""}|${c.num}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((c) => ({ num: c.num!, brand: c.manufacturer?.name ?? null }));

  /* Серед кросів більшість — довідкові номери автовиробника (VAG, SKODA)
     та OEM-таблиці: товару за ними немає й купити їх не можна. Аналогами
     вважаємо лише ті, у яких бекенд віддав ціну. */
  const analogueSeen = new Set<string>();
  const analogues: Analogue[] = (p.cross?.edges ?? []).flatMap((c) => {
    const cp = c.crossProduct;
    const price = cp?.price;
    if (!cp || !price || (price.priceUser ?? price.priceOut) === null)
      return [];
    if (analogueSeen.has(cp.id)) return [];
    analogueSeen.add(cp.id);
    return [
      {
        id: cp.id,
        slug: cp.slug ?? "",
        num: cp.num ?? "",
        name: cp.name?.trim() || "",
        brand: cp.manufacturer?.name ?? null,
        image: cp.images?.[0] ?? null,
        quality: qualityOf(cp.specs?.edges),
        offer: toOffer(price),
      },
    ];
  });

  return {
    id: p.id,
    code: p.code,
    num: p.num ?? "",
    name: p.name ?? "Товар",
    slug: p.slug ?? "",
    images: (p.images ?? []).filter(Boolean),
    brand: p.manufacturer?.name ?? null,
    brandSlug: p.manufacturer?.slug ?? null,
    isFavorite: Boolean(p.isInProductLike),
    weight: p.weight ? Number(p.weight) : null,
    rating: Number(p.rating ?? 0),
    voteCount: p.voteCount ?? 0,
    commentQty: p.commentQty ?? 0,
    bestOffer,
    offers,
    specs,
    crosses,
    analogues,
    quality: qualityOf(p.specs?.edges),
  };
}

/** Заголовок у стилі каталогу: назва, бренд, артикул */
export function productTitle(p: {
  name: string;
  brand: string | null;
  num: string;
}) {
  return [p.name, p.brand, p.num].filter(Boolean).join(", ");
}

/* --------------------------------------------------- Списки товарів */

export type ProductListItem = {
  id: string;
  slug: string;
  num: string;
  name: string;
  /** Усі джерела фото: головне плюс галерея, без дублів */
  images: string[];
  brand: string | null;
  /** Ідентифікатор пропозиції складу — саме його приймає кошик */
  offerId: string | null;
  price: number | null;
  count: number | null;
  canBuy: boolean;
};

type ListResponse = {
  promoProductAll: {
    edges: {
      id: string;
      slug: string | null;
      num: string | null;
      name: string | null;
      image: string | null;
      images: string[] | null;
      manufacturer: { name: string | null } | null;
      price: RawOffer | null;
    }[];
  };
};

const PROMO_PRODUCTS = /* GraphQL */ `
  query PromoProducts($perPage: Int) {
    promoProductAll(perPage: $perPage) {
      edges {
        id
        slug
        num
        name
        image
        images
        manufacturer {
          name
        }
        price {
          id
          priceOut
          priceUser
          priceUser
          count
          deliveryDaysHumanize
          canBuy
        }
      }
    }
  }
`;

/** Спецпропозиції для головної. Порожній масив, якщо API недоступний */
export async function getPromoProducts(
  perPage = 8,
): Promise<ProductListItem[]> {
  const auth = await getApiAuth();

  try {
    const data = await gql<ListResponse>(PROMO_PRODUCTS, {
      variables: { perPage },
      auth,
    });

    return data.promoProductAll.edges.map((p) => ({
      id: p.id,
      slug: p.slug ?? "",
      num: p.num ?? "",
      name: p.name ?? "Товар",
      images: [
        ...new Set([p.image, ...(p.images ?? [])].filter(Boolean)),
      ] as string[],
      brand: p.manufacturer?.name ?? null,
      offerId: p.price?.id ?? null,
      price: p.price?.priceUser ?? p.price?.priceOut ?? null,
      count: p.price?.count ?? null,
      canBuy: Boolean(p.price?.canBuy),
    }));
  } catch {
    return [];
  }
}

type GroupListResponse = {
  productAll: {
    totalCount: number;
    edges: {
      id: string;
      slug: string | null;
      num: string | null;
      name: string | null;
      image: string | null;
      images: string[] | null;
      manufacturer: { name: string | null } | null;
      price: RawOffer | null;
    }[];
  };
};

const GROUP_PRODUCTS = /* GraphQL */ `
  query GroupProducts($group: ID, $page: Int, $perPage: Int) {
    productAll(group: $group, page: $page, perPage: $perPage) {
      totalCount
      edges {
        id
        slug
        num
        name
        image
        images
        manufacturer {
          name
        }
        price {
          id
          priceOut
          priceUser
          priceUser
          count
          deliveryDaysHumanize
          canBuy
        }
      }
    }
  }
`;

/**
 * Товари категорії. Важливо: бекенд ігнорує perPage без page —
 * без нього віддає всю категорію цілком, тому передаємо обидва.
 */
export async function getProductsByGroup(
  groupId: string,
  page = 1,
  perPage = 24,
): Promise<{ items: ProductListItem[]; total: number }> {
  const auth = await getApiAuth();

  try {
    const data = await gql<GroupListResponse>(GROUP_PRODUCTS, {
      variables: { group: groupId, page, perPage },
      auth,
    });

    return {
      total: data.productAll.totalCount,
      items: data.productAll.edges.map((p) => ({
        id: p.id,
        slug: p.slug ?? "",
        num: p.num ?? "",
        name: p.name ?? "Товар",
        images: [
          ...new Set([p.image, ...(p.images ?? [])].filter(Boolean)),
        ] as string[],
        brand: p.manufacturer?.name ?? null,
        offerId: p.price?.id ?? null,
        price: p.price?.priceUser ?? p.price?.priceOut ?? null,
        count: p.price?.count ?? null,
        canBuy: Boolean(p.price?.canBuy),
      })),
    };
  } catch {
    return { items: [], total: 0 };
  }
}

const CAR_PRODUCTS = /* GraphQL */ `
  query CarProducts($simpleCarId: ID, $page: Int, $perPage: Int) {
    productAll(simpleCarId: $simpleCarId, page: $page, perPage: $perPage) {
      totalCount
      edges {
        id
        slug
        num
        name
        image
        images
        manufacturer {
          name
        }
        price {
          id
          priceOut
          priceUser
          priceUser
          count
          deliveryDaysHumanize
          canBuy
        }
      }
    }
  }
`;

/** Товари, сумісні з конкретною модифікацією авто */
export async function getProductsBySimpleCar(
  simpleCarId: string,
  page = 1,
  perPage = 24,
): Promise<{ items: ProductListItem[]; total: number }> {
  const auth = await getApiAuth();

  try {
    const data = await gql<GroupListResponse>(CAR_PRODUCTS, {
      variables: { simpleCarId, page, perPage },
      auth,
    });

    return {
      total: data.productAll.totalCount,
      items: data.productAll.edges.map((p) => ({
        id: p.id,
        slug: p.slug ?? "",
        num: p.num ?? "",
        name: p.name ?? "Товар",
        images: [
          ...new Set([p.image, ...(p.images ?? [])].filter(Boolean)),
        ] as string[],
        brand: p.manufacturer?.name ?? null,
        offerId: p.price?.id ?? null,
        price: p.price?.priceUser ?? p.price?.priceOut ?? null,
        count: p.price?.count ?? null,
        canBuy: Boolean(p.price?.canBuy),
      })),
    };
  } catch {
    return { items: [], total: 0 };
  }
}

const SEARCH_PRODUCTS = /* GraphQL */ `
  query SearchProducts($num: String, $page: Int, $perPage: Int) {
    productAll(num: $num, page: $page, perPage: $perPage) {
      totalCount
      edges {
        id
        slug
        num
        name
        image
        images
        manufacturer {
          name
        }
        price {
          id
          priceOut
          priceUser
          priceUser
          count
          deliveryDaysHumanize
          canBuy
        }
      }
    }
  }
`;

/**
 * Пошук за артикулом або OEM-номером.
 *
 * Свідомо не використовуємо productSearch: він уміє шукати за початком
 * номера й за назвою виробника, але на бекенді виконується 45–55 секунд
 * навіть без цін. productAll(num:) шукає точним збігом і відповідає за 0.15с,
 * причому знаходить і за OEM, не лише за артикулом.
 */
export async function searchProducts(
  query: string,
  page = 1,
  perPage = 24,
): Promise<{ items: ProductListItem[]; total: number }> {
  const num = query.trim();
  if (!num) return { items: [], total: 0 };

  const auth = await getApiAuth();

  try {
    const data = await gql<GroupListResponse>(SEARCH_PRODUCTS, {
      variables: { num, page, perPage },
      auth,
    });

    return {
      total: data.productAll.totalCount,
      items: data.productAll.edges.map((p) => ({
        id: p.id,
        slug: p.slug ?? "",
        num: p.num ?? "",
        name: p.name ?? "Товар",
        images: [
          ...new Set([p.image, ...(p.images ?? [])].filter(Boolean)),
        ] as string[],
        brand: p.manufacturer?.name ?? null,
        offerId: p.price?.id ?? null,
        price: p.price?.priceUser ?? p.price?.priceOut ?? null,
        count: p.price?.count ?? null,
        canBuy: Boolean(p.price?.canBuy),
      })),
    };
  } catch {
    return { items: [], total: 0 };
  }
}
