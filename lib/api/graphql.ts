/**
 * Клієнт GraphQL-API WestPart.
 *
 * Усі запити йдуть з сервера Next.js, а не з браузера. Через це:
 *  — CORS не виникає взагалі;
 *  — сесію користувача ми тримаємо у себе й прокидаємо заголовком Cookie,
 *    тож фронту не обов'язково жити на піддомені westpart.ua.
 */

const ENDPOINT =
  process.env.WESTPART_API_URL ?? "https://test.westpart.ua/api/graphql/";

export type GraphQLErrorItem = {
  message: string;
  path?: (string | number)[];
};

/**
 * Приводить шлях до медіафайлу до повного URL.
 * Бекенд віддає то абсолютні посилання, то шляхи від кореня (/media/...),
 * а в іменах файлів трапляється кирилиця — її треба закодувати.
 */
export function mediaUrl(path?: string | null) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return encodeURI(path);
  const origin = new URL(ENDPOINT).origin;
  return encodeURI(`${origin}${path.startsWith("/") ? "" : "/"}${path}`);
}

/**
 * Те саме перетворення для документів бекенда: `printUrl` і `checkUrl`
 * у замовленні приходять шляхом від кореня (/orders/139204/print/),
 * і без origin браузер шукав би їх на нашому домені, а не на Django.
 */
export const backendUrl = mediaUrl;

export class GraphQLRequestError extends Error {
  constructor(
    message: string,
    readonly errors: GraphQLErrorItem[],
  ) {
    super(message);
    this.name = "GraphQLRequestError";
  }
}

export type ApiAuth = {
  /** Значення cookie sessionid від Django */
  sessionid?: string;
  /** Django вимагає csrftoken для «небезпечних» методів, коли є сесія */
  csrftoken?: string;
};

type RequestOptions = {
  variables?: Record<string, unknown>;
  auth?: ApiAuth;
  /**
   * Кеш Next.js. За замовчуванням не кешуємо: ціни й наявність
   * змінюються, а для частини клієнтів вони ще й персональні.
   * Для довідників (бренди, регіони, контент) вказуємо revalidate явно.
   */
  revalidate?: number | false;
  tags?: string[];
  signal?: AbortSignal;
};

export type RawResult<T> = {
  data: T;
  /** Set-Cookie з відповіді — звідси дістаємо сесію після логіну */
  setCookie: string[];
};

function buildHeaders(auth?: ApiAuth): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const cookies: string[] = [];
  if (auth?.sessionid) cookies.push(`sessionid=${auth.sessionid}`);
  if (auth?.csrftoken) {
    cookies.push(`csrftoken=${auth.csrftoken}`);
    headers["X-CSRFToken"] = auth.csrftoken;
    /* Django звіряє Referer для POST по HTTPS із сесією */
    headers["Referer"] = new URL(ENDPOINT).origin;
  }
  if (cookies.length) headers["Cookie"] = cookies.join("; ");

  return headers;
}

function readSetCookie(res: Response): string[] {
  /* getSetCookie() — єдиний спосіб дістати кілька Set-Cookie з одного
     заголовка; у старих рантаймах його немає, тому є запасний шлях */
  const headers = res.headers as Headers & { getSetCookie?: () => string[] };
  if (typeof headers.getSetCookie === "function") return headers.getSetCookie();
  const single = res.headers.get("set-cookie");
  return single ? [single] : [];
}

/** Запит із доступом до Set-Cookie — потрібен для логіну й реєстрації */
export async function gqlRaw<T>(
  query: string,
  { variables, auth, revalidate, tags, signal }: RequestOptions = {},
): Promise<RawResult<T>> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: buildHeaders(auth),
    body: JSON.stringify({ query, variables }),
    signal,
    ...(revalidate === undefined
      ? { cache: "no-store" as const }
      : {
          next: {
            revalidate: revalidate === false ? undefined : revalidate,
            tags,
          },
        }),
  });

  if (!res.ok && res.status >= 500) {
    throw new GraphQLRequestError(
      `Бекенд відповів ${res.status}. Спробуйте пізніше.`,
      [],
    );
  }

  const json = (await res.json()) as {
    data?: T;
    errors?: GraphQLErrorItem[];
  };

  /* Часткові дані з помилками теж можливі — але якщо data порожня,
     працювати нема з чим */
  if (json.errors?.length && json.data == null) {
    throw new GraphQLRequestError(json.errors[0].message, json.errors);
  }

  if (json.data == null) {
    throw new GraphQLRequestError("Порожня відповідь від API", []);
  }

  /* Коли резолвер падає, бекенд віддає 200 із помилкою в `errors`, але
     `data` лишається обʼєктом, де всі поля null. Без цієї перевірки
     мутація виглядала б успішною: виклик не кидає, а payload порожній,
     тож перевірка `payload?.errors` нічого не знаходить. Саме так
     «успішно опублікований» відгук нікуди не зберігався. */
  if (json.errors?.length && typeof json.data === "object") {
    const fields = Object.values(json.data as Record<string, unknown>);
    if (fields.length > 0 && fields.every((v) => v === null)) {
      throw new GraphQLRequestError(json.errors[0].message, json.errors);
    }
  }

  return { data: json.data, setCookie: readSetCookie(res) };
}

export async function gql<T>(
  query: string,
  options: RequestOptions = {},
): Promise<T> {
  const { data } = await gqlRaw<T>(query, options);
  return data;
}
