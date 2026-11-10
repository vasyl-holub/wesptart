import type { NextConfig } from "next";

/**
 * Сторінки старого сайту, які ми злили в три нові. 308 замість 301:
 * у Next це і є «постійний» редірект, він додатково зберігає метод запиту,
 * а пошукові системи враховують його так само, як 301.
 */
const mergedPages: { from: string; to: string }[] = [
  { from: "/pages/importrer-avtozapchastyn", to: "/about" },
  { from: "/pages/ai-platforma", to: "/about" },
  { from: "/pages/social-position", to: "/about" },
  { from: "/pages/avtozapchastini-z-polshhi", to: "/about" },

  { from: "/pages/garantiya-povernennya", to: "/warranty" },

  { from: "/pages/avtozapchastini-polcar", to: "/catalog/polcar" },
  { from: "/pages/avtozapchastini-signeda", to: "/catalog/signeda" },
  { from: "/pages/avtozapchastini-nty", to: "/catalog/nty" },
  { from: "/pages/depo", to: "/catalog/depo" },
  { from: "/pages/srl", to: "/catalog/srline" },
  { from: "/manufacturers", to: "/catalog" },

  { from: "/pages/how-to-buy", to: "/delivery" },
  { from: "/pages/dostavka-i-oplata", to: "/delivery" },

  { from: "/pages/partner", to: "/cooperation" },
  { from: "/pages/dropshipping-avtozapchastyny", to: "/cooperation" },
  { from: "/pages/optovi-umovy", to: "/cooperation" },

  { from: "/users/login", to: "/login" },
  { from: "/users/password/reset", to: "/password/reset" },
  { from: "/pages/pidbir-avtozapchastyn", to: "/requests/create" },
  { from: "/pages/contacts", to: "/contacts" },
  { from: "/pages/article", to: "/blog" },
  { from: "/pages/news", to: "/blog" },

  { from: "/pages/price-list", to: "/price-list" },
  { from: "/pages/krosi", to: "/cross" },
  { from: "/pages/katalog-polcar", to: "/catalog/polcar" },
  { from: "/feedback/create", to: "/feedback" },
  { from: "/feedback/claim", to: "/claim" },

  /* Знайдені ревізією sitemap: ці адреси індексовані, але редіректів на
     них не було. Назви звірені по <title> живого сайту. */
  { from: "/pages/brands", to: "/catalog" },
  { from: "/pages/catalogs", to: "/catalog" },
  { from: "/pages/suppliers", to: "/catalog" },
  { from: "/pages/cooperation", to: "/cooperation" },
  /* «Умови покупки» — про оплату й доставку, тобто наш /delivery */
  { from: "/pages/conditions", to: "/delivery" },
  /* «Інформація» була сторінкою-хабом із посиланнями на решту */
  { from: "/pages/information", to: "/about" },
];

/**
 * Шаблонні редіректи — ними закриваємо адреси, яких у старому індексі
 * мільйони і які перекладаються на нові механічно. Вивірено по
 * /sitemaps/sitemap.xml живого сайту: див. docs/seo-url-map.md.
 *
 * Негативні перевірки `(?!car/|category/)` обов'язкові: без них правило
 * каталогу з'їло б власні маршрути нового сайту, а /catalog/category/<slug>
 * зациклився б сам на себе.
 */
