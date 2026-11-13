import { gql, mediaUrl } from "@/lib/api/graphql";

/* Довідники каталогу змінюються рідко, тож тримаємо їх у кеші Next
   на годину — інакше кожен захід на сторінку бив би по бекенду. */
const REVALIDATE = 60 * 60;

export type CatalogCategory = {
  id: string;
  slug: string;
  name: string;
};

export type CarBrand = {
  id: string;
  slug: string;
  name: string;
  logo: string | null;
  carsCount: number;
};

const CATEGORIES = /* GraphQL */ `
  query CatalogCategories {
    productGroupAll(level: 0) {
      edges {
        id
        slug
        name
        isActive
        children {
          edges {
            id
            isActive
            children {
              edges {
                id
                isActive
              }
            }
          }
        }
      }
    }
  }
`;

const CAR_BRANDS = /* GraphQL */ `
  query CatalogCarBrands {
    brandAll {
      edges {
        id
        slug
        name
        image(size: "300x300")
        carsCount
      }
    }
    carSimpleBrands
  }
`;

type RawChildren = { edges: { id: string; isActive: boolean | null }[] } | null;

type CategoriesResponse = {
  productGroupAll: {
    edges: {
      id: string;
      slug: string | null;
      name: string | null;
      isActive: boolean | null;
      children: {
        edges: {
          id: string;
          isActive: boolean | null;
          children: RawChildren;
        }[];
      } | null;
    }[];
  };
};

type BrandsResponse = {
  brandAll: {
    edges: {
      id: string;
      slug: string | null;
      name: string | null;
      image: string | null;
      carsCount: number | null;
    }[];
  };
};

/**
 * Скільки товарів у кожній групі — одним запитом на всі одразу.
 *
 * Потрібно, щоб не виводити порожні категорії: у довіднику є групи, які
 * не мають ні товарів, ні підкатегорій, і кнопка вела в нікуди. Перевірка
 * за даними, а не за списком винятків: на бойовій базі ті самі групи
 * можуть бути наповнені, і тоді вони з'являться самі.
 */
async function productCounts(ids: string[]): Promise<Record<string, number>> {
  if (!ids.length) return {};

  const vars = ids.map((_, i) => `$g${i}: ID!`).join(", ");
  const body = ids
    .map(
      (_, i) =>
        `g${i}: productAll(group: $g${i}, page: 1, perPage: 1) { totalCount }`,
    )
    .join(" ");

  try {
    const data = await gql<
      Record<string, { totalCount: number | null } | null>
    >(`query GroupCounts(${vars}) { ${body} }`, {
      variables: Object.fromEntries(ids.map((id, i) => [`g${i}`, id])),
      revalidate: REVALIDATE,
      tags: ["catalog-categories"],
    });

    return Object.fromEntries(
      ids.map((id, i) => [id, data[`g${i}`]?.totalCount ?? 0]),
    );
  } catch {
    /* Не порахували — краще показати все, ніж сховати живі категорії */
    return Object.fromEntries(ids.map((id) => [id, 1]));
  }
}

/** Лишає тільки ті групи, з яких є куди перейти */
async function withContent<T extends { id: string; hasChildren: boolean }>(
  groups: T[],
): Promise<T[]> {
  const needCheck = groups.filter((g) => !g.hasChildren).map((g) => g.id);
  const counts = await productCounts(needCheck);
  return groups.filter((g) => g.hasChildren || (counts[g.id] ?? 0) > 0);
}

/** Групи товарів верхнього рівня. Порожній масив, якщо API недоступний */
export async function getCatalogCategories(): Promise<CatalogCategory[]> {
  try {
    const data = await gql<CategoriesResponse>(CATEGORIES, {
      revalidate: REVALIDATE,
      tags: ["catalog-categories"],
    });

    const groups = data.productGroupAll.edges
      .filter((c) => c.isActive !== false && c.slug && c.name)
      .map((c) => ({
        id: c.id,
        slug: c.slug!,
        name: c.name!,
        children: (c.children?.edges ?? [])
          .filter((k) => k.isActive !== false)
          .map((k) => ({
            id: k.id,
            hasChildren: (k.children?.edges ?? []).some(
              (x) => x.isActive !== false,
            ),
          })),
      }));

    /* Перевіряти саму наявність дітей замало: трапляються гілки, де всі
       підкатегорії порожні — тоді батько теж веде в нікуди. Тому дивимось
       на два рівні: спершу чи жива хоч одна дитина, потім чи є товари в
       самого батька. */
    const childCounts = await productCounts(
      groups.flatMap((g) =>
        g.children.filter((k) => !k.hasChildren).map((k) => k.id),
      ),
    );

    const hasLiveChild = (g: (typeof groups)[number]) =>
      g.children.some((k) => k.hasChildren || (childCounts[k.id] ?? 0) > 0);

    const ownCounts = await productCounts(
      groups.filter((g) => !hasLiveChild(g)).map((g) => g.id),
    );

    return groups
      .filter((g) => hasLiveChild(g) || (ownCounts[g.id] ?? 0) > 0)
      .map(({ id, slug, name }) => ({ id, slug, name }));
  } catch {
    return [];
  }
}

