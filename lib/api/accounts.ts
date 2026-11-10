import { backendUrl, gql } from "@/lib/api/graphql";
import { getApiAuth } from "@/lib/api/session";

/* Взаєморозрахунки зі старого кабінету: рух по рахунку клієнта за період.
   Кожен рядок бекенд уміє віддати документом — звідси й «Виписки», які
   показують ті самі записи, але тільки з боку друку й вигрузки. */

export type AccountRow = {
  id: string;
  /** Людська назва операції від бекенду («Замовлення», «Оплата») */
  type: string;
  /** Код виду операції; на що саме він мапиться — питання до замовника */
  variant: number | null;
  date: string;
  number: number | null;
  /** Скільки замовлень стоїть за записом */
  orders: number | null;
  /** Сума операції в касовій валюті */
  value: number | null;
  currency: string | null;
  /** Сума в тому вигляді, в якому її веде бекенд */
  sourceValue: string | null;
  /** Залишок після операції */
  balance: string | null;
  printUrl: string | null;
  csvUrl: string | null;
};

export type AccountPage = {
  items: AccountRow[];
  totalCount: number;
  pagesCount: number;
};

const EMPTY: AccountPage = { items: [], totalCount: 0, pagesCount: 0 };

const ACCOUNT_ALL = /* GraphQL */ `
  query Accounts(
    $between: DateRangeFieldInput!
    $page: Int!
    $perPage: Int!
    $variant: Int
  ) {
    accountAll(
      between: $between
      page: $page
      perPage: $perPage
      variant: $variant
    ) {
      totalCount
      pagesCount
      edges {
        id
        type
        variant
        date
        number
        orders
        sourceValue
        balance
        cashCurrency
        cashValue
        printUrl
        csvUrl
      }
    }
  }
`;

type AccountsResponse = {
  accountAll: {
    totalCount: number | null;
    pagesCount: number | null;
    edges: {
      id: string;
      type: string | null;
      variant: number | null;
      date: string;
      number: number | null;
      orders: number | null;
      sourceValue: string | null;
      balance: string | null;
      cashCurrency: string | null;
      cashValue: number | null;
      printUrl: string | null;
      csvUrl: string | null;
    }[];
  } | null;
};

/**
 * Період для `between` обов'язковий на боці API, тому сторінки кабінету
 * завжди передають готові межі — за замовчуванням останній місяць.
 */
export async function getAccountRows({
  from,
  to,
  page = 1,
  perPage = 20,
  variant,
}: {
  from: string;
  to: string;
  page?: number;
  perPage?: number;
  variant?: number;
}): Promise<AccountPage> {
  const auth = await getApiAuth();
  if (!auth) return EMPTY;

  try {
    const data = await gql<AccountsResponse>(ACCOUNT_ALL, {
      auth,
      variables: {
        between: { start: from, end: to },
        page,
        perPage,
        variant,
      },
    });

    const conn = data.accountAll;
    if (!conn) return EMPTY;

    return {
      items: conn.edges.map((a) => ({
        id: a.id,
        type: a.type ?? "",
        variant: a.variant,
        date: a.date,
        number: a.number,
        orders: a.orders,
        value: a.cashValue,
        currency: a.cashCurrency,
        sourceValue: a.sourceValue,
        balance: a.balance,
        printUrl: backendUrl(a.printUrl),
        csvUrl: backendUrl(a.csvUrl),
      })),
      totalCount: conn.totalCount ?? 0,
      pagesCount: conn.pagesCount ?? 0,
    };
  } catch {
    return EMPTY;
  }
}