const patternRedirects: { source: string; destination: string }[] = [
  /* Основна форма адреси товару на старому сайті — /part/<slug>/info/<id>.
     Таких у sitemap ~2,85 млн, тобто майже весь індекс. Нова адреса та
     сама без /info, тому переклад однозначний. */
  { source: "/part/:slug/info/:id", destination: "/part/:slug/:id" },

  /* Статті: всі 35 slug зі старого sitemap збігаються з тими, що віддає
     API, тому веде один в один */
  { source: "/pages/article/:slug", destination: "/blog/:slug" },

  /* Категорії були вкладені до трьох рівнів, у нас вони пласкі. Останній
     сегмент унікальний на всі 135 адрес (звірено зі slug у
     productGroupAll), тому ведемо саме на нього. */
  {
    source: "/catalog/:a((?!car/|category/)[^/]+)/:b/:c",
    destination: "/catalog/category/:c",
  },
  {
    source: "/catalog/:a((?!car/|category/)[^/]+)/:b",
    destination: "/catalog/category/:b",
  },

  /* Марок тут немає свідомо: у 24 з 78 slug не збігається або сторінки
     ще немає, тому розв'язуємо їх у app/brands/[slug] — там видно
     довідник і можна не впасти в 404. */

  /* Google знає карту сайту за старою адресою */
  { source: "/sitemaps/sitemap.xml", destination: "/sitemap.xml" },
];

/**
 * Сторінки, де показані ціни. Вони залежать від типу клієнта: оптовик,
 * СТО чи магазин бачать не те, що анонім. Тому HTML цих адрес не можна
 * складати в спільний кеш — ні на CDN, ні на зворотному проксі.
 */
const pricedRoutes = [
  "/",
  "/blog",
  "/blog/:slug",
  "/cart",
  "/checkout",
  "/catalog/category/:slug",
  "/catalog/car/:brand/:model",
  "/part/:slug/:id",
  "/promo",
  "/search",
  "/account/:path*",
];

/**
 * З `trailingSlash: true` ціль без / на кінці дає зайвий крок: наш 308
 * веде на /contacts, а Next одразу шле далі на /contacts/. Тому слеш
 * доклеюємо тут, а не вручну в кожному правилі. Файли (зі точкою в
 * останньому сегменті) лишаємо як є — до них слеш не додається.
 */
function withSlash(destination: string) {
  const last = destination.split("/").pop() ?? "";
  if (last.includes(".") || destination.endsWith("/")) return destination;
  return `${destination}/`;
}

const nextConfig: NextConfig = {
  /* Старий сайт індексований виключно з / на кінці: /part/<slug>/<id>/,
     /catalog/<slug>/ тощо. Зі слешем ці адреси віддають 200 замість
     редіректу, тобто зберігаються буквально — цього і вимагає ТЗ.
     Побічно це прибирає зайвий крок нормалізації з усіх ланцюжків. */
  trailingSlash: true,

  /* Фронт має жити на піддомені westpart.ua, щоб браузер віддавав
     сесійну куку Django. Локально це local.westpart.ua → 127.0.0.1
     (прописано у hosts), тому dev-сервер має приймати цей origin. */
  allowedDevOrigins: ["local.westpart.ua", "*.westpart.ua"],

  async headers() {
    return pricedRoutes.map((source) => ({
      source,
      headers: [
        /* private забороняє спільний кеш, no-store — будь-який.
           Vary: Cookie лишаємо як підстраховку для проксі, що
           дивляться тільки на нього. */
        {
          key: "Cache-Control",
          value: "private, no-store, must-revalidate",
        },
        { key: "Vary", value: "Cookie" },
      ],
    }));
  },

  async redirects() {
    return [
      ...mergedPages.map(({ from, to }) => ({
        source: from,
        destination: withSlash(to),
        permanent: true,
      })),
      ...patternRedirects.map(({ source, destination }) => ({
        source,
        destination: withSlash(destination),
        permanent: true,
      })),
    ];
  },

  images: {
    remotePatterns: [
      /* Фото товарів і статей лежать у /media на бекенді */
      {
        protocol: "https",
        hostname: "test.westpart.ua",
        pathname: "/media/**",
      },
      { protocol: "https", hostname: "westpart.ua", pathname: "/media/**" },
      /* Фото товарів від постачальників лежать на окремому домені */
      { protocol: "https", hostname: "img.westpart.ua" },
      /* Аватари авторів відгуків з Google Places */
      { protocol: "https", hostname: "*.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