/**
 * Марки авто. У бекенді два дерева авто: brandAll має логотипи, а фільтр
 * товарів працює лише через carSimple*. Вони не збігаються, тому показуємо
 * перетин — інакше частина марок вела б у глухий кут.
 */
export async function getCarBrands(): Promise<CarBrand[]> {
  try {
    const data = await gql<
      BrandsResponse & { carSimpleBrands: [string, string][] }
    >(CAR_BRANDS, { revalidate: REVALIDATE, tags: ["catalog-car-brands"] });

    const withProducts = new Set(data.carSimpleBrands.map(([slug]) => slug));

    return data.brandAll.edges
      .filter((b) => b.slug && b.name && withProducts.has(b.slug))
      .map((b) => ({
        id: b.id,
        slug: b.slug!,
        name: b.name!,
        logo: mediaUrl(b.image),
        carsCount: b.carsCount ?? 0,
      }));
  } catch {
    return [];
  }
}

export type CategoryNode = {
  id: string;
  slug: string;
  name: string;
};

export type CategoryDetails = CategoryNode & {
  /** Шлях від кореня — для хлібних крихт */
  breadcrumbs: CategoryNode[];
  /** Підкатегорії. Порожньо означає, що це листок з товарами */
  children: CategoryNode[];
};

const CATEGORY = /* GraphQL */ `
  query CatalogCategory($slug: String!) {
    productGroup(slug: $slug) {
      id
      slug
      name
      breadCrumbs {
        id
        slug
        name
      }
      children {
        edges {
          id
          slug
          name
          isActive
          children {
            edges {
              id
              isActive
            }
          }
        }
      }
    }
  }
`;

type CategoryResponse = {
  productGroup: {
    id: string;
    slug: string | null;
    name: string | null;
    breadCrumbs:
      { id: string; slug: string | null; name: string | null }[] | null;
    children: {
      edges: {
        id: string;
        slug: string | null;
        name: string | null;
        isActive: boolean | null;
        children: RawChildren;
      }[];
    } | null;
  } | null;
};

function clean(
  list:
    | { id: string; slug: string | null; name: string | null }[]
    | undefined
    | null,
): CategoryNode[] {
  return (list ?? [])
    .filter((c) => c.slug && c.name)
    .map((c) => ({ id: c.id, slug: c.slug!, name: c.name! }));
}

/** Категорія з підкатегоріями. null, якщо такої немає або API недоступний */
/**
 * `null` означає саме «такої категорії немає» — тоді сторінка віддає 404.
 * Збій запиту свідомо не перехоплюємо: якщо його проглотити й повернути
 * `null`, недоступний бекенд перетворював би живу індексовану категорію на
 * 404. Нехай краще вилетить 500 — його Google повторює, а 404 може
 * прибрати сторінку з індексу.
 */
export async function getCategory(
  slug: string,
): Promise<CategoryDetails | null> {
  const data = await gql<CategoryResponse>(CATEGORY, {
    variables: { slug },
    revalidate: REVALIDATE,
    tags: ["catalog-categories"],
  });

  const g = data.productGroup;
  if (!g?.slug || !g.name) return null;

  /* Та сама перевірка, що й на сторінці каталогу: підкатегорія без
     власних дітей і без товарів — посилання в нікуди */
  const kids = (g.children?.edges ?? [])
    .filter((c) => c.isActive !== false && c.slug && c.name)
    .map((c) => ({
      id: c.id,
      slug: c.slug!,
      name: c.name!,
      hasChildren: (c.children?.edges ?? []).some((k) => k.isActive !== false),
    }));

  const alive = await withContent(kids);

  return {
    id: g.id,
    slug: g.slug,
    name: g.name,
    breadcrumbs: clean(g.breadCrumbs),
    children: alive.map(({ id, slug, name }) => ({ id, slug, name })),
  };
}

/* ---------------------------------------------- Підбір за автомобілем ---
   Гілка carSimple* — єдина, за якою бекенд уміє фільтрувати товари
   (через productAll(simpleCarId:)). Усі кроки повертають пари [slug, назва]
   або прості значення, тому нормалізуємо їх тут. */

export type NamedSlug = { slug: string; name: string };

