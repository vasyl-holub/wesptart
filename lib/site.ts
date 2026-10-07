export const site = {
  name: "WestPart",
  tagline: "магазин автозапчастин",
  lead: "B2B-платформа автозапчастин з Польщі та ЄС",
  description:
    "Автозапчастини з Польщі та ЄС в одному B2B-кабінеті. Кузовні деталі, оптика, охолодження, механіка. Polcar, Signeda, NTY, DEPO, SRLine.",
  phone: "050-713-55-00",
  phoneHref: "tel:+380507135500",
  email: "info@westpart.ua",
  /* Головний офіс і склад — Луцьк. Київ це лише пункт видачі,
     повний перелік адрес і графіків — у lib/contacts.ts */
  city: "м. Луцьк, вул. Конякіна, 18а",
  workingHours: "Пн–Пт: 9:00–17:00, Сб: 9:00–13:00",
  replyTime: "Відповідаємо протягом 5–10 хв",
  viber: "viber://chat?number=%2B380507135500",
  telegram: "https://t.me/westpart",
} as const;

/** Смуга під шапкою: регіон і найближчий пункт видачі */
/** Франшиза має власний контакт, відмінний від загального */
export const franchise = {
  manager: "Сергій",
  phone: "+38 (095) 212-24-33",
  phoneHref: "tel:+380952122433",
} as const;

/**
 * Запасний перелік областей: той самий, що віддає regionAll, на випадок
 * коли бекенд недоступний. Порядок алфавітний — як у смузі над шапкою.
 */
export const regions = [
  "АР Крим",
  "Вінницька",
  "Волинська",
  "Дніпропетровська",
  "Донецька",
  "Житомирська",
  "Закарпатська",
  "Запорізька",
  "Івано-Франківська",
  "Київська",
  "Кіровоградська",
  "Луганська",
  "Львівська",
  "Миколаївська",
  "Одеська",
  "Полтавська",
  "Рівненська",
  "Сумська",
  "Тернопільська",
  "Харківська",
  "Херсонська",
  "Хмельницька",
  "Черкаська",
  "Чернівецька",
  "Чернігівська",
] as const;

/** Домашня область магазину — Луцьк, тож нею і відкриваємо смугу */
export const defaultRegion = "Волинська";

export const pickup = {
  address: "м. Луцьк, вул. Конякіна 18а",
  hours: "Пн-Пт 09:00-18:00, Сб 10:00-15:00",
} as const;

export type NavLink = { label: string; href: string; note?: string };

export type NavGroup = {
  label: string;
  href?: string;
  items?: NavLink[];
};

export const mainNav: NavGroup[] = [
  {
    label: "Каталог",
    href: "/catalog",
    items: [
      {
        label: "Polcar",
        href: "/catalog/polcar",
        note: "Кузовні деталі, оптика",
      },
      { label: "Signeda", href: "/catalog/signeda", note: "Оптика та кузов" },
      { label: "NTY", href: "/catalog/nty", note: "Ходова, електрика" },
      { label: "DEPO", href: "/catalog/depo", note: "Світлотехніка" },
      { label: "SRLine", href: "/catalog/srline", note: "Кузовний ремонт" },
      { label: "Інші бренди", href: "/catalog" },
    ],
  },
  { label: "Доставка і оплата", href: "/delivery" },
  /* «Гарантія» живе у футері й на сторінці доставки — у шапці вона
     займала місце, якого потребує завжди відкрите поле пошуку */
  { label: "Для бізнесу", href: "/cooperation" },
  { label: "Франшиза", href: "/franchise" },
  { label: "Про нас", href: "/about" },
  { label: "Контакти", href: "/contacts" },
];

export const footerNav: { title: string; items: NavLink[] }[] = [
  {
    title: "Покупцям",
    items: [
      { label: "B2B-кабінет", href: "/login" },
      { label: "Доставка і оплата", href: "/delivery" },
      { label: "Гарантія та повернення", href: "/warranty" },
      { label: "Рекламація", href: "/claim" },
      { label: "Прайс-лист", href: "/price-list" },
      { label: "Крос-номери", href: "/cross" },
      { label: "Для бізнесу", href: "/cooperation" },
      { label: "Питання та відповіді", href: "/faq" },
    ],
  },
  {
    title: "Каталоги",
    items: [
      { label: "Polcar", href: "/catalog/polcar" },
      { label: "Signeda", href: "/catalog/signeda" },
      { label: "NTY", href: "/catalog/nty" },
      { label: "DEPO", href: "/catalog/depo" },
      { label: "SRLine", href: "/catalog/srline" },
      { label: "Інші бренди", href: "/catalog" },
    ],
  },
  {
    title: "Компанія",
    items: [
      { label: "Про нас", href: "/about" },
      { label: "Блог", href: "/blog" },
      { label: "Франшиза", href: "/franchise" },
      { label: "Контакти", href: "/contacts" },
      { label: "Залишити відгук", href: "/feedback" },
    ],
  },
];

export const socials = [
  { label: "YouTube", href: "https://youtube.com/", icon: "youtube" },
  { label: "Instagram", href: "https://instagram.com/", icon: "instagram" },
  { label: "Facebook", href: "https://facebook.com/", icon: "facebook" },
  { label: "TikTok", href: "https://tiktok.com/", icon: "tiktok" },
  { label: "Viber", href: site.viber, icon: "viber" },
  { label: "Telegram", href: site.telegram, icon: "telegram" },
] as const;