export type CarModification = {
  id: string;
  name: string;
};

const CAR_MODELS = /* GraphQL */ `
  query CarModels($brandSlug: String!) {
    carSimpleModels(brandSlug: $brandSlug)
  }
`;

const CAR_YEARS = /* GraphQL */ `
  query CarYears($brandSlug: String!, $modelSlug: String!) {
    carSimpleYears(brandSlug: $brandSlug, modelSlug: $modelSlug)
  }
`;

const CAR_MODIFICATIONS = /* GraphQL */ `
  query CarModifications($brandSlug: String, $modelSlug: String, $year: Int) {
    carSimpleAll(
      brandSlug: $brandSlug
      modelSlug: $modelSlug
      year: $year
      first: 200
    ) {
      edges {
        node {
          id
          modification
        }
      }
    }
  }
`;

export async function getCarModels(brandSlug: string): Promise<NamedSlug[]> {
  try {
    const data = await gql<{ carSimpleModels: [string, string][] }>(
      CAR_MODELS,
      {
        variables: { brandSlug },
        revalidate: REVALIDATE,
        tags: ["catalog-cars"],
      },
    );
    return data.carSimpleModels.map(([slug, name]) => ({ slug, name }));
  } catch {
    return [];
  }
}

/** Роки випуску моделі. Бекенд віддає їх масивами з одного елемента */
export async function getCarYears(
  brandSlug: string,
  modelSlug: string,
): Promise<number[]> {
  try {
    const data = await gql<{ carSimpleYears: string[][] }>(CAR_YEARS, {
      variables: { brandSlug, modelSlug },
      revalidate: REVALIDATE,
      tags: ["catalog-cars"],
    });
    return data.carSimpleYears.map(([y]) => Number(y)).filter(Boolean);
  } catch {
    return [];
  }
}

export async function getCarModifications(
  brandSlug: string,
  modelSlug: string,
  year: number,
): Promise<CarModification[]> {
  try {
    const data = await gql<{
      carSimpleAll: {
        edges: { node: { id: string; modification: string | null } }[];
      };
    }>(CAR_MODIFICATIONS, {
      variables: { brandSlug, modelSlug, year },
      revalidate: REVALIDATE,
      tags: ["catalog-cars"],
    });

    return data.carSimpleAll.edges
      .filter((e) => e.node.modification)
      .map((e) => ({ id: e.node.id, name: e.node.modification! }));
  } catch {
    return [];
  }
}

/* --------------------------------------------- Заявка на підбір деталі ---
   Довідники для форми запиту. Бекенд віддає їх парами [значення, підпис]. */

const REQUEST_OPTIONS = /* GraphQL */ `
  query RequestOptions {
    carBodies
    carTransmission
    carDrive
    brandAll {
      edges {
        id
        name
      }
    }
  }
`;

export type RequestFormOptions = {
  brands: { id: string; name: string }[];
  bodies: { value: string; label: string }[];
  transmissions: { value: string; label: string }[];
  drives: { value: string; label: string }[];
};

const pairs = (list: [string, string][] | undefined) =>
  (list ?? []).map(([value, label]) => ({ value, label }));

export async function getRequestFormOptions(): Promise<RequestFormOptions> {
  try {
    const data = await gql<{
      carBodies: [string, string][];
      carTransmission: [string, string][];
      carDrive: [string, string][];
      brandAll: { edges: { id: string; name: string | null }[] };
    }>(REQUEST_OPTIONS, { revalidate: REVALIDATE, tags: ["request-options"] });

    return {
      brands: data.brandAll.edges
        .filter((b) => b.name)
        .map((b) => ({ id: b.id, name: b.name! })),
      bodies: pairs(data.carBodies),
      transmissions: pairs(data.carTransmission),
      drives: pairs(data.carDrive),
    };
  } catch {
    return { brands: [], bodies: [], transmissions: [], drives: [] };
  }
}

/**
 * Чи існує група товарів з таким slug. Потрібно для редіректів зі старих
 * адрес каталогу: на старому сайті категорія жила за /catalog/<slug>, а
 * там же в нас сторінка постачальника. Тому слуг, який постачальником не
 * є, перевіряємо тут і ведемо на /catalog/category/<slug>.
 */
export async function categoryExists(slug: string): Promise<boolean> {
  const data = await gql<{ productGroup: { id: string } | null }>(
    /* GraphQL */ `
      query CategoryExists($slug: String!) {
        productGroup(slug: $slug) {
          id
        }
      }
    `,
    {
      variables: { slug },
      revalidate: REVALIDATE,
      tags: ["catalog-categories", `catalog-category:${slug}`],
    },
  );
  return Boolean(data.productGroup?.id);
}
